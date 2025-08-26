import { CustomElementExport,HtmlActionLabelMap,CustomTag,HtmlActions} from '@types'
import { createElement,createCustomElement, removeChilds, showMessage,removeEle} from '@utils'
import { htmlActions } from '@config'
export const myActions:CustomElementExport<'my-actions'> = {
    tagName:'my-actions',
    createNode(shadowRoot, options, stylePromise) {
        // 收集action-item的click。用于返回时候执行逻辑
        // label,options,status
        const actionClickCacheList:Array<[HtmlActions[number]['label'],any,any]> = [];
        // 更新action-body & action-head激活的状态
        function fireActionItem(label:HtmlActions[number]['label'],options:any,status:any){
            const actionHeadNode = shadowRoot.querySelector('.action-head');
            const actionBodyNode = shadowRoot.querySelector('.action-body');
            if(!actionBodyNode || !actionHeadNode) return;
            const headActionItems = actionHeadNode.querySelectorAll(`.action-head-item[data-label]`) as NodeListOf<HTMLElement>;
            // 修改head-item状态
            Array.from(headActionItems).forEach(headNodeItem => {
                if(headNodeItem.dataset.label === label) {
                    headNodeItem.classList.add('active')
                } else {
                    headNodeItem.classList.remove('active')
                }
            })
            // 重置action-body
            removeChilds(actionBodyNode);
            // 通过label找到action-body组件名字
            const componentName = htmlActions.find(i => i.label === label)?.component;
            if(!componentName) return;
            const newOptions = {...(options || {}),status:status || {}};
            console.log(newOptions)
            createCustomElement(componentName,newOptions,actionBodyNode);
        }
        function addActionClickItemToCache(label:HtmlActions[number]['label'],options:any,status:any){
            // 进栈
            actionClickCacheList.push([label,options,status]);
            if(actionClickCacheList.length > 1) {
                const actionHeadNode = shadowRoot.querySelector('.action-head');
                if(!actionHeadNode) return;
                const returnBtn = actionHeadNode.querySelector('.return-btn');
                if(!returnBtn) {
                    createElement({
                        tagName:'div',
                        className:'return-btn action-head-item',
                        innerText:'返回',
                        events:{
                            "click"(e) {
                                actionClickCacheList.pop();
                                // 然后取最后一项
                                const lastItem = actionClickCacheList.slice(-1)[0];
                                debugger
                                if(!lastItem) {
                                    // 移除本节点
                                    removeEle(e.target,'remove');
                                } else {
                                    fireActionItem(lastItem[0],lastItem[1],lastItem[2]);
                                    if(actionClickCacheList.length === 1) {
                                        // 当前显示的就是最后一项，则也移除
                                        removeEle(e.target,'remove');
                                    } 
                                }
                            },
                        }
                    },actionHeadNode)
                }
            }
        }
        async function createWrapper(){
            await stylePromise;
            createElement({
                tagName:'div',
                className:'wrapper',
                childs:[
                    {
                        tagName:'div',
                        className:'action-head',
                        childs:htmlActions.map(actionItem => {
                            function fireClick(currentItem:HTMLElement,status = {}){
                                const params = {
                                    label:currentItem.dataset.label as HtmlActions[number]['label'],
                                    options:actionItem.options,
                                    status:status
                                }
                                fireActionItem(params.label,params.options,params.status);
                                // 记录下来
                                addActionClickItemToCache(params.label,params.options,params.status)
                            }
                            return {
                                tagName:'div',
                                className:'action-head-item',
                                innerText:actionItem.label,
                                attributes:{
                                    'data-label':actionItem.label
                                },
                                events:{
                                    "click"(e) {
                                        const defaultStatus = actionItem.options?.status;
                                        fireClick(e.target as HTMLElement,defaultStatus);
                                    },
                                    'customClick'(e:CustomEvent){
                                        const detail = e.detail;
                                        if(typeof detail === 'object') {
                                            fireClick(detail.target,detail.status);
                                        }
                                    }
                                }
                            }
                        }),
                    },
                    {
                        tagName:'div',
                        className:'action-body',
                    }
                ]
            },shadowRoot)
        }
        createWrapper();
        function updateAction<T extends keyof HtmlActionLabelMap>(label:T,status:HtmlActionLabelMap[T]) {
            const actionHeadNode = shadowRoot.querySelector('.action-head');
            if(actionHeadNode) {
                const actionItems = actionHeadNode.querySelectorAll('.action-head-item');
                if(actionItems) {
                    const targetEle = Array.from(actionItems).find(i => (i as HTMLElement).innerText === label);
                    if(targetEle) {
                        // 自定义事件
                        const customClick = new CustomEvent('customClick',{
                            detail: {
                                status,
                                target:targetEle
                            },
                        }) 
                        targetEle.dispatchEvent(customClick);
                    }
                }
            }
        }
        function saveStatus(status:any,needRender:boolean = false){
            // 拿到最后一项
            // 修改status
            const lastItem = actionClickCacheList.slice(-1)[0];
            if(lastItem) {
                lastItem[2] = {
                    ...(lastItem[2] || {}),
                    // 支持只更新部分状态
                    ...status
                }
            }
            if(needRender) {
                fireActionItem(lastItem[0],lastItem[1],lastItem[2]);
            }
        }
        /** 尝试查找是否有返回按钮(这边按钮显示逻辑不介入)。如果不被允许，则执行替代逻辑 */
        function actionFireBack(replaceFun:Function){
            const actionHeadNode = shadowRoot.querySelector('.action-head');
            if(!actionHeadNode) {
                replaceFun();
                return;
            }
            const backBtn = actionHeadNode.querySelector('.return-btn') as HTMLElement;
            if(!backBtn) {
                replaceFun();
                return;
            } else {
                // 触发点击，来触发逻辑
                backBtn.click();
            }
        }
        return {
            updateAction,
            saveStatus,
            actionFireBack,
        }
    },
}
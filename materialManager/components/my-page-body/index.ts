import { ComponentExport,PageHeadBtns,ComponentConfigMap, MyComponent } from '@types'
import { createElement, createComponent ,waitEleDuration,MoreTimeExecute, cloneData, TaskManager, globalRouterManager } from '@utils'
import { pageHeadBtns } from '@config'

type updateBodyFun = ComponentConfigMap['my-page-body']['exposeMethods']['updateStatus'];
export const myPageBody:ComponentExport<'my-page-body'> = {
    componentName:'my-page-body',
    content() {
        return {
            onMounted(shadowRoot, options, status) {
                const taskManager = new TaskManager();
                const updateBody:updateBodyFun = (status)=> {
                    return taskManager.execute<boolean>([
                        ()=>{
                            const wrapperNode = shadowRoot.querySelector('.wrapper') as HTMLElement;
                            if(wrapperNode) {
                                return waitEleDuration(wrapperNode,'active',false).then(res => {
                                    wrapperNode.remove();
                                })
                            }
                        },
                        ()=> {
                            return new Promise((resolve,reject) => {
                                const findHeadItemConfig = pageHeadBtns.find(i => i.label === status.label);
                                if(!findHeadItemConfig) {
                                    reject(new Error('label不正确'));
                                    return;
                                };
                                createElement({
                                    tagName:'div',
                                    className:'wrapper',
                                    childs:()=>{
                                        const myComponent = createComponent(findHeadItemConfig.componentName,{
                                            ...findHeadItemConfig.options,
                                            label:findHeadItemConfig.label,
                                            returnUpdateStatusType(type){
                                                if(type) {
                                                    resolve('')
                                                } else {
                                                    reject(new Error('节点显示异常'))
                                                }
                                            },
                                            
                                        },status.status)
                                        return [myComponent]
                                    }
        
                                },shadowRoot)
                            })
                        },
                        ()=> {
                            return new Promise((resolve,reject) => {
                                const wrapperNode = shadowRoot.querySelector('.wrapper') as HTMLElement;
                                if(wrapperNode) {
                                    waitEleDuration(wrapperNode,'active',true);
                                    resolve(true)
                                } else {
                                    reject(new Error('wrapper节点未找到'))
                                }
                            })
                        },
                    ],'stop',true)
                }
                updateBody(status);
                globalRouterManager.onPageChange((pageItem)=> {
                    return updateBody({
                        label:pageItem.page.pageName as any,
                        status:pageItem.page.pageStatus as any
                    })
                })
                return {
                    updateStatus:updateBody
                }
            },
            onDestroy(shadowRoot) {
            },
        }
    }
}
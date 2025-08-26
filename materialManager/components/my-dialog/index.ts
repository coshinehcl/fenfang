import { ComponentExport,ComponentConfigMap } from '@types'
import { createElement, createUpdateElement, waitEleDuration,MoreTimeExecute,GetPromiseAndParams, showMessage, createComponent } from '@utils'
type ShowDialog = ComponentConfigMap['my-dialog']['exposeMethods']['showDialog'];
export const myDialog:ComponentExport<'my-dialog'> = {
    componentName:'my-dialog',
    reuseComponentNames:['my-dialog-again'],
    content() {
        return {
            onMounted(shadowRoot, options, status) {
                const dialogBgClassName = 'dialog-bg';
                const dialogContentClassName = 'dialog-content';
                const executor = new MoreTimeExecute();
                async function hideDialog(onlyContent = false){
                    const wrapperNode = shadowRoot.querySelector('.wrapper');
                    if(wrapperNode) {
                        const dialogContent = wrapperNode.querySelector(`.${dialogContentClassName}`);
                        if(dialogContent) {
                            await waitEleDuration(dialogContent,'active',false).then(res => {
                                dialogContent.remove();
                            })
                        }
                        if(onlyContent) {
                            return;
                        }
                        const dialogBg = wrapperNode.querySelector(`.${dialogBgClassName}`);
                        if(dialogBg) {
                            await waitEleDuration(dialogBg,'active',false).then(res => {
                                dialogBg.remove();
                            })
                        }
                        wrapperNode.remove();
                    }
                }
                const showDialog:ShowDialog = (_status,waitClosed = true)=> {
                    return executor.execute<string>([
                        ()=> {
                            // 移除节点
                            return hideDialog(true)
                        },
                        ()=> {
                            // 创建dialog-bg节点
                            const dialogBg = shadowRoot.querySelector(`.${dialogBgClassName}`);
                            if(dialogBg) return;
                            return new Promise((resolve) => {
                                createElement({
                                    tagName:'div',
                                    className:'wrapper',
                                    style:{
                                        zIndex:(options.zIndex || 10) + ''
                                    },
                                    childs:[
                                        createElement(
                                            {
                                                tagName:'div',
                                                className:dialogBgClassName,
                                                hooks:{
                                                    onMounted(ele) {
                                                        waitEleDuration(ele,'active',true).then(resolve)
                                                    },
                                                }
                                            }
                                        )
                                    ],
                                },shadowRoot)
                            })
                        },
                        ()=> {
                            // 创建dialog-content
                            const dialogConfig = _status;
                            // 创建content节点
                            let inputValue:string = '';
                            let inputErrorMsg:string = '';
                            let contentNode:HTMLElement;
                            if(typeof dialogConfig.content === 'string') {
                                contentNode = createElement({
                                    tagName:'div',
                                    className:'content',
                                    innerText:dialogConfig.content
                                })!
                            } else if(dialogConfig.content instanceof Element) {
                                contentNode = createElement({
                                    tagName:'div',
                                    className:'content',
                                    childs:[dialogConfig.content],
                                    events:{
                                        'customChange':(e)=> {
                                            inputValue = e.detail.value as string;
                                        }
                                    }
                                })!
                            } else if(typeof dialogConfig.content === 'object'){
                                // 避免异步逻辑拿到的content还是联合类型
                                const content = dialogConfig.content;
                                inputValue = content.default
                                inputErrorMsg = content.validator(inputValue)
                                contentNode = createElement({
                                    tagName:'div',
                                    className:'content',
                                    childs:[
                                        createElement({
                                            tagName:'div',
                                            className:'input-wrapper',
                                            childs:()=> {
                                                let updateErrMsgFun:Function;
                                                return [
                                                    content.list ? createElement({
                                                        tagName:'select',
                                                        hooks:{
                                                            onCreated(ele) {
                                                                ele.value = inputValue
                                                            },
                                                        },
                                                        events:{
                                                            'change'(e){
                                                                inputValue = e.currentTarget.value;
                                                                inputErrorMsg = content.validator(inputValue);
                                                                updateErrMsgFun();
                                                            }
                                                        },
                                                        childs:[
                                                            createElement({
                                                                tagName:'option',
                                                                attributes:{
                                                                    value:'',
                                                                },
                                                                innerText:'请选择'
                                                            }),
                                                            ...content.list.map(item => {
                                                                let itemObj = {
                                                                    label:'',
                                                                    value:''
                                                                }
                                                                if(typeof item === 'string') {
                                                                    itemObj.label = item;
                                                                    itemObj.value = item;
                                                                } else {
                                                                    itemObj = item;
                                                                }
                                                                return createElement({
                                                                    tagName:'option',
                                                                    attributes:{
                                                                        value:itemObj.value,
                                                                    },
                                                                    innerText:itemObj.label
                                                                })
                                                            })
                                                        ]
                                                    }):createComponent('my-input',{
                                                        unit:'✖️',
                                                        onStatusChange(status) {
                                                            inputValue = status.value;
                                                            inputErrorMsg = content.validator(inputValue);
                                                            updateErrMsgFun();
                                                        },
                                                    },{
                                                        value:inputValue
                                                    },{
                                                        style:{
                                                            width:'100%'
                                                        }
                                                    }),
                                                    createUpdateElement(()=>({
                                                        tagName:'div',
                                                        className:'input-error-msg',
                                                        innerText:inputErrorMsg,
                                                        getUpdateFun(updateFun, ele) {
                                                            updateErrMsgFun = updateFun;
                                                        },
                                                    }))
                                                ]
                                            }
                                         })
                                    ]
                                })!
                            } else {
                                contentNode = createElement({
                                    tagName:'div',
                                    className:'content',
                                })!
                            }
                            return function createWrapper(_resolve?:Function,_reject?:Function){
                                let confirmText:string = '';
                                let cancelText:string = '';
                                if(typeof dialogConfig.footer.confirm === 'string') {
                                    confirmText = dialogConfig.footer.confirm
                                } else if(dialogConfig.footer.confirm === true) {
                                    confirmText = '确认'
                                }
                                if(typeof dialogConfig.footer.cancel === 'string') {
                                    cancelText = dialogConfig.footer.cancel
                                } else if(dialogConfig.footer.cancel === true) {
                                    cancelText = '取消'
                                }
                                const dialogContent = createElement({
                                    tagName:'div',
                                    className:dialogContentClassName,
                                    childs:[
                                        createElement({
                                            tagName:'div',
                                            className:'title',
                                            innerText:dialogConfig.title
                                        }),
                                        contentNode,
                                        createElement({
                                            tagName:'div',
                                            className:'footer',
                                            childs:[
                                                confirmText ? createElement({
                                                    tagName:'div',
                                                    className:'footer-item',
                                                    innerText:confirmText,
                                                    events:{
                                                        "click"(e) {
                                                            if(!inputErrorMsg) {
                                                                hideDialog().then(()=> {
                                                                    if(_resolve) {
                                                                        _resolve(inputValue)
                                                                    }
                                                                })
                                                            } else {
                                                                showMessage({
                                                                    text:inputErrorMsg,
                                                                    type:'error',
                                                                    duration:2000
                                                                })
                                                            }
                                                        },
                                                    }
                                                }) : undefined,
                                                cancelText ? createElement({
                                                    tagName:'div',
                                                    className:'footer-item',
                                                    innerText:cancelText,
                                                    events:{
                                                        click(e){
                                                            hideDialog().then(()=> {
                                                                if(_reject) {
                                                                    _reject(undefined);
                                                                }
                                                            })
                                                        }
                                                    }
                                                }) : undefined,
                                            ]
                                        })
                                    ]
                                })!
                                const wrapperNode = shadowRoot.querySelector('.wrapper')!;
                                wrapperNode.appendChild(dialogContent);
                                return waitEleDuration(dialogContent,'active',true).then(res => {
                                    if(!confirmText && !cancelText && _resolve) {
                                        _resolve();
                                    }
                                })
                            }
                        },
                        (lastIsResolve,lastResolveValue,lastRejectValue)=> {
                           if(lastIsResolve) {
                                if(waitClosed) {
                                    const promiseList = GetPromiseAndParams<string>();
                                    lastResolveValue(promiseList[1],promiseList[2]);
                                    return promiseList[0]
                                } else {
                                    return lastResolveValue()
                                }
                           }
                           return ''
                        }
                    ])
                }
                async function updateStatus(_status:typeof status){
                    if(_status.display === false) {
                        return executor.execute<boolean>([
                            ()=> {
                                return new Promise((resolve) => {
                                    hideDialog().then(()=> {
                                        resolve(true)
                                    })
                                })
                            }
                        ])
                    } else {
                        return showDialog(_status.config,false).then(res=> {
                            return true;
                        })
                    }
                }
                // updateStatus(status);
                return {
                    updateStatus,
                    showDialog
                }
            },
            onDestroy(shadowRoot) {
                
            },
        }
    },
}
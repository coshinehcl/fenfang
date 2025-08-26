import { ComponentExport,ComponentConfigMap } from '@types'
import { createElement, createUpdateElement, waitEleDuration,MoreTimeExecute,sleep } from '@utils'
type ShowMessage = ComponentConfigMap['my-message']['exposeMethods']['updateStatus'];
export const myMessage:ComponentExport<'my-message'> = {
    componentName:'my-message',
    content() {
        return {
            onMounted(shadowRoot, options, status) {
                const executor = new MoreTimeExecute();
                const contentClassName = 'content';
                async function hideMessageBox(){
                    const wrapperNode = shadowRoot.querySelector('.wrapper');
                    if(wrapperNode) {
                        const contentNode = wrapperNode.querySelector(`.${contentClassName}`);
                        if(contentNode) {
                            await waitEleDuration(contentNode,'active',false).then(res => {
                                contentNode.remove();
                            })
                        }
                        wrapperNode.remove();
                    }
                }
                const showMessage:ShowMessage = (_status)=> {
                    return executor.execute<boolean>([
                        ()=> {
                            // 移除节点
                            return hideMessageBox()
                        },
                        ()=> {
                            // 创建contentNode
                            const strList = Array.isArray(_status.text) ? _status.text : [_status.text];
                            createElement({
                                tagName:'div',
                                className:'wrapper',
                                childs:[
                                    createElement({
                                        tagName:'div',
                                        className:`${contentClassName} ${_status.type}`,
                                        childs:strList.map(i => {
                                            return createElement({
                                                tagName:'div',
                                                className:'text-item',
                                                innerText:i
                                            })
                                        })
                                    })
                                ]
                            },shadowRoot)
                        },
                        ()=> {
                            // 等待动画
                            const contentNode = shadowRoot.querySelector(`.${contentClassName}`);
                            if(!contentNode) {
                                return false;
                            }
                            return waitEleDuration(contentNode,'active',true)
                        },
                        ()=> {
                            // 等待duration
                            return sleep(_status.duration)
                        },
                        ()=> {
                            // 关闭
                            return hideMessageBox().then(()=> {
                                return true
                            })
                        }
                    ])
                }
                // showMessage(status);
                return {
                    updateStatus:showMessage
                }
            },
            onDestroy(shadowRoot) {
                
            },
        }
    },
}
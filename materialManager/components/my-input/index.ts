import { ComponentExport,ComponentConfigMap } from '@types'
import { createElement, createUpdateElement,showDialog, showReuseDialog } from '@utils'
import { pageHeadBtns } from '@config'

type updateStatusFun = ComponentConfigMap['my-input']['exposeMethods']['updateStatus'];
export const myInput:ComponentExport<'my-input'> = {
    componentName:'my-input',
    content() {
        return {
            onMounted(shadowRoot, options, status) {
                const updateStatus:updateStatusFun = (_status) => {
                    let inputValue = _status.value;
                    createElement({
                        tagName:'div',
                        className:'wrapper',
                        childs:[
                            createElement({
                                tagName:'input',
                                attributes:{
                                    value:inputValue
                                },
                                events:{
                                    "input"(e) {
                                        inputValue = e.currentTarget.value;
                                        if(options.onStatusChange) {
                                            options.onStatusChange({
                                                value:e.currentTarget.value
                                            })
                                        }
                                    },
                                    "blur"(e) {
                                        inputValue = e.currentTarget.value;
                                        if(inputValue === '') {
                                            inputValue = options.voidValue || '';
                                            e.currentTarget.value = inputValue;
                                        }
                                        if(options.onStatusChange) {
                                            options.onStatusChange({
                                                value:e.currentTarget.value
                                            })
                                        }
                                    }
                                }
                            }),
                            options.unit ? createElement({
                                tagName:'div',
                                className:'unit',
                                innerText:options.unit,
                                style:{
                                    fontSize:options.unit.length > 1 ? '14px' : '12px'
                                },
                                events:{
                                    "click"(e) {
                                        console.log(inputValue,!inputValue)
                                        if(!inputValue) {
                                            return;
                                        }
                                        showReuseDialog({
                                            title:'确定移除当前值吗?',
                                            content:'',
                                            footer:{
                                                cancel:'取消',
                                                confirm:'确认'
                                            }
                                        },true).then(res => {
                                            const inputNode = shadowRoot.querySelector('input');
                                            inputValue = options.voidValue || '';
                                            if(inputNode) {
                                                inputNode.value = inputValue;
                                                if(options.onStatusChange) {
                                                    options.onStatusChange({
                                                        value:''
                                                    })
                                                }
                                            }
                                        }).catch(()=> {})
                                    },
                                }
                            }) : undefined
                        ]
                    },shadowRoot)
                    return Promise.resolve(true);
                }
                updateStatus(status);
                return {
                    updateStatus
                }
            },
            onDestroy(shadowRoot) {
                
            },
        }
    },
}
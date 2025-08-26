import {CreateElementConfig, CustomElementExport,MyMessageEleOptions} from '@types'
import {createElement,createUpdateElement,removeEle ,showMessage} from '@utils'
export const myMessage:CustomElementExport<'my-message'> = {
    tagName:'my-message',
    createNode(shadowRoot, options,stylePromise) {
        async function createWrapper(textList:string | Array<string>,config?:MyMessageEleOptions):ReturnType<typeof showMessage>{
            const wrapperNode = shadowRoot.querySelector('.message-wrapper');
            const { delay = 1200,cancel=false,confirm = false,input,textarea,select} = config || {};
            if(typeof textList === 'string') {
                textList = [textList]
            }
            if(wrapperNode) wrapperNode.remove();
            await stylePromise;
            return new Promise((resolve,reject) => {
                let inputHelpText:string = '';
                let updateInputHelpTextFun:Function;
                if(cancel || confirm || input || textarea || select) {
                    const textListNodes:Array<CreateElementConfig> = textList.map(i => ({
                        tagName:'div',
                        className:'message-item',
                        innerText:i
                    }));
                    const myInput = input || textarea;
                    if(myInput) {
                        
                        textListNodes.push({
                            tagName:'div',
                            className:'input-wrapper',
                            childs:[
                                {
                                    tagName:input ? 'input' : 'textarea',
                                    attributes:{
                                        value:myInput.default || ''
                                    },
                                    innerText:myInput.default || '',
                                    events:{
                                        'input':(e) => {
                                            // 如果外界需要拿到这个值，则也是通过validate自己去获取
                                            const v = (e.target as HTMLInputElement).value;
                                            if(myInput.validate) {
                                                inputHelpText = myInput.validate(v) || '';
                                                if(updateInputHelpTextFun) {
                                                    updateInputHelpTextFun();
                                                }
                                            }
                                        }
                                    },
                                    attachedQueryNode:shadowRoot,
                                    returnAttachedNode(ele) {
                                        // 挂载后，触发激活,及更新inputHelpText
                                        if(myInput.validate) {
                                            inputHelpText = myInput.validate(myInput.default || '') || '';
                                            if(updateInputHelpTextFun) {
                                                updateInputHelpTextFun();
                                            }
                                        }
                                        const currentInput = ele as HTMLInputElement;
                                        currentInput.focus();
                                        // 移动光标到文字末尾(start,end)
                                        currentInput.setSelectionRange(currentInput.value.length, currentInput.value.length);
                                    },
                                },
                                createUpdateElement(()=> {
                                    return {
                                        tagName:'div',
                                        className:'input-help',
                                        innerHTML:inputHelpText || '&nbsp;',
                                        returnUpdateFun(updateFun) {
                                            updateInputHelpTextFun = updateFun;
                                        }
                                    }
                                })
                            ]
                        })
                    }
                    if(select && select.list && select.onChange) {
                        textListNodes.push({
                            tagName:'div',
                            className:'select-wrapper',
                            childs:[
                                {
                                    tagName:'select',
                                    attributes:{
                                        placeholder:'请选择',
                                        value:''
                                    },
                                    childs:[
                                        {
                                            tagName:'option',
                                            attributes:{
                                                value:'',
                                            },
                                            innerText:'请选择'
                                        },
                                        ...(
                                            select.list.map(i => {
                                                return {
                                                    tagName:'option',
                                                    attributes:{
                                                        value:i.value,
                                                    },
                                                    innerText:i.label
                                                }
                                            }) as Array<CreateElementConfig>
                                        )
                                    ],
                                    events:{
                                        change(e:Event){
                                            if(!e.target) return;
                                            const v = (e.target as HTMLInputElement).value;
                                            select.onChange(v);
                                        }
                                    }
                                }
                            ]
                           
                        })
                    }
                    const _wrapperNode = createElement({
                        tagName:'div',
                        className:'message-wrapper popup',
                        childs:[{
                            tagName:'div',
                            className:'message-body',
                            style:{
                                'minWidth':'calc(100vw - 100px)'
                            },
                            childs:[
                                {
                                    tagName:'div',
                                    className:'message-body-content',
                                    childs:textListNodes,
                                },
                                {
                                    tagName:'div',
                                    className:'message-body-footer',
                                    childs:[
                                        {
                                            tagName:'div',
                                            className:'message-body-footer-item',
                                            show:!!myInput || !!select || confirm,
                                            innerText:'确定',
                                            events:{
                                                "click"(e) {
                                                    if(myInput && inputHelpText) {
                                                        return;
                                                    }
                                                    removeEle(_wrapperNode!,'remove').then(()=> {
                                                        resolve('确定');
                                                    })
                                                },
                                            }
                                        },
                                        // 右侧显示取消，避免点快点到了确认
                                        {
                                            tagName:'div',
                                            className:'message-body-footer-item',
                                            show:!!myInput || !!select || cancel,
                                            innerText:'取消',
                                            events:{
                                                "click"(e) {
                                                    removeEle(_wrapperNode!,'remove').then(()=> {
                                                        resolve('取消');
                                                    })
                                                },
                                            }
                                        }
                                    ]
                                }
                            ]
                        }]
                    },shadowRoot)
                } else {
                    const _wrapperNode = createElement({
                        tagName:'div',
                        className:'message-wrapper text',
                        childs:[{
                            tagName:'div',
                            className:'message-body',
                            childs:textList.map(i => ({
                                tagName:'div',
                                className:'message-item',
                                innerText:i
                            })),
                            returnNode(e){
                                setTimeout(() => {
                                    removeEle(_wrapperNode!,'remove').then(()=> {
                                        resolve('ok');
                                    })
                                }, delay);
                            }
                        }]
                    },shadowRoot)
                }
            })

        }
        return {
            show:createWrapper
        }
    },
}
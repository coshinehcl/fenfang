import {CreateElementConfig, CustomElementExport } from '@types'
import { createChildsElement, createElement, createUpdateElement, showMessage } from '@utils'
export const myOthers:CustomElementExport = {
    tagName:'my-others',
    createNode(shadowRoot, options, stylePromise) {
        const blockList:Array<[string,(parentUpdateFun:Function) => Array<CreateElementConfig>]> = [
            [
                '数据',(parentUpdateFun)=> {
                    return [
                        {
                            tagName:'div',
                            innerText:'导入数据',
                            events:{
                                'click'(e) {
                                    console.log('导入数据');
                                    parentUpdateFun();
                                }
                            }
                        },
                        {
                            tagName:'div',
                            innerText:'导出数据',
                            events:{
                                'click'(e) {
                                    console.log('导入数据');
                                    parentUpdateFun();
                                }
                            }
                        }
                    ]
                }
            ],
            [
                '缓存',(parentUpdateFun)=> {
                    const cacheKeys = Object.keys(localStorage);
                    console.log('update')
                    return cacheKeys.map(key => {
                        return {
                            tagName:'div',
                            innerText:key,
                            events:{
                                'click'(e) {
                                   let newV = '';
                                   showMessage('编辑缓存',{
                                        textarea:{
                                            default:localStorage.getItem(key) || '',
                                            validate(v) {
                                                newV = v;
                                            }
                                        }
                                   }).then(res => {
                                        if(res === '取消') return;
                                        if(newV !== '') {
                                            localStorage.setItem(key,newV);
                                        } else {
                                            localStorage.removeItem(key)
                                        }
                                        parentUpdateFun();
                                   })
                                }
                            }
                        }
                    })
                }
            ]
        ]
        createElement({
            tagName:'div',
            className:'wrapper',
            childs:blockList.map(([label,blockFun]) => {
                return {
                    tagName:'div',
                    className:'block-wrapper',
                    childs:[
                        {
                            tagName:'div',
                            className:'block-title',
                            innerText:label
                        },
                        createUpdateElement(()=> {
                            return {
                                tagName:'div',
                                className:'block-body',
                                returnUpdateFun(updateFun,ele) {
                                    createChildsElement(blockFun(updateFun),ele);
                                },
                            }
                        })
                        
                    ]
                }
            })
        },shadowRoot)
    },
}
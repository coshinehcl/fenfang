import {CustomElementExport,RecordItemHooks,RecordMaterialItemHooks,RecordBrandItemHooks,RecordBelong } from '@types'
import {createElement,createUpdateElement,getFormatNum,saveHtmlActionStatus,updateHtmlAction} from '@utils'
import { recordRecordBelong } from '@config'
export const myInputs:CustomElementExport<'my-inputs'> = {
    tagName:'my-inputs',
    createNode(shadowRoot, options) {
        const [recordMaterialItem,recordItem,recordList] = options.data;
        if(recordMaterialItem.isDeprecated) return;
        const brandList = recordMaterialItem.list.filter(i => i.isDeprecated !== true);
        // if(!brandList.length) return;
        const currentBelongField = options.params.belong.field;
        const currentRecordIndex = recordList.findIndex(i => i.recordDate === recordItem.recordDate);
        if(currentRecordIndex === -1) return;
        // 拿到上次的信息
        let lastRecordItem:RecordItemHooks | undefined;
        let lastRecordMaterialItem:RecordMaterialItemHooks | undefined;
        if(currentRecordIndex > 0) {
            lastRecordItem = recordList[currentRecordIndex - 1]
            lastRecordMaterialItem = lastRecordItem.list.find(i => i.label === recordMaterialItem.label);
        }
        createElement({
            tagName:'div',
            className:'wrapper',
            childs:[
                {
                    tagName:'div',
                    className:'material-label-wrapper',
                    childs:[
                        {
                            tagName:'span',
                            className:'material-label',
                            innerText:recordMaterialItem.label,
                            events:{
                                "click"(e) {
                                    options.params.belongHiddenFun();
                                },
                            }
                        },
                        {
                            tagName:'span',
                            className:'material-belong',
                            innerText:options.params.belong.label,
                            events:{
                                "click"(e) {
                                    // 需要先更新当前状态，便于返回
                                    saveHtmlActionStatus<'新增'|'修改'>({
                                        selectMaterialItem:{
                                            belongField:options.params.belong.field,
                                            label:recordMaterialItem.label
                                        }
                                    })
                                    updateHtmlAction('图表',{
                                        defaultType:'归属数量',
                                        defaultLabel:recordMaterialItem.label
                                    })
                                },
                            }
                        }
                    ]
                },
                {
                    tagName:'div',
                    className:'brand-list',
                    childs:brandList.map(brandItem => {
                        return {
                            tagName:'div',
                            className:'brand-item',
                            childs:[
                                {
                                    tagName:'div',
                                    className:'brand-label-wrapper',
                                    childs:[
                                        {
                                            tagName:'span',
                                            className:'brand-label',
                                            innerText:brandItem.label
                                        },
                                        {
                                            tagName:'span',
                                            className:'brand-specs',
                                            innerText:`规格:${brandItem.specsText}`,
                                            events:{
                                                "click"(e) {
                                                     // 需要先更新当前状态，便于返回
                                                    saveHtmlActionStatus<'新增'|'修改'>({
                                                        selectMaterialItem:{
                                                            belongField:options.params.belong.field,
                                                            label:recordMaterialItem.label
                                                        }
                                                    })
                                                },
                                            }
                                        }
                                    ]
                                   
                                },
                                {
                                    tagName:'div',
                                    className:'brand-inputs-wrapper',
                                    childs:brandItem[currentBelongField].map(specItem => {
                                        return {
                                            tagName:'div',
                                            className:'input-wrapper',
                                            childs:[
                                                {
                                                    tagName:'input',
                                                    attributes:{
                                                        value:specItem.num + ''
                                                    },
                                                    events:{
                                                        input(e:Event) {
                                                            if(!e.target) return;
                                                            specItem.num = Number((e.target as HTMLInputElement).value);
                                                        }
                                                    }
                                                },
                                                {
                                                    tagName:'span',
                                                    className:'input-unit',
                                                    innerText:specItem.unit
                                                }
                                            ]
                                            
                                        }
                                    })
                                },
                                {
                                    tagName:'div',
                                    className:'brand-help',
                                    childs:()=> {
                                        function getBrandNums(_brandItem?:RecordBrandItemHooks){
                                            const currentBelongItem = recordRecordBelong.find(i => i.field === currentBelongField);
                                            const otherBelongItems = recordRecordBelong.filter(i => i.field !== currentBelongField);
                                            const newRecordRecordBelong = [currentBelongItem,...otherBelongItems] as RecordBelong;
                                            const numList:Array<[boolean,string,'-'|number]> = newRecordRecordBelong.map(belongItem=> {
                                                return [belongItem.field === currentBelongField,belongItem.shortLabel,_brandItem ?  _brandItem.computed[`${belongItem.field}Num`] : '-']
                                            })
                                            return numList;
                                        }
                                        // 如果品牌为1.则不显示本身的(物料处会显示)
                                        if(recordMaterialItem.list.length < 2) {
                                            return []
                                        }
                                        return [
                                            // 上次该品牌的信息
                                            createUpdateElement(()=> {
                                                let lastRecordBrandItem:RecordBrandItemHooks | undefined;
                                                if(lastRecordMaterialItem) {
                                                    lastRecordBrandItem = lastRecordMaterialItem.list.find(i => i.label === brandItem.label)
                                                }
                                                return {
                                                    tagName:'div',
                                                    className:'brand-help-item',
                                                    childs:[
                                                        {
                                                            tagName:'span',
                                                            innerHTML:'上次:&nbsp;'
                                                        },
                                                        {
                                                            tagName:'span',
                                                            className:'brand-help-item-content',
                                                            childs:getBrandNums(lastRecordBrandItem).map(i => {
                                                                const v:'-' | number = i[2];
                                                                let color = 'inherit';
                                                                if(typeof v === 'number' && v < 0) {
                                                                    // 负数则红色提醒
                                                                    color = 'red';
                                                                } else if(i[0]) {
                                                                    color = '#333';
                                                                }
                                                                return {
                                                                    tagName:'span',
                                                                    style:{
                                                                        color:color,
                                                                        width:`${getFormatNum(100 / (recordRecordBelong.length +1))}%`
                                                                    },
                                                                    innerText:`${i[1]}:${i[2]}`
                                                                }
                                                            })
                                                        }
                                                    ],
                                                    returnUpdateFun(updateFun) {
                                                        if(lastRecordBrandItem) {
                                                            lastRecordBrandItem.hooks[`${currentBelongField}NumChange`].push(updateFun)
                                                        }
                                                    },
                                                }
                                            }),
                                            // 本次该品牌的信息
                                            createUpdateElement(()=> {
                                                const currentBelongNum = brandItem.computed[`${currentBelongField}Num`]
                                                return {
                                                    tagName:'div',
                                                    className:'brand-help-item',
                                                    childs:[
                                                        {
                                                            tagName:'span',
                                                            innerHTML:'本次:&nbsp;'
                                                        },
                                                        {
                                                            tagName:'span',
                                                            className:'brand-help-item-content',
                                                            childs:getBrandNums(brandItem).map(i => {
                                                                const v:'-' | number = i[2];
                                                                let color = 'inherit';
                                                                if(typeof v === 'number' && v < 0) {
                                                                    // 负数则红色提醒
                                                                    color = 'red';
                                                                } else if(i[0]) {
                                                                    color = '#333';
                                                                }
                                                                return {
                                                                    tagName:'span',
                                                                    style:{
                                                                        color:color,
                                                                        width:`${getFormatNum(100 / (recordRecordBelong.length +1))}%`
                                                                    },
                                                                    innerText:`${i[1]}:${i[2]}`
                                                                }
                                                            })
                                                        }
                                                    ],
                                                    returnUpdateFun(updateFun) {
                                                        brandItem.hooks[`${currentBelongField}NumChange`].push(updateFun)
                                                    },
                                                }
                                            })
                                        ]
                                    }
                                }
                            ]
                        }
                    })
                },
                // 物料的信息
                {
                    tagName:'div',
                    className:'material-help',
                    childs:()=> {
                        function getMaterialNums(_materialItem?:RecordMaterialItemHooks){
                            const currentBelongItem = recordRecordBelong.find(i => i.field === currentBelongField);
                            const otherBelongItems = recordRecordBelong.filter(i => i.field !== currentBelongField);
                            const newRecordRecordBelong = [currentBelongItem,...otherBelongItems] as RecordBelong;
                            const numList:Array<[boolean,string,'-'|number]>= newRecordRecordBelong.map(belongItem=> {
                                return [belongItem.field === currentBelongField,belongItem.shortLabel,_materialItem ?  _materialItem.computed[`${belongItem.field}Num`] : '-']
                            })
                            // 再加上日耗
                            numList.push([
                                true, // 保持高亮
                                '日耗',
                                _materialItem ? _materialItem.computed.chartData.dayUse : '-'
                            ])
                            return numList;
                        }
                        return [
                            // 上次物料的信息
                            createUpdateElement(()=>{
                                return {
                                    tagName:'div',
                                    className:'material-help-item',
                                    childs:[
                                        {
                                            tagName:'span',
                                            innerHTML:'上次:&nbsp;'
                                        },
                                        {
                                            tagName:'span',
                                            className:'material-help-item-content',
                                            childs:getMaterialNums(lastRecordMaterialItem).map(i => {
                                                const v:'-' | number = i[2];
                                                let color = 'inherit';
                                                if(typeof v === 'number' && v < 0) {
                                                    // 负数则红色提醒
                                                    color = 'red';
                                                } else if(i[0]) {
                                                    color = '#333';
                                                }
                                                return {
                                                    tagName:'span',
                                                    style:{
                                                        color:color,
                                                        width:`${getFormatNum(100 / (recordRecordBelong.length || 1))}%`
                                                    },
                                                    innerText:`${i[1]}:${i[2]}`
                                                }
                                            })
                                        }
                                    ],
                                    returnUpdateFun(updateFun) {
                                        if(lastRecordMaterialItem) {
                                            // 依赖
                                            lastRecordMaterialItem.hooks[`${currentBelongField}NumChange`].push(updateFun);
                                            lastRecordMaterialItem.hooks.chartDataChange.push(updateFun);
                                        }
                                    },
                                }
                            }),
                            // 本次物料的信息
                            createUpdateElement(()=>{
                                return {
                                    tagName:'div',
                                    className:'material-help-item',
                                    childs:[
                                        {
                                            tagName:'span',
                                            innerHTML:'本次:&nbsp;'
                                        },
                                        {
                                            tagName:'span',
                                            className:'material-help-item-content',
                                            childs:getMaterialNums(recordMaterialItem).map(i => {
                                                const v:'-' | number = i[2];
                                                let color = 'inherit';
                                                if(typeof v === 'number' && v < 0) {
                                                    // 负数则红色提醒
                                                    color = 'red';
                                                } else if(i[0]) {
                                                    color = '#333';
                                                }
                                                return {
                                                    tagName:'span',
                                                    style:{
                                                        color:color,
                                                        width:`${getFormatNum(100 / (recordRecordBelong.length || 1))}%`
                                                    },
                                                    innerText:`${i[1]}:${i[2]}`
                                                }
                                            })
                                        }
                                    ],
                                    returnUpdateFun(updateFun) {
                                        recordMaterialItem.hooks[`${currentBelongField}NumChange`].push(updateFun);
                                        recordMaterialItem.hooks.chartDataChange.push(updateFun);
                                    },
                                }
                            }),
                        ]
                    }
                }
            ]
        },shadowRoot)
    },
}

import {ComponentExport,ComponentConfigMap, RecordBrandItemComputed, RecordMaterialComputed,RecordBelongList} from '@types'
import { createComponent, createElement,createUpdateElement,getBrandSpecsText,getFormatNum ,getDayDistance, updatePage, globalRouterManager} from '@utils'
import { recordBelongList } from 'config/recordList'
type UpdateStatusFun = ComponentConfigMap['my-material-input']['exposeMethods']['updateStatus']

function getForecastValue(currentMaterialItem:RecordMaterialComputed,lastMaterialItem:RecordMaterialComputed | undefined,belong:RecordBelongList[number],dayDistance:number | undefined) {
    if(!lastMaterialItem || !dayDistance) return '';
    const averageDayUse = lastMaterialItem.chartData.averageDayUse;
    const dayUse = lastMaterialItem.chartData.dayUse;
    if(dayUse === '-') return;
    if(belong.belong === 'system') {
        const forecastValue = lastMaterialItem.computed.systemNum + currentMaterialItem.computed.purchaseNum - averageDayUse * dayDistance;
        return getFormatNum(forecastValue) +'';
    } else if(belong.belong === 'purchase') {
        return ''
    } else if(belong.belong === 'repo') {
        const lastRepoFullNum = lastMaterialItem.computed.repoNum + lastMaterialItem.computed.repoExtraNum;
        const forecastValue = lastRepoFullNum + currentMaterialItem.computed.purchaseNum - averageDayUse * dayDistance;
        return getFormatNum(forecastValue) +'';
    } else if(belong.belong === 'repoExtra') {
        return ''
    } else {
        return ''
    }
}

export const myMaterialInput:ComponentExport<'my-material-input'> = {
    componentName:'my-material-input',
    content() {
        return {
            onMounted(shadowRoot, options, status) {
                const updateStatus:UpdateStatusFun = (_status) => {
                    return Promise.resolve(true)
                }
                const materialItem = options.data;
                const belong = options.belong;
                createElement({
                    tagName:'div',
                    className:'wrapper',
                    childs:[
                        createElement({
                            tagName:'div',
                            className:'material-item-label-wrapper',
                            childs:[
                                createElement({
                                    tagName:'span',
                                    className:'material-item-label',
                                    innerText:materialItem.label
                                }),
                                createElement({
                                    tagName:'span',
                                    className:'material-item-belong',
                                    innerText:options.belong.label
                                })
                            ],
                            events:{
                                click(e){
                                    options.closeBelongContent();
                                }
                            }
                        }),
                        createElement({
                            tagName:'div',
                            className:'brand-list-wrapper',
                            childs:materialItem.list.filter(i => !i.isDeprecated).map(brandItem => {
                                return createElement({
                                    tagName:'div',
                                    className:'brand-item-wrapper',
                                    childs:[
                                        createElement({
                                            tagName:'div',
                                            className:'brand-item-label-wrapper',
                                            childs:[
                                                createElement({
                                                    tagName:'span',
                                                    className:'brand-item-label',
                                                    innerText:brandItem.label,
                                                    events:{
                                                        "click"(e) {
                                                            options.navigateTo(()=> {
                                                                globalRouterManager.pageForward({
                                                                    pageName:'图表',
                                                                    pageStatus:{
                                                                        type:'仓库数量',
                                                                        label:materialItem.label
                                                                    }
                                                                })
                                                            })
                                                        },
                                                    }
                                                }),
                                                createElement({
                                                    tagName:'span',
                                                    className:'brand-item-specs-text',
                                                    innerText:getBrandSpecsText(brandItem)
                                                })
                                            ]
                                        }),
                                        createElement({
                                            tagName:'div',
                                            className:'brand-item-input-wrapper',
                                            childs:brandItem[belong.belong].map((specItem,specIndex) => {
                                                if(options.belong.onlyShowLastSpecInput && specIndex !== brandItem[belong.belong].length -1) {
                                                    return;
                                                }
                                                return createComponent('my-input',{
                                                    unit:specItem.unit,
                                                    voidValue:'0',
                                                    onStatusChange(status) {
                                                        let v = Number(status.value);
                                                        if(isNaN(v)) {
                                                            v = 0;
                                                        }
                                                        specItem.num = v;
                                                    },
                                                },{value:specItem.num + ''})
                                            })
                                        }),
                                        // 辅助信息
                                        createElement({
                                            tagName:'div',
                                            className:'brand-item-input-help',
                                            show:materialItem.list.filter(i => !i.isDeprecated).length > 1,
                                            childs:()=> {
                                                function getHelpItem(title:string,_BrandItem:RecordBrandItemComputed | undefined){
                                                    const newBelongList = recordBelongList.filter(i => i.belong !== options.belong.belong);
                                                    newBelongList.unshift(options.belong);
                                                    return [
                                                        createElement({
                                                            tagName:'div',
                                                            innerText:title,
                                                            style:{
                                                                width:`${getFormatNum(100 / (recordBelongList.length + 1))}%`
                                                            },
                                                        }),
                                                        // 当前归属的字段值
                                                        ...newBelongList.map((i,index) => {
                                                            return createElement({
                                                                tagName:'div',
                                                                style:{
                                                                    width:`${getFormatNum(100 / (recordBelongList.length + 1))}%`
                                                                },
                                                                childs:[
                                                                    createElement({
                                                                        tagName:'span',
                                                                        innerText:i.shortLabel
                                                                    }),
                                                                    createElement({
                                                                        tagName:'span',
                                                                        className:`help-item-value ${ index === 0 ? 'current' : ''}`,
                                                                        innerText:_BrandItem ? _BrandItem.computed[`${i.belong}Num`] + '' : '-'
                                                                    })
                                                                ],
                                                                events:{
                                                                    "click"(e) {
                                                                        if(i.belong === options.belong.belong) return;
                                                                        options.updateFormStatus({
                                                                            date:'_inner',
                                                                            material:{
                                                                                belongField:i.belong,
                                                                                label:materialItem.label
                                                                            }
                                                                        })
                                                                    },
                                                                }
                                                            })
                                                        })
                                                    ]
                                                }
                                                const lastRecordBrandItem = options.lastRecordMaterialItem?.list.find(i => i.label === brandItem.label);
                                                return [
                                                     // 本次
                                                     createUpdateElement(()=>({
                                                        tagName:'div',
                                                        className:'help-item',
                                                        childs:getHelpItem('本次',brandItem),
                                                        getUpdateFun(updateFun, ele) {
                                                            brandItem.hooks.onPurchaseNumChange.push(updateFun);
                                                            brandItem.hooks.onRepoExtraNumChange.push(updateFun);
                                                            brandItem.hooks.onRepoNumChange.push(updateFun);
                                                            brandItem.hooks.onSystemNumChange.push(updateFun);
                                                        },
                                                    })),
                                                    // 上次
                                                    createElement({
                                                        tagName:'div',
                                                        className:'help-item',
                                                        childs:getHelpItem('上次',lastRecordBrandItem)
                                                    }),
                                                ]
                                            }
                                        })
                                    ]
                                })
                            })
                        }),
                        createElement({
                            tagName:'div',
                            className:'material-help',
                            childs:()=> {
                                function getHelpItem(title:string,_material:RecordMaterialComputed | undefined){
                                    const newBelongList = recordBelongList.filter(i => i.belong !== options.belong.belong);
                                    newBelongList.unshift(options.belong);
                                    return [
                                        createElement({
                                            tagName:'div',
                                            innerText:title,
                                            style:{
                                                width:`${getFormatNum(100 / (recordBelongList.length + 1))}%`
                                            },
                                        }),
                                        // 当前归属的字段值
                                        ...newBelongList.map((i,index) => {
                                            return createElement({
                                                tagName:'div',
                                                style:{
                                                    width:`${getFormatNum(100 / (recordBelongList.length + 1))}%`
                                                },
                                                childs:[
                                                    createElement({
                                                        tagName:'span',
                                                        innerText:i.shortLabel
                                                    }),
                                                    createElement({
                                                        tagName:'span',
                                                        className:`help-item-value ${ index === 0 ? 'current' : ''}`,
                                                        innerText:_material ? _material.computed[`${i.belong}Num`] + '' : '-'
                                                    })
                                                ],
                                                events:{
                                                    "click"(e) {
                                                        if(i.belong === options.belong.belong) return;
                                                        options.updateFormStatus({
                                                            date:'_inner',
                                                            material:{
                                                                belongField:i.belong,
                                                                label:materialItem.label
                                                            }
                                                        })
                                                    },
                                                }
                                            })
                                        })
                                    ]
                                }
                                return [
                                    // 本次
                                    createUpdateElement(()=>({
                                        tagName:'div',
                                        className:'help-item',
                                        childs:getHelpItem('本次',materialItem),
                                        getUpdateFun(updateFun, ele) {
                                            materialItem.hooks.onPurchaseNumChange.push(updateFun);
                                            materialItem.hooks.onRepoExtraNumChange.push(updateFun);
                                            materialItem.hooks.onRepoNumChange.push(updateFun);
                                            materialItem.hooks.onSystemNumChange.push(updateFun);
                                            // materialItem.onChartDataChange.push(updateFun)
                                        },
                                    })),
                                    // 上次
                                    createElement({
                                        tagName:'div',
                                        className:'help-item',
                                        childs:getHelpItem('上次',options.lastRecordMaterialItem)
                                    }),
                                ]
                            }
                        }),
                        createElement({
                            tagName:'div',
                            className:'validator-wrapper',
                            childs:[
                                createElement({
                                    tagName:'div',
                                    className:'title',
                                    innerText:'验证'
                                }),
                                createElement({
                                    tagName:'div',
                                    className:'content',
                                    childs:[
                                        // 预估信息
                                        createUpdateElement(()=>{
                                            const text = getForecastValue(materialItem,options.lastRecordMaterialItem,belong,options.dayDistance) || '';
                                            return {
                                                tagName:'div',
                                                className:'item',
                                                childs:[
                                                    createElement({
                                                        tagName:'div',
                                                        innerHTML:text ? `预计本次值:<span class="help-item-value current">${text}</span>` : '',
                                                    }),
                                                ],
                                                getUpdateFun(updateFun, ele) {
                                                    materialItem.hooks.onPurchaseNumChange.push(updateFun);
                                                    materialItem.hooks.onRepoExtraNumChange.push(updateFun);
                                                    materialItem.hooks.onRepoNumChange.push(updateFun);
                                                    materialItem.hooks.onSystemNumChange.push(updateFun);
                                                    materialItem.onChartDataChange.push(updateFun);
                                                },
                                            }
                                        }),
                                        // 日耗信息
                                        createUpdateElement(()=> {
                                            const dayUse = materialItem.chartData.dayUse;
                                            const averageDayUse = (options.lastRecordMaterialItem || materialItem).chartData.averageDayUse;
                                            let errInfo = '';
                                            if(typeof dayUse === 'number' && typeof averageDayUse === 'number') {
                                                if(dayUse < 0) {
                                                    errInfo = '日耗为负，检查数据'
                                                } else if(Math.abs(dayUse / averageDayUse) > 1.5) {
                                                    errInfo = '当前日耗远高于之前'
                                                } else if(Math.abs(averageDayUse / dayUse) > 1.5) {
                                                     errInfo = '当前日耗远低于之前'
                                                }
                                            }
                                            return {
                                                tagName:'div',
                                                className:'item',
                                                childs:[
                                                    createElement({
                                                        tagName:'span',
                                                        innerText:`往期均日耗${averageDayUse}，当前日耗${dayUse}。`
                                                    }),
                                                    createElement({
                                                        tagName:'span',
                                                        style:{
                                                            color:'red'
                                                        },
                                                        innerText:errInfo,
                                                        events:{
                                                            click(){
                                                                options.navigateTo(()=> {
                                                                    globalRouterManager.pageForward({
                                                                        pageName:'图表',
                                                                        pageStatus:{
                                                                            type:'消耗对比',
                                                                            label:materialItem.label
                                                                        }
                                                                    })
                                                                })
                                                            }
                                                        }
                                                    }),
                                                ],
                                                getUpdateFun(updateFun, ele) {
                                                    materialItem.onChartDataChange.push(updateFun);
                                                },
                                            }
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                },shadowRoot)
                return {
                    updateStatus
                }
            },
            onDestroy(shadowRoot) {
                
            },
        }
    },
}
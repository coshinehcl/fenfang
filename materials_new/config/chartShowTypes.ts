import { ChartShowType,ChartShowFields, CreateElementConfig,ChartShowTypesList} from '@types'
import { cloneData,getFormatNumBySpecs } from '@utils'
import { brandPriorityMap } from './materialList'
import { recordRecordBelong } from './recordList'

export const chartFieldsMap:Record<keyof ChartShowFields,string> = {
    'dayUse':'日耗',
    'averageDayUse':'均日耗',
    'outSuggestByRepo':'出库(暴)',
    'outSuggestByRepoFull':'出库(缓)',
    'purchaseSuggest':'购买建议',
    'availableDay':'可用天数',
    // 归属数量
    'purchaseNum':'购买数量',
    'systemNum':'系统数量',
    'repoNum':'仓库数量(仅)',
    'repoExtraNum':'仓库数量(额)',
    'repoFullNum':'总仓数量',
}
const FooterNodeNum = 3;
const allBelongFields = recordRecordBelong.map(belongItem => {
    const newField = `${belongItem.field}Num` as const;
    return newField
})
export const chartShowTypes:ChartShowTypesList = [
    {
        label:'归属数量',
        fields:allBelongFields,
        navigateBelongField:'repo',
        getCanvasFooterNodes(chartMaterialItems){
            const lastThreeItems = cloneData(chartMaterialItems.slice(-FooterNodeNum));
            if(!lastThreeItems.length) return [];
            return lastThreeItems.reverse().map(item => {
                let contentText:string = '';
                recordRecordBelong.forEach(belongItem => {
                    const newField = `${belongItem.field}Num` as const;;
                    contentText+=`[${belongItem.shortLabel}(${item.computed[newField]})]`
                })
                const systemNum = item.computed.repoNum
                const repoNum = item.computed.repoNum;
                const repoFullNum = item.computed.repoFullNum;
                const repoExtra = item.computed.repoExtraNum;
                let repoExtraText = repoExtra + '';
                if(repoExtra > 0) {
                    repoExtraText = `<strong>${repoExtra}</strong>`
                }
                return {
                    tagName:'div',
                    className:'item',
                    childs:[
                        {
                            tagName:'div',
                            className:'label',
                            innerText:item.recordDate
                        },
                        {
                            tagName:'div',
                            innerText:contentText
                        }
                    ]
                }
            })
        }
    },
    {
        label:'仓库数量',
        fields:['repoNum','repoExtraNum','repoFullNum'],
        navigateBelongField:'repo',
        getCanvasFooterNodes(chartMaterialItems){
            const lastThreeItems = cloneData(chartMaterialItems.slice(-FooterNodeNum));
            if(!lastThreeItems.length) return [];
            return lastThreeItems.reverse().map(item => {
                const repoNum = item.computed.repoNum;
                const repoFullNum = item.computed.repoFullNum;
                const repoExtra = item.computed.repoExtraNum;
                let repoExtraText = repoExtra + '';
                if(repoExtra > 0) {
                    repoExtraText = `<strong>${repoExtra}</strong>`
                }
                return {
                    tagName:'div',
                    className:'item',
                    childs:[
                        {
                            tagName:'div',
                            className:'label',
                            innerText:item.recordDate
                        },
                        {
                            tagName:'div',
                            innerHTML:`仓仅(${repoNum}),总仓${repoFullNum}),仓额(${repoExtraText})`
                        }
                    ]
                }
            })
        }
    },
    {
        label:'数量对比',
        fields:['systemNum','repoFullNum'],
        navigateBelongField:'repo',
        getCanvasFooterNodes(chartMaterialItems){
            const lastThreeItems = cloneData(chartMaterialItems.slice(-FooterNodeNum));
            if(!lastThreeItems.length) return [];
            return lastThreeItems.reverse().map(item => {
                const systemNum = item.computed.systemNum;
                const repoFullNum = item.computed.repoFullNum;
                return {
                    tagName:'div',
                    className:'item',
                    childs:[
                        {
                            tagName:'div',
                            className:'label',
                            innerText:item.recordDate
                        },
                        {
                            tagName:'div',
                            innerHTML:`系统(${systemNum},仓库(${repoFullNum}),差值:<strong>${systemNum - repoFullNum}</strong>`
                        }
                    ]
                }
            })
        }
    },
    {
        label:'消耗对比',
        fields:['dayUse','averageDayUse'],
        navigateBelongField:'repo',
        getCanvasFooterNodes(chartMaterialItems){
            const lastThreeItems = cloneData(chartMaterialItems.slice(-FooterNodeNum));
            if(!lastThreeItems.length) return [];
            return lastThreeItems.reverse().map(item => {
                const dayUse = item.computed.chartData.dayUse;
                const weekUseText = item.computed.chartData.weekUseText;
                const averageDayUse = item.computed.chartData.averageDayUse;
                return {
                    tagName:'div',
                    className:'item',
                    childs:[
                        {
                            tagName:'div',
                            className:'label',
                            innerText:item.recordDate
                        },
                        {
                            tagName:'div',
                            innerHTML:`周耗(${weekUseText}),日耗(${dayUse}),均日耗(${averageDayUse})`
                        }
                    ]
                }
            })
        }
    },
    {
        label:'出库建议(缓和)',
        fields:['averageDayUse','outSuggestByRepoFull'],
        navigateBelongField:'repo',
        getCanvasFooterNodes(chartMaterialItems){
            const lastThreeItems = cloneData(chartMaterialItems.slice(-FooterNodeNum));
            if(!lastThreeItems.length) return [];
            const returnNodes:Array<CreateElementConfig> = lastThreeItems.reverse().map(item => {
                const outSuggestTextByRepoFull = item.computed.chartData.outSuggestTextByRepoFull;
                return {
                    tagName:'div',
                    className:'item',
                    childs:[
                        {
                            tagName:'div',
                            className:'label',
                            innerText:item.recordDate
                        },
                        {
                            tagName:'div',
                            innerHTML:outSuggestTextByRepoFull + `[暴出库:${item.computed.chartData.outSuggestByRepo}]`
                            // innerHTML:`系统(${systemNum}),仓库全(${repoFullNum}),均日耗(${averageDayUse}),出库(暴)(${outSuggestByRepo}),出库(缓)(<strong>${outSuggestByRepoFull}</strong>)`
                        }
                    ]
                }
            })
             // 最后一个物料记录的信息
            if(lastThreeItems[0].list.length > 1) {
                returnNodes.push({
                    tagName:'div',
                    className:'item border',
                    childs:lastThreeItems[0].list.map(brandItem => {
                        const systemNum = brandItem.computed.systemNum;
                        const repoFullNum = brandItem.computed.repoFullNum;
                        const repoNum = brandItem.computed.repoNum;
                        return {
                            tagName:'div',
                            childs:[
                                {
                                    tagName:'div',
                                    className:'label',
                                    innerHTML:`${brandItem.label}&nbsp;<span class="info">${brandItem.specsText}</span>`
                                },
                                {
                                    tagName:'div',
                                    innerText:`${brandPriorityMap[brandItem.priority]},系(${systemNum}),仓仅(${repoNum}),总仓(${repoFullNum})`
                                }
                            ]
                        }
                    })
                })
            }
            return returnNodes
        }
    },
    {
        label:'出库建议(暴力)',
        fields:['averageDayUse','outSuggestByRepo'],
        navigateBelongField:'repo',
        getCanvasFooterNodes(chartMaterialItems){
            const lastThreeItems = cloneData(chartMaterialItems.slice(-FooterNodeNum));
            if(!lastThreeItems.length) return [];
            console.log(lastThreeItems)
            const returnNodes:Array<CreateElementConfig> = lastThreeItems.reverse().map(item => {
                const outSuggestTextByRepo = item.computed.chartData.outSuggestTextByRepo;
                return {
                    tagName:'div',
                    className:'item',
                    childs:[
                        {
                            tagName:'div',
                            className:'label',
                            innerText:item.recordDate
                        },
                        {
                            tagName:'div',
                            innerHTML:outSuggestTextByRepo + `[缓出库:${item.computed.chartData.outSuggestByRepoFull}]`
                        }
                    ]
                }
            })
            // 再增加品牌的逻辑
            // 最后一个物料记录的信息
            if(lastThreeItems[0].list.length > 1) {
                returnNodes.push({
                    tagName:'div',
                    className:'item border',
                    childs:lastThreeItems[0].list.map(brandItem => {
                        const systemNum = brandItem.computed.systemNum;
                        const repoFullNum = brandItem.computed.repoFullNum;
                        const repoNum = brandItem.computed.repoNum;
                        return {
                            tagName:'div',
                            childs:[
                                {
                                    tagName:'div',
                                    className:'label',
                                    innerHTML:`${brandItem.label}&nbsp;<span class="info">${brandItem.specsText}</span>`
                                },
                                {
                                    tagName:'div',
                                    innerText:`${brandPriorityMap[brandItem.priority]},系(${systemNum}),仓仅(${repoNum}),总仓(${repoFullNum})`
                                }
                            ]
                        }
                    })
                })
            }
            return returnNodes;
        }
    },
    {
        label:'购买建议',
        fields:['repoFullNum','purchaseNum','purchaseSuggest'],
        navigateBelongField:'purchase',
        getCanvasFooterNodes(chartMaterialItems){
            const lastThreeItems = cloneData(chartMaterialItems.slice(-FooterNodeNum));
            if(!lastThreeItems.length) return [];
            const returnNodes:Array<CreateElementConfig> = lastThreeItems.reverse().map(item => {
                const purchaseSuggestText = item.computed.chartData.purchaseSuggestText;
                return {
                    tagName:'div',
                    className:'item',
                    childs:[
                        {
                            tagName:'div',
                            className:'label',
                            innerText:item.recordDate
                        },
                        {
                            tagName:'div',
                            innerHTML:purchaseSuggestText
                        }
                    ]
                }
            })
            // 再增加品牌的逻辑
            // 最后一个物料记录的信息
            if(lastThreeItems[0].list.length > 1) {
                returnNodes.push({
                    tagName:'div',
                    className:'item border',
                    childs:lastThreeItems[0].list.map(brandItem => {
                        const systemNum = brandItem.computed.systemNum;
                        const repoFullNum = brandItem.computed.repoFullNum;
                        const repoNum = brandItem.computed.repoNum;
                        return {
                            tagName:'div',
                            childs:[
                                {
                                    tagName:'div',
                                    className:'label',
                                    innerHTML:`${brandItem.label}&nbsp;<span class="info">${brandItem.specsText}</span>`
                                },
                                {
                                    tagName:'div',
                                    innerText:`${brandPriorityMap[brandItem.priority]},仓总(${brandItem.computed.repoFullNum}-${getFormatNumBySpecs(brandItem,brandItem.computed.repoFullNum)})`
                                }
                            ]
                        }
                    })
                })
            }
            return returnNodes;
        }
    },
]
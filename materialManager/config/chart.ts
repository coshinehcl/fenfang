import { BelongComputedNumObj,RecordBelongList, RecordMaterialComputed,myPageBodyStatusUnion,RecordItemComputed } from '@types'
import { createElement, getMaterialValueText, getFormatNum } from '@utils'

type ChartDataFieldItem<T extends string,B extends string,V> = {
    field:T,
    label:B,
    type:V
}
type ChartDataFields = [
    ChartDataFieldItem<'dayUse','日耗',number | '-'>,
    ChartDataFieldItem<'weekUseText','周耗',string>,
    ChartDataFieldItem<'monthUseText','月耗',string>,
    ChartDataFieldItem<'averageDayUse','均耗',number>,
    ChartDataFieldItem<'availableDay','可用',number>,
    ChartDataFieldItem<'outSuggestStrong','强出库',number | '-'>,
    ChartDataFieldItem<'outSuggestStrongText','强出库描述',string>,
    ChartDataFieldItem<'outSuggestRelax','缓出库',number | '-'>,
    ChartDataFieldItem<'outSuggestRelaxText','缓出库描述',string>,
    ChartDataFieldItem<'purchaseSuggest','购买',number | '-'>,
    ChartDataFieldItem<'purchaseSuggestText','购买描述',string>,
]
type ChartDataFieldsList<T extends ChartDataFields> = {
    [key in keyof T]:Omit<T[key] & {default:T[key]['type']},'type'>
}

export const chartDataFields:ChartDataFieldsList<ChartDataFields> = [
    {
        field:'dayUse',
        label:'日耗',
        default:'-',
    },
    {
        field:'weekUseText',
        label:'周耗',
        default:'',
    },
    {
        field:'monthUseText',
        label:'月耗',
        default:'',
    },
    {
        field:'averageDayUse',
        label:'均耗',
        default:0,
    },
    {
        field:'availableDay',
        label:'可用',
        default:0,
    },
    {
        field:'outSuggestStrong',
        label:'强出库',
        default:'-',
    },
    {
        field:'outSuggestStrongText',
        label:'强出库描述',
        default:''
    },
    {
        field:'outSuggestRelax',
        label:'缓出库',
        default:'-'
    },
    {
        field:'outSuggestRelaxText',
        label:'缓出库描述',
        default:''
    },
    {
        field:'purchaseSuggest',
        label:'购买',
        default:'-'
    },
    {
        field:'purchaseSuggestText',
        label:'购买描述',
        default:''
    }
] as const;

type _ChartDataFieldsType  =  {
    [key in ChartDataFields[number] as key['field']]:key['type']
};
type _ChartDataFieldsNumberFields = keyof {
    [key in ChartDataFields[number] as (number extends key['type'] ? key['field'] : never)]:key['type']
}
type ChartDataTypesFieldsItem = {
    field:_ChartDataFieldsNumberFields | keyof BelongComputedNumObj | 'repoFullNum' | 'system_repoFull_Num',
    label:string,
    navigateBelongField:RecordBelongList[number]['belong'],
    navigateTo?:(item:RecordMaterialComputed)=>myPageBodyStatusUnion,
    getValue:(item:RecordMaterialComputed) => number | '-'
}
type ChartItemList = Array<{
    recordDate:RecordItemComputed['recordDate']
} & RecordMaterialComputed>
type ChartDataTypesItem = {
    label:string,
    fields:Array<ChartDataTypesFieldsItem>,
    navigateBelongField:RecordBelongList[number]['belong'],
    footer:(items:ChartItemList)=>Array<HTMLElement | undefined>
}
const chartDataTypeMap:Record<ChartDataTypesFieldsItem['field'],ChartDataTypesFieldsItem> = {
    'system_repoFull_Num':{
        field:'system_repoFull_Num',
        label:'[系-仓]差值',
        navigateBelongField:'repo',
        getValue(item){
            return item.computed.systemNum - (item.computed.repoNum + item.computed.repoExtraNum);
        }
    },
    'repoNum':{
        field:'repoNum',
        label:'仓库',
        navigateBelongField:'repo',
        getValue(item){
            return item.computed.repoNum
        }
    },
    'availableDay':{
        field:'availableDay',
        label:'可用',
        navigateBelongField:'repo',
        getValue(item) {
            return item.chartData.availableDay
        },
    },
    'averageDayUse':{
        field:'averageDayUse',
        label:'均日耗',
        navigateBelongField:'repo',
        navigateTo:(item) => ({
            label:'物料',
            status:{
                activeLabel:item.label
            }
        }),
        getValue(item) {
            return item.chartData.averageDayUse
        },
    },
    'repoExtraNum':{
        field:'repoExtraNum',
        label:'仓额',
        navigateBelongField:'repoExtra',
        getValue(item) {
            return item.computed.repoExtraNum
        },
    },
    'repoFullNum':{
        field:'repoFullNum',
        label:'总仓',
        navigateBelongField:'repo',
        getValue(item) {
            return item.computed.repoExtraNum + item.computed.repoNum
        },
    },
    'systemNum':{
        field:'systemNum',
        label:'系统',
        navigateBelongField:'system',
        getValue(item) {
            return item.computed.systemNum;
        },
    },
    'purchaseNum':{
        field:'purchaseNum',
        label:'购买了',
        navigateBelongField:'purchase',
        getValue(item) {
            return item.computed.purchaseNum;
        },
    },
    'outSuggestRelax':{
        field:'outSuggestRelax',
        label:'缓出库',
        navigateBelongField:'repo',
        getValue(item) {
            return item.chartData.outSuggestRelax
        },
    },
    'outSuggestStrong':{
        field:'outSuggestStrong',
        navigateBelongField:'repo',
        label:'强出库',
        getValue(item) {
            return item.chartData.outSuggestStrong
        },
    },
    'purchaseSuggest':{
        field:'purchaseSuggest',
        label:'需要采购',
        navigateBelongField:'repo',
        getValue(item) {
            return item.chartData.purchaseSuggest
        },
    },
    'dayUse':{
        field:'dayUse',
        label:'日耗',
        navigateBelongField:'repo',
        getValue(item) {
            return item.chartData.dayUse
        },
    }
}
export const chartDataTypes:Array<ChartDataTypesItem> = [
    {
        label:'仓库数量',
        fields:[chartDataTypeMap.repoNum,chartDataTypeMap.repoExtraNum,chartDataTypeMap.repoFullNum],
        navigateBelongField:'repo',
        footer:(items)=> {
            return items.map(item => {
                const systemNum = item.computed.systemNum;
                const repoFullNum = item.computed.repoExtraNum + item.computed.repoNum;
                return createElement({
                    tagName:'div',
                    className:'footer-item',
                    childs:[
                        createElement({
                            tagName:'div',
                            className:'date',
                            innerText:item.recordDate
                        }),
                        createElement({
                            tagName:'div',
                            className:'content',
                            innerHTML:`系统(${systemNum}),仓库(${repoFullNum}),差额<strong>${systemNum - repoFullNum}</strong>`
                        })
                    ]
                })
            })
        }
    },
    {
        label:'仓库-系统数量',
        fields:[chartDataTypeMap.repoFullNum,chartDataTypeMap.systemNum,chartDataTypeMap.system_repoFull_Num],
        navigateBelongField:'repo',
        footer:(items)=> {
            return items.map(item => {
                const systemNum = item.computed.systemNum;
                const repoFullNum = item.computed.repoExtraNum + item.computed.repoNum;
                return createElement({
                    tagName:'div',
                    className:'footer-item',
                    childs:[
                        createElement({
                            tagName:'div',
                            className:'date',
                            innerText:item.recordDate
                        }),
                        createElement({
                            tagName:'div',
                            className:'content',
                            innerHTML:`系统(${systemNum}),仓库(${repoFullNum}),差额<strong>${systemNum - repoFullNum}</strong>`
                        })
                    ]
                })
            })
        }
    },
    {
        label:'消耗对比',
        fields:[chartDataTypeMap.dayUse,chartDataTypeMap.averageDayUse],
        navigateBelongField:'repo',
        footer:(items)=> {
            return items.map(item => {
                const dayUse = item.chartData.dayUse;
                const averageDayUse = item.chartData.averageDayUse;
                const useDistance = dayUse !== '-' ? getFormatNum(dayUse-averageDayUse) : '-'
                return createElement({
                    tagName:'div',
                    className:'footer-item',
                    childs:[
                        createElement({
                            tagName:'div',
                            className:'date',
                            innerText:item.recordDate
                        }),
                        createElement({
                            tagName:'div',
                            className:'content',
                            innerHTML:`日耗(${dayUse}),均耗(${averageDayUse}),差额<strong>${useDistance}</strong>`
                        })
                    ]
                })
            })
        }
    },
    {
        label:'出库',
        fields:[chartDataTypeMap.outSuggestRelax,chartDataTypeMap.outSuggestStrong,chartDataTypeMap.averageDayUse],
        navigateBelongField:'repo',
        footer:(items)=> {
            return items.map(item => {
                const systemNum = item.computed.systemNum;
                const dayUse = item.chartData.dayUse;
                const averageDayUse = item.chartData.averageDayUse
                const repoFullNum = item.computed.repoExtraNum + item.computed.repoNum;
                return createElement({
                    tagName:'div',
                    className:'footer-item',
                    childs:[
                        createElement({
                            tagName:'div',
                            className:'date',
                            innerText:item.recordDate
                        }),
                        createElement({
                            tagName:'div',
                            className:'content',
                            childs:[
                                createElement({
                                    tagName:'div',
                                    innerHTML:`系统(${systemNum}),仓库(${repoFullNum}),日耗(${dayUse}),均耗(${averageDayUse})`
                                }),
                                createElement({
                                    tagName:'div',
                                    innerHTML:item.chartData.outSuggestStrongText
                                }),
                                createElement({
                                    tagName:'div',
                                    innerHTML:item.chartData.outSuggestRelaxText
                                }),
                            ]
                        })
                    ]
                })
            })
        }
    },
    {
        label:'采购',
        fields:[chartDataTypeMap.purchaseSuggest,chartDataTypeMap.purchaseNum],
        navigateBelongField:'purchase',
        footer:(items)=> {
            return items.map(item => {
                const systemNum = item.computed.systemNum;
                const repoFullNum = item.computed.repoExtraNum + item.computed.repoNum;
                let purchaseNumFormat = '';
                if(item.chartData.purchaseSuggest!== '-' && item.chartData.purchaseSuggest!== 0) {
                    purchaseNumFormat = getMaterialValueText(item,item.chartData.purchaseSuggest)
                }
                return createElement({
                    tagName:'div',
                    className:'footer-item',
                    childs:[
                        createElement({
                            tagName:'div',
                            className:'date',
                            innerText:item.recordDate
                        }),
                        createElement({
                            tagName:'div',
                            className:'content',
                            childs:[
                                createElement({
                                    tagName:'div',
                                    innerHTML:`系统(${systemNum}),仓库(${repoFullNum}),可用天数${item.chartData.availableDay}`
                                }),
                                createElement({
                                    tagName:'div',
                                    innerHTML:item.chartData.purchaseSuggestText + (purchaseNumFormat ? `即<strong>${purchaseNumFormat}</strong>` : '')
                                })
                            ]
                        })
                    ]
                })
            })
        }
    }
]

declare module '@typeConfig' {
    /** config.materials */
   export type  ChartDataFieldsType = _ChartDataFieldsType;
}
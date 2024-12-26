import { RecordMaterialItemBrandItem,RecordMaterialItem,RecordBelongsFields,MaterialsItem,RecordBelongsFields,RecordItem,ComponentsExport,GetKeysByType } from '@types'
export type CustomElementTags = 'my-inputs' | 'my-charts' | 'my-material-item'

interface ChartItemRecordItem extends Record<RecordBelongsFields,RecordMaterialItem> {
    recordDate:RecordItem['recordDate'],
}
export interface ChartItemBasic {
    label:RecordMaterialItem['label'],
    basicInof:{
        uasge:MaterialsItem['uasge'],
        unit:MaterialsItem['unit'],
        brandList:MaterialsItem['list']
    },
    recordList:Array<ChartItemRecordItem>
}
interface ChartItemRenderDataBasicItemCommon extends Record<RecordBelongsFields,number>{
    recordDate:RecordItem['recordDate'],
}
interface ChartItemRenderDataItem extends ChartItemRenderDataBasicItemCommon {
    dayUse:number | '-',
    weekUse:number | '-',
    averageDayUse:number | '-',
    availableDay:number | '-',
    outSuggest:number | '-'
    outSuggestText:string,
    purchaseSuggest:number,
    purchaseSuggestText:string
}
/** 给图表消费 */
export type ChartItemRenderDataItemLike = ChartItemRenderDataItem & {label:string}
export type ChartLabelFields = GetKeysByType<ChartItemRenderDataItem,number | '-'>
export type ChartFooterFields = Exclude<GetKeysByType<ChartItemRenderDataItem,string>,'recordDate'>
export type ChartFooterItem = ChartFooterFields | ((item:ChartItemRenderDataItemLike)=> string)

interface ChartItemRenderData<T> {
    renderData:{
        materialItem:Array<T & {
            label:RecordMaterialItem['label']
        }>,
        brandList:Array<Array<T & {
            label:RecordMaterialItemBrandItem['label'],
            priority:RecordMaterialItemBrandItem['priority'],
            isDeprecated:RecordMaterialItemBrandItem['isDeprecated'],
        }>>
    }
}
export type ChartItemBasicAndRenderBasic = ChartItemBasic & ChartItemRenderData<ChartItemRenderDataBasicItemCommon>
export type ChartItem = ChartItemBasic & ChartItemRenderData<ChartItemRenderDataItem>
export interface CustomElementInitMap {
    'my-inputs':{
        data:RecordMaterialItem,
        params:{
             /** 归属 */
            belong:RecordBelongsFields,
            /** 归属text */
            belongText:string,
            /** 是否仅展示最后规格的输入框 */
            onlyDisplayLastSpecInput:boolean,
            /**点击物料(非子品牌)，页面滚动到下一个归属的同品牌位置 */
            pageScrollToNextBelongSelf:() => void,
            /** 根据recordData查到到上次的记录数据，为输入框提供额外的辅助信息 */
            lastMaterialItem: RecordMaterialItem | undefined,
            /** 当前记录项 */
            currentRecordItem:RecordItem | undefined
        }
    },
    'my-charts':{
        data:ChartItem,
        params:{
            /** 当前物料 */
            label:MaterialsItem['label'],
            /** chart的datasets的label */
            datasetsLabels:Array<ChartLabelFields>,
            /** 图表底部要处理的item字段数组 */
            footer:Array<ChartFooterItem>,
            /** label的映射 */
            datasetsLabelsMap:{
                [k in ChartLabelFields]:string
            }
        }
    },
    'my-material-item':{
        data:MaterialsItem,
        params:{}
    }
}

export interface CustomElement<T extends CustomElementTags> extends HTMLElement {
    $shadowRoot: ShadowRoot;
    $initHandler: Function;
    // 实例方法
    connectedCallback(): void;
    initHandler(data:CustomElementInitMap[T]['data'],params:CustomElementInitMap[T]['params']):void;
    active(): void;
}
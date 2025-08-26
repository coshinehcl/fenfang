import { GetArrayType, MaterialsItem,PickKeysByType,RecordBelongNum,RecordMaterialItemHooks,RecordItemHooks, CreateElementConfig } from '@types'

type ChartLabels = '归属数量' | '仓库数量' | '数量对比' | '消耗对比' | '出库建议(缓和)' | '出库建议(暴力)' | '购买建议'
type ChartShowTypeItem<T extends ChartLabels> = {
    label:T,
    fields:ChartShowType['fields'],
    /** 点击label跳转到表单的哪个归属 */
    navigateBelongField:RecordBelong[number]['field']
    getCanvasFooterNodes:ChartShowType['getCanvasFooterNodes']
}
export type ChartShowTypesList = [
    ChartShowTypeItem<'归属数量'>,
    ChartShowTypeItem<'仓库数量'>,
    ChartShowTypeItem<'数量对比'>,
    ChartShowTypeItem<'消耗对比'>,
    ChartShowTypeItem<'出库建议(缓和)'>,
    ChartShowTypeItem<'出库建议(暴力)'>,
    ChartShowTypeItem<'购买建议'>,
]

export interface ChartDataFields {
    dayUse:number | '-',
    weekUseText:string,
    averageDayUse:number,
    availableDay:number | '-',
    /** 通过repo来确认要出库的数量：应付质检的来布草间对比数量 */
    outSuggestByRepo:number | '-'
    /** 通过repoFull来确认要出库的数量 */
    outSuggestByRepoFull:number | '-'
    outSuggestTextByRepo:string,
    outSuggestTextByRepoFull:string,
    purchaseSuggest:number,
    purchaseSuggestText:string
}
export type ChartShowFields = PickKeysByType<ChartDataFields,number> & RecordBelongNum;

export interface ChartDataItem {
    /** 日期 */
    labels:Array<string>
    /** 数据 */
    datasets:Array<{
        field:string,
        /** 标签名称 */
        label:string,
        /** 数据 */
        data:Array<number | string | null>,
    }>,
    chartMaterialItems:Array<ChartMaterialItem>,
    materialItemLabel:MaterialsItem['label']
}

interface ChartOptions {
    /** 图表类型 */
    type:string,
    data:{
        labels:ChartDataItem['labels'],
        datasets:Array<Pick<GetArrayType<ChartDataItem['datasets'],'label' | 'data'>> & {
            [index:string]:any
        }>,
    },
    options:Record<string,any>,
    plugins:Record<string,any>,
}
export type ChartMaterialItem = RecordMaterialItemHooks & {
    recordDate:RecordItemHooks['recordDate']
}
/** 给配置消费 */
export type ChartShowType =  {
    label:string,
    fields:Array<keyof ChartShowFields>,
    getCanvasFooterNodes:(chartMaterialItems:Array<ChartMaterialItem>)=> Array<CreateElementConfig>
}

declare global {
    class Chart {
        static public registry:any;
        static public  register:Function;
        getElementsAtEventForMode:Function;
        constructor(anvas:CanvasRenderingContext2D,otions:ChartOptions) {}
    }
}
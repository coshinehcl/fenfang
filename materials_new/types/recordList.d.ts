import { MaterialsItem, BrandItem,GetArrayType,ChartDataFields } from '@types'

/**
 * 1、存储下的类型
 * 2、补充额外信息下的类型
 * 3、增加hooks，观察数据变化，然后触发hook
 */
export type RecordBelong = [
    {
        field:'system',
        shortLabel:'系',
        label:'系统数量'
    },
    {
        field:'purchase',
        shortLabel:'购',
        label:'购买数量'
    },
    {
        field:'repo',
        shortLabel:'仓',
        label:'仓库数量(在仓库中的)',
    },
    {
        field:'repoExtra',
        shortLabel:'仓额',
        label:'仓库数量(不在仓库中的)'
    },
]
type RecordBelongFields = RecordBelong[number]['field'] | 'repoFull'
export type RecordBelongNum = {
    [key in RecordBelongFields as `${key}Num`]:number
}
type RecordBelongNumChangeHooks = {
    [key in RecordBelongFields as `${key}NumChange`]:Array<(value:number) => void>
}

/** 品牌的记录信息 */
type RecordBrandItemNumList = Array<GetArrayType<BrandItem['specs']> & { num:number }>
export type RecordBelongFieldObj = Record<RecordBelong[number]['field'],RecordBrandItemNumList>
export interface RecordBrandItemBase extends RecordBelongFieldObj{
    label:BrandItem['label']
}
export interface RecordBrandItemFull extends Omit<BrandItem,'specs'>,RecordBrandItemBase {}
export interface RecordBrandItemHooks extends RecordBrandItemFull {
    computed:RecordBelongNum,
    // 具体hooks需要后续界面代码中替代进来
    hooks:RecordBelongNumChangeHooks,
    /** 规格说明 */
    specsText:string,
}

type RecordMaterialGhost<T> = {
    label:MaterialsItem['label'],
    list:Array<T>
}
export type RecordMaterialItemBase = RecordMaterialGhost<RecordBrandItemBase>
export type RecordMaterialItemFull = RecordMaterialGhost<RecordBrandItemFull> & Omit<MaterialsItem,'list'>
export type ChartDataChangeFun<T extends keyof ChartDataFields = keyof ChartDataFields> = (field:T,value:ChartDataFields[T]) => void
export type RecordMaterialItemHooks = RecordMaterialGhost<RecordBrandItemHooks> & Omit<RecordMaterialItemFull,'list'> & {
    computed:RecordBelongNum & {
        chartData:ChartDataFields
    },
    // 具体hooks需要后续界面代码中替代进来
    hooks:RecordBelongNumChangeHooks & {
        chartDataChange:Array<(chartData:ChartDataFields) => void>
    }
}

/** 记录项 */
interface RecordItemGhost<T> {
    recordDate:string,
    list:Array<T>
}
export type RecordItemBase = RecordItemGhost<RecordMaterialItemBase>
export type RecordItemFull = RecordItemGhost<RecordMaterialItemFull>
export type RecordItemHooks = RecordItemGhost<RecordMaterialItemHooks>

export interface RecordListExport {
    jsonId: "仓库物料",
    list:Array<RecordItem>
}
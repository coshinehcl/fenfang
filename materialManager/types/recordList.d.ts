import {MaterialItem,BrandItem, GetArrayItemType,RecordBelongList,ChartDataFieldsType} from '@types'

export type BelongNumObj = {
    [key in RecordBelongList[number]['belong']]:Array<Pick<GetArrayItemType<BrandItem['specs']>,'unit'> & {num:number}>
}
type BelongNumObjFull = {
    [key in RecordBelongList[number]['belong']]:Array<GetArrayItemType<BrandItem['specs']> & {num:number}>
}
export type BelongComputedNumObj = {
    [key in RecordBelongList[number]['belong'] as `${key}Num`]:number
}
type BelongNumChangeHooks = {
    [key in RecordBelongList[number]['belong'] as `on${Capitalize<key>}NumChange`]:Array<Function>
}

// 品牌
type RecordBrandItemBase = {label:BrandItem['label']} & BelongNumObj
type RecordBrandItemFull = BrandItem & BelongNumObjFull
type RecordBrandItemComputed = RecordBrandItemFull & {
    computed:BelongComputedNumObj,
    hooks:BelongNumChangeHooks
}

// 物料
type RecordMaterialBase = {label:MaterialItem['label'],list:Array<RecordBrandItemBase>}
type RecordMaterialFull = Omit<MaterialItem,'list'> & {list:Array<RecordBrandItemFull>}
type RecordMaterialComputed = Omit<RecordMaterialFull,'list'> & {list:Array<RecordBrandItemComputed>}& {
    computed:BelongComputedNumObj,
    chartData:ChartDataFieldsType,
    onChartDataChange:Array<Function>,
    hooks:BelongNumChangeHooks
}

// 记录项
type RecordItemGhost<T> = {
    recordDate:string,
    list:Array<T>
}
export type RecordItemBase = RecordItemGhost<RecordMaterialBase>
export type RecordItemFull = RecordItemGhost<RecordMaterialFull>
export type RecordItemComputed = RecordItemGhost<RecordMaterialComputed>
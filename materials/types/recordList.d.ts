
import { DateFull,MaterialsItem,GetArrayType } from './index'
export interface RecordMaterialItemBrandItem extends Pick<GetArrayType<MaterialsItem['list']>,'label' | 'priority' | 'isDeprecated'>{
    /** 该品牌的各规格数量 */
    numList: Array<GetArrayType<GetArrayType<MaterialsItem['list']>['specs']> 
    & {
        num:number
    }>
}
export interface RecordMaterialItem  extends Pick<MaterialsItem,'label' | 'unit'>{
    /** 该物料下的品牌列表的数据记录 */
    list:Array<RecordMaterialItemBrandItem>
}
export type RecordBelongsFields = 'system' | 'repo' | 'purchase'
export interface RecordItem extends Record<RecordBelongsFields,Array<RecordMaterialItem>>{
    recordDate:DateFull
}
import { ArrayPushItem,CheckAByB } from '@types'

type MaterialItemLabels = '沐浴露' | '洗发水' | '洗手液' | '矿泉水' | '牙膏' | 
'面巾纸' | '卷纸' | '拖鞋' | '大垃圾袋' | '小垃圾袋' | '茶叶' | '儿童拖鞋' | 
'牙具套餐' | '梳子' | '牙刷' | '咖啡'

type UnitsBig = '包' | '箱'
type UnitsMiddle = '提' | '扎' | '盒'
type UnitsSmall = '包' | '瓶' | '支' | '双' | '卷' | '个' | '套' | '把' | '袋'
type Units = UnitsBig | UnitsMiddle | UnitsSmall

export type _BrandPriority = 1 | 2 | 3
interface BrandItemStrict<U extends UnitsSmall = UnitsSmall> {
    /** 品牌名称 */
    label:string,
    /** 是否废弃 */
    isDeprecated?:boolean,
    /** 品牌规格:最后一项的spec必须是1 */
    specs:ArrayPushItem<Array<{
        /** 单位 */
        unit:Units,
        /** 该单位下有多少数量 */
        spec:number
    }>,{
        unit:U,
        spec:1
    }>,
    priority:_BrandPriority
}
export interface _MaterialItemStrict<L extends MaterialItemLabels = MaterialItemLabels,U extends UnitsSmall = UnitsSmall> {
    /** 物品名称：这些物品名称后续不可更改，作为id */
    label:L,
    /** 是否废弃 */
    isDeprecated?:boolean,
    /** 下属品牌 */
    list:Array<BrandItemStrict<U>>,
    /** 消耗量 */
    usage:{
        min:number,
        /** 最大消耗量 */
        max:number
    }
    /** 基准日耗 */
    baseAverageDayUse:number
}
export interface _BrandItem {
    /** 品牌名称 */
    label:string,
    /** 是否废弃 */
    isDeprecated?:boolean,
    /** 品牌规格:最后一项的spec必须是1 */
    specs:Array<{
        /** 单位 */
        unit:Units,
        /** 该单位下有多少数量 */
        spec:number
    }>
    priority:_BrandPriority
}
export interface _MaterialItem {
    /** 物品名称：这些物品名称后续不可更改，作为id */
    label:MaterialItemLabels,
    /** 是否废弃 */
    isDeprecated?:boolean,
    /** 下属品牌 */
    list:Array<_BrandItem>,
    /** 消耗量 */
    usage:{
        min:number,
        /** 最大消耗量 */
        max:number
    }
    /** 基准日耗 */
    baseAverageDayUse:number
}
export interface _BrandItemAtEdit extends _BrandItem {
    isNewAdd?:true,
}
export interface _MaterialItemAtEdit extends Omit<_MaterialItem,'list'> {
    isNewAdd?:true,
    list:Array<_BrandItemAtEdit>
}
/**
 * 这里来确保宽松和严格类型下，是匹配的
 */
type _BrandItemCheck = CheckAByB<BrandItemStrict,_BrandItem>;
type _MaterialsItemCheck = CheckAByB<_MaterialItemStrict,_MaterialItem>;
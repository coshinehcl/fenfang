export type MaterialsItemLabels = '沐浴露' | '洗发水' | '洗手液' | '矿泉水' | '牙膏' | 
'面巾纸' | '卷纸' | '拖鞋' | '大垃圾袋' | '小垃圾袋' | '茶叶' | '儿童拖鞋' | 
'牙具套餐' | '梳子' | '牙刷' | '咖啡'

type UnitsBig = '包' | '箱'
type UnitsMiddle = '提' | '扎' | '盒'
type UnitsSmall = '包' | '瓶' | '支' | '双' | '卷' | '个' | '套' | '把' | '袋'
type Units = UnitsBig | UnitsMiddle | UnitsSmall

export interface BrandItem {
    /** 品牌名称 */
    label:Exclude<string,MaterialsItemLabels>,
    /** 是否废弃 */
    isDeprecated?:boolean,
    /** 品牌规格 */
    specs:Array<{
        /** 单位 */
        unit:MaterialsItemUnits,
        /** 该单位下有多少数量 */
        spec:number
    }>,
    /** 使用优先级： 1、优先使用 2、次优先使用 3、不再使用 */
    priority:1 | 2 | 3
}
export interface MaterialsItem {
    /** 物品名称：这些物品名称后续不可更改，作为id */
    label:MaterialsItemLabels,
    /** 是否废弃 */
    isDeprecated?:boolean,
    /** 下属品牌 */
    list:Array<BrandItem>,
    /** 消耗量 */
    uasge:{
        /** 最少消耗量 */
        min:number,
        /** 最大消耗量 */
        max:number
    },
    /** 单位 */
    unit:UnitsSmall,
    /** 基准日耗 */
    baseAverageDayUse:number
}
export interface MaterialsItemAtEdit extends Omit<MaterialsItem,'list'>{
    newAdd?:boolean,
    list:Array<BrandItem & {
        newAdd?:boolean,
    }>
}
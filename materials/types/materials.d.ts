type MaterialsItemLabels = '沐浴露' | '洗发水' | '洗手液' | '矿泉水' | '牙膏' | 
'抽纸' | '卷纸' | '成人拖鞋' | '大垃圾袋' | '小垃圾袋' |'成人拖鞋' | '茶叶' | '儿童拖鞋' | 
'儿童牙具套餐' | '梳子' | '成人牙刷' | '咖啡'
type MaterialsItemUnitsBig = '包' | '箱'
type MaterialsItemUnitsMiddle = '提' | '扎' | '盒'
type MaterialsItemUnitsSmall = '瓶' | '支' | '双' | '卷' | '个' | '套' | '把' | '袋'
type MaterialsItemUnits = MaterialsItemUnitsBig | MaterialsItemUnitsMiddle | MaterialsItemUnitsSmall
export interface BrandItem {
    /** 品牌名称 */
    label:string,
    /** 系统中该数量为0，且后续不会进货，则标记为废弃：仓库如果有部分剩余，则统计到其他品牌中，被废弃的只是不会在界面中展示，其他地方还是需要的 */
    isDeprecated?:boolean,
    /** 品牌规格 */
    specs:Array<{
        /** 单位 */
        unit:MaterialsItemUnits,
        /** 该单位下有多少数量 */
        spec:number
    }>,
    /** 使用优先级： 1、优先使用 2、无高优先级使用(替代) 3、不推荐使用(旧的) */
    priority:1 | 2 | 3
}
export interface MaterialsItem {
    /** 物品名称：这些物品名称后续不可更改，作为id */
    label:MaterialsItemLabels,
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
    unit:MaterialsItemUnits
}
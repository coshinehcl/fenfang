import {RecordBrandItemBase,RecordBrandItemFull,RecordBrandItemHooks,
    RecordMaterialItemBase,RecordMaterialItemFull,RecordMaterialItemHooks,
    RecordItemBase,RecordItemFull,RecordItemHooks
} from '@types'

const brandBase:RecordBrandItemBase = {
    label:'123',
    system:[{
        unit:'箱',
        spec:10,
        num:1
    }],
    purchase:[{
        unit:'箱',
        spec:10,
        num:1
    }],
    repo:[{
        unit:'箱',
        spec:10,
        num:1
    }],
    repoExtra:[{
        unit:'箱',
        spec:10,
        num:1
    }]
}
const brandFull:RecordBrandItemFull = {
    ...brandBase,
    // 增加以下属性
    isDeprecated:false,
    /** 使用优先级： 1、优先使用 2、无高优先级使用(替代) 3、不推荐使用(旧的) */
    priority:1
}
const brandHooks:RecordBrandItemHooks = {
    ...brandFull,
    computed:{
        purchaseNum:1,
        repoNum:1,
        repoExtraNum:1,
        systemNum:1,
        repoFullNum:2
    },
    hooks:{
        purchaseNumChange:[(value:number)=>{}],
        repoNumChange:[(value:number)=>{}],
        repoExtraNumChange:[(value:number)=>{}],
        systemNumChange:[(value:number)=>{}],
        repoFullNumChange:[(value:number)=>{}],
    },
    specsText:''
}

// 物料
const materialBase:RecordMaterialItemBase = {
    label:'儿童拖鞋',
    list:[
        brandBase
    ]
}
const materialFull:RecordMaterialItemFull = {
    ...materialBase,
    // 修改属性
    list:[brandFull],
    // 增加以下属性
    uasge:{
        /** 最少消耗量 */
        min:1,
        /** 最大消耗量 */
        max:10
    },
    /** 单位 */
    unit:'个',
    baseAverageDayUse:0
}
const materialHooks:RecordMaterialItemHooks = {
    ...materialFull,
    // 修改属性
    list:[brandHooks],
    // 增加以下属性
    computed:{
        purchaseNum:1,
        repoNum:1,
        repoExtraNum:1,
        systemNum:1,
        repoFullNum:2,
        chartData:{
            dayUse:1,
            weekUseText:'',
            averageDayUse:1,
            availableDay:1,
            outSuggestByRepo:1,
            outSuggestByRepoFull:1,
            outSuggestTextByRepo:'',
            outSuggestTextByRepoFull:'',
            purchaseSuggest:1,
            purchaseSuggestText:'',
        },
    },
    hooks:{
        purchaseNumChange:[(value)=> {}],
        repoNumChange:[(value)=>{}],
        repoExtraNumChange:[(value)=>{}],
        systemNumChange:[(value)=>{}],
        repoFullNumChange:[(value)=>{}],
        chartDataChange:[(chartData) => {}]
    }
}

// 记录项
const recordBase:RecordItemBase = {
    recordDate:'12',
    list:[materialBase]
}
const recordFull:RecordItemFull = {
    recordDate:'12',
    list:[materialFull]
}
const recordComputed:RecordItemHooks = {
    recordDate:'12',
    list:[materialHooks]
}
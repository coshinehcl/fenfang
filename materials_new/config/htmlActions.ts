import { HtmlActions,HtmlActionLabelMap } from '@types'

export const htmlActions:HtmlActions = [
    {
        label:'物料',
        component:'my-materials',
        options:{
            status:{}
        }
    },
    {
        label:'新增',
        component:'my-form',
        options:{
            params:{
                type:'add'
            },
            status:{},
        }
    },
    {
        label:'修改',
        component:'my-form',
        options:{
            params:{
                type:'modify'
            },
            status:{},
        }
    },
    {
        label:'图表',
        component:'my-charts',
        options:{
            status:{
                // 默认是出库
                defaultType:'出库建议(缓和)'
            },
        }
    },
    {
        label:'其它',
        component:'my-others',
        options:{
            status:{}
        }
    },
];
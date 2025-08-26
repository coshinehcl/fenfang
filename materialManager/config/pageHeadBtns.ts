/**
 * 页面头部按钮配置
 */
import { PageHeadBtn } from './types/pageHeadBtns'
type _PageHeadBtns = [
    PageHeadBtn<'物料','my-materials'>,
    PageHeadBtn<'新增','my-record-form'>,
    PageHeadBtn<'修改','my-record-form'>,
    PageHeadBtn<'图表','my-charts'>,
    PageHeadBtn<'其他','my-others'>,
]
declare module '@typeConfig' {
    /** config.pageHeadBtns */
    export type PageHeadBtns = _PageHeadBtns
    export type PageHeadLabelMap = {
        [key in PageHeadBtns[number] as key['label']]:key
    }
}
export const pageHeadBtns:_PageHeadBtns = [
    {
        label:'物料',
        componentName:'my-materials',
        options:{},
        status:{}
    },
    {
        label:'新增',
        componentName:'my-record-form',
        options:{
            type:'add',
        },
        status:{
            date:''
        }
    },
    {
        label:'修改',
        componentName:'my-record-form',
        options:{
            type:'edit',
        },
        status:{
            date:''
        }
    },
    {
        label:'图表',
        componentName:'my-charts',
        options:{},
        status:{
            type:'',
            label:'',
        }
    },
    {
        label:'其他',
        componentName:'my-others',
        options:{},
        status:{}
    }
]
/** 默认激活的item-label，不能为空 */
export function getDefaultHeadItem():_PageHeadBtns[number] {
    return pageHeadBtns.find(i => i.label === '图表')!
}
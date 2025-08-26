/**
 * 记录列表需要的归属类型
 */
import { RecordBelongItem } from './types/recordList'
type _RecordBelongList = [
    RecordBelongItem<'system'>,
    RecordBelongItem<'purchase'>,
    RecordBelongItem<'repo'>,
    RecordBelongItem<'repoExtra'>,
]

declare module '@typeConfig' {
    /** config.recordList */
   export type RecordBelongList = _RecordBelongList
}
export const recordBelongList:_RecordBelongList = [
    {
        belong:'system',
        shortLabel:'系统',
        label:'系统',
        onlyShowLastSpecInput:true
    },
    {
        belong:'purchase',
        shortLabel:'采购',
        label:'采购',
        onlyShowLastSpecInput:false,
    },
    {
        belong:'repo',
        shortLabel:'库存',
        label:'库存',
        onlyShowLastSpecInput:false
    },
    {
        belong:'repoExtra',
        shortLabel:'库额',
        label:'库存额外',
        onlyShowLastSpecInput:false
    },
]
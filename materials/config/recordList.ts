import { RecordItem,RecordBelongsFields } from '@types'

export const recordItemBelongs:Array<{
  field:RecordBelongsFields
  label:string
}> = [
  {
    field:'system',
    label:'系统数量'
  },
  {
    field:'purchase',
    label:'购买数量'
  },
  {
    field:'repo',
    label:'仓库数量'
  },
]
import { DateFull,RecordItem,CreateElementConfig,RecordMaterialItem,RecordBelongsFields,MaterialsItem } from '@types'
export type ActionTypes = 'newData' | 'modifyData' | 'viewData' | 'inOutData'
export interface PageNavManager {
    nodesList:Array<{
        node:Element,
        title:string
    }>,
    addPageNav:(node:Element,title:string) => void,
    updatePageNav:() => void,
    renderPageNav:()=> void,
}
export type ActionHandler = (parentNode:Element,params:{
    pageNavManager:PageNavManager
}) => void
export type CreateForm = (options:{
    type:ActionTypes,
    params:Parameters<ActionHandler>[1]
    getFormData:(date:DateFull) => RecordItem,
    parentNode:Element,
    createDateNode:(renderForm:(date?:DateFull)=>void) => CreateElementConfig,
    createSubmitNodes:(data:RecordItem) => Array<CreateElementConfig>,
}) => void
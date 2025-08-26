import { RecordBelong,RecordItemHooks,RecordMaterialItemHooks,FunctionObject,ChartShowTypesList } from '@types'
export type CustomTag = 'my-others' | 'my-actions' | 'my-message' | 'my-inputs' | 'my-form' | 'my-charts' | 'my-materials'
/**
 * 组件需要的数据
 * 如果是action-item。还需要status，用于存储组件内部状态
 * 如果是action-item。数据需要内部获取，方便切换
 */
export type CustomEleOptionsMap = {
    /** 物料的输入框 */
    'my-inputs':{
        /** 当前物料，当前记录项，所有记录项 */
        data:[RecordMaterialItemHooks,RecordItemHooks,Array<RecordItemHooks>],
        params:{
            belong:RecordBelong[number],
            onlyShowLastSpecs:boolean,
            belongHiddenFun:Function,
        },
    },
    'my-charts':{
        status:{
            defaultType?:ChartShowTypesList[number]['label'],
            defaultLabel?:RecordMaterialItemHooks['label']
        }
    },
    'my-form':{
        params:{
            type:'add' | 'modify'
        },
        status:{
            defaultDate?:string,
            selectMaterialItem?:{
                belongField:RecordBelong[number]['field'],
                label?:RecordMaterialItemHooks['label']
            }
        }
    },
    'my-materials':{
        status:{}
    },
    'my-others':{
        status:{

        }
    },
    'my-message':{},
    'my-actions':{}
}

type CustomElementExport<T extends CustomTag = CustomTag> = {
    tagName:T,
    createNode:(shadowRoot:ShadowRoot,options:CustomEleOptionsMap[T],stylePromise:Promise<string>)=>void | FunctionObject
}
export interface CustomEleType extends HTMLElement {
    $shadowRoot:ShadowRoot;
    $initHandler:Function;
    $exportFuns:FunctionObject;
    initHandler:(options:any) => void
}
export type MyMessageEleOptions = {
    /** 纯文本显示,delay后消失*/ 
    delay?:number,
    /** 文本 + 取消按钮,点击按钮后消失 */
    cancel?:boolean,
    /** 文本 + 确认按钮,点击按钮后消失 */
    confirm?:boolean,
    /** 文本 + 取消/确认按钮 + input,点击确认按钮后，校验input无返回值后消失，点击取消按钮消失 */
    input?:{
        /** 默认值 */
        default?:string,
        /** 校验 */
        validate?:(v:string)=> string | void
    },
    textarea?:{
        /** 默认值 */
        default?:string,
        /** 校验 */
        validate?:(v:string)=> string | void
    },
    /** 文本 + 取消/确认按钮 + select */
    select?:{
        list:Array<{
            label:string,
            value:string
        }>,
        onChange:(v:string) => void
    }
}
import { CheckAByB,CreateElementConfig,PageHeadBtns,PageHeadLabelMap,MaterialItem, 
    RecordMaterialComputed,RecordBelongList } from '@types'

type ComponentName = 'my-page-wrapper' | 'my-page-head' | 'my-page-body' 
| 'my-materials' | 'my-record-form' | 'my-charts' | 'my-others' 
| 'my-message' | 'my-dialog' | 'my-material-input' | 'my-input'

/** 用于校验ComponentName是否满足要求，避免无意写错 */
type _ComponentNameCheck = CheckAByB<ComponentName,`my-${string}${string}`>

/**
 * 约束组件的参数类型:这里提供基础
 */
type _ComponentConfigBase = {
    options:Record<string,unknown>,
    status:Record<string,unknown>,
    exposeMethods:Record<string,Function>,
}
/**
 * 进一步约束options
 */
type _ComponentConfigOptions<T extends _ComponentConfigBase> = {
    options:{
        [key:string]:unknown,
        /** 仅当内部的操作的改变status才触发 */
        onStatusChange:(status:Required<T['status']>) => void
    }
}
/**
 * 进一步约束exposeMethods
 */
type _ComponentConfigExposeMethods<T extends _ComponentConfigBase> = {
    exposeMethods:{
        [key:string]:Function,
        updateStatus:(status:Required<T['status']>) => Promise<boolean>
    }
}
/** 这边采用，校验的方式(只能校验满足特定格式)，而不是生成新类型，这样更方便查阅有哪些值 */
// type _ComponentParamsCheck<T extends (_ComponentConfigBase & _ComponentConfigOptions<T> & _ComponentConfigExposeMethods<T>)> = T;
/** 还是采用，部分校验 + 返回新类型的方式 */
type _GetComponentConfig<T extends _ComponentConfigBase> = Omit<T,'options' | 'exposeMethods'> & {
    options:T['options'] & {
        /** 仅手动修改组件内部的时候才触发，避免死循环 */
        onStatusChange?:(status:T['status']) => void
    },
    exposeMethods:T['exposeMethods'] & {
        updateStatus:(status:T['status']) => Promise<boolean>
    }
}

type myPageBodyStatus<T extends keyof PageHeadLabelMap> = {
    label:T,
    status:PageHeadLabelMap[T]['status']
}
export type myPageBodyStatusUnion = {
    [key in keyof PageHeadLabelMap]:myPageBodyStatus<key>
}[keyof PageHeadLabelMap]
type _ComponentConfigMap = {
    'my-page-wrapper':_GetComponentConfig<{
        options:{},
        status:myPageBodyStatusUnion,
        exposeMethods:{}
    }>,
    'my-page-head':_GetComponentConfig<{
        options:{},
        status:{
            label:PageHeadBtns[number]['label']
        },
        exposeMethods:{}
    }>,
    'my-page-body':_GetComponentConfig<{
        options:{},
        status:myPageBodyStatusUnion
        exposeMethods:{}
    }>,
    'my-message':_GetComponentConfig<{
        options:{},
        status:{
            text:string | Array<string>,
            type:'success' | 'warn' | 'info' | 'error',
            duration:number
        },
        exposeMethods:{},
    }>,
    'my-dialog':_GetComponentConfig<{
        options:{
            zIndex:number
        },
        status:{
            display:true,
            config:{
                title:string,
                content:string | {
                    default:string,
                    validator:(v:string) => string,
                    list?:Array<{label:string,value:string} | string>
                } | HTMLElement,
                footer:{
                    cancel:string,
                    confirm:string
                }
            }
        } | {
            display:false
        },
        exposeMethods:{
            showDialog:(status:{
                title:string,
                content:string | {
                    default:string,
                    validator:(v:string) => string,
                    list?:Array<{label:string,value:string} | string>
                } | HTMLElement,
                footer:{
                    cancel?:string,
                    confirm?:string
                }
            },waitClosed:boolean) => Promise<string>,
        },
    }>,
    'my-record-form':_GetComponentConfig<{
        options:{
            type:'add' | 'edit',
            label:keyof PageHeadLabelMap,
            returnUpdateStatusType:(type:boolean) => void;
        },
        status:{
            date:string,
            material?:{
                belongField:RecordBelongList[number]['belong'],
                label:MaterialItem['label']
            }
        },
        exposeMethods:{},
    }>,
    'my-material-input':_GetComponentConfig<{
        options:{
            data:RecordMaterialComputed,
            lastRecordMaterialItem:RecordMaterialComputed | undefined,
            dayDistance:number | undefined,
            belong:RecordBelongList[number],
            closeBelongContent:Function,
            updateFormStatus:ComponentConfigMap['my-record-form']['exposeMethods']['updateStatus'],
            /** 如果要跳到其它页面，则要用这个包装下，进而记录好当前record-form的status。便于返回 */
            navigateTo:(fun:Function) => void
        },
        status:{},
        exposeMethods:{},
    }>,
    'my-materials':_GetComponentConfig<{
        options:{
            label:keyof PageHeadLabelMap,
            returnUpdateStatusType:(type:boolean) => void;
        },
        status:{
            activeLabel?:MaterialItem['label']
        },
        exposeMethods:{},
    }>,
    'my-charts':_GetComponentConfig<{
        options:{
            label:keyof PageHeadLabelMap,
            returnUpdateStatusType:(type:boolean) => void;
        },
        status:{
            type?:string,
            label?:string
            activeLabel?:string
        },
        exposeMethods:{},
    }>,
    'my-others':_GetComponentConfig<{
        options:{
            label:keyof PageHeadLabelMap,
            returnUpdateStatusType:(type:boolean) => void;
        },
        status:{},
        exposeMethods:{},
    }>,
    'my-input':_GetComponentConfig<{
        options:{
            unit:string,
            voidValue?:string
        },
        status:{
            value:string
        },
        exposeMethods:{},
    }>,
}
/** 这样写，是为了check ComponentParams的key写全了 */
export type ComponentConfigMap = {[key in ComponentName]:_ComponentConfigMap[key]}

/** 这边增加复用组件的其它组件名称 */
type ReuseComponentMap = {
    'my-dialog':['my-dialog-again'],
}
/** 这里校验key必须是已有组件的名称 */
type _checkReuseComponentMap = CheckAByB<keyof ReuseComponentMap,ComponentName>
type ReuseComponentNameMap = {
    [key in keyof ReuseComponentMap as string]:{
        [key1 in ReuseComponentMap[key][number]]:key
    }
}[string]
type ReuseComponentNames = keyof ReuseComponentNameMap;
/** 创建组件需要的参数类型，这里使用命名元组 */
export type CreateComponentParams<T extends ComponentName> = [
    options:ComponentConfigMap[T]['options'],
    status:ComponentConfigMap[T]['status'],
]
export interface MyComponent<T extends ComponentName> extends HTMLElement {
    $getExposeMethods:()=> Promise<ComponentConfigMap[T]['exposeMethods']>
    injectProps(...args:CreateComponentParams<T>): void;
}

export type CreateComponentFun = <T extends ComponentName>(name:T,...args:[...CreateComponentParams<T>,elementConfig?:Pick<CreateElementConfig<'div'>,'style' | 'attributes'>]) => MyComponent<T>
export type CreateReuseComponentFun = <T extends ReuseComponentNames,K extends ComponentName= ReuseComponentNameMap[T]>(name:T,targetComponentName:NoInfer<K>,...args:[...CreateComponentParams<K>,elementConfig?:Pick<CreateElementConfig<'div'>,'style' | 'attributes'>]) => MyComponent<K>
type addReusePropertys<T extends ComponentName> = T extends keyof ReuseComponentMap ? {
    reuseComponentNames:ReuseComponentMap[T]
} : {
    // 这里只是为了消除后续ts，认为有的情况没有这个字段的问题
    reuseComponentNames?:[]
}
export type ComponentExport<T extends ComponentName> = {
    componentName:T,
    /** content为函数，是为了确保多个相同组件不会影响，比如content中的定时器等 */
    content:() => {
        onMounted:(
            shadowRoot:ShadowRoot,
            ...args:CreateComponentParams<T>
        )=> ComponentConfigMap[T]['exposeMethods'],
        onDestroy:(shadowRoot:ShadowRoot) => void
    }
} & addReusePropertys<T>

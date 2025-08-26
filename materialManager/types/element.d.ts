import {OmitReadOnly,OmitIndexSignature,PickByType} from '@types'

type GetAttributesType<T extends keyof HTMLElementTagNameMap> = PickByType<OmitIndexSignature<OmitReadOnly<HTMLElementTagNameMap[T]>>,string> & {
    /** 自定义dataset */
    [key:`data-${string}${string}`]:string
} & {
    placeholder:string,
    disabled:'disabled',
    readonly:'readonly'
}
type GetStyleType = PickByType<OmitIndexSignature<CSSStyleDeclaration>,string>
type GetEventsType<T extends keyof HTMLElementTagNameMap> = {
    [key in keyof HTMLElementEventMap]?:(e:Omit<HTMLElementEventMap[key],'target'> & {
        target:HTMLElement,
        currentTarget:HTMLElementTagNameMap[T]
    }) => void
} & {
    // 自定义的事件
    [index:`custom${string}`]:(e:{detail:Record<string,unknown>,target:HTMLElementTagNameMap[T]}) => void
}
type GetEventsTypeAndUpdateFunArg<T extends keyof HTMLElementTagNameMap> = {
    [key in keyof HTMLElementEventMap]?:(e:Omit<HTMLElementEventMap[key],'target'> & {
        target:HTMLElement,
        currentTarget:HTMLElementTagNameMap[T]
    },updateFun:()=> boolean) => void
} & {
    // 自定义的事件
    [index:`custom${string}`]:(e:{detail:Record<string,unknown>,target:HTMLElementTagNameMap[T]}) => void
}
type CommonEleType = HTMLElement | undefined
type ParentEleType = CommonEleType | ShadowRoot;
/**
 * 1、childs中如果支持config，则会丢失对T的解析，进而导致后续类型是联合类型，不够精确
 * 2、childs中，如果提供()=> childItem 或 ()=> Array<childItem> 这个形式，
 *    childs中的返回类型是在这里定义的,所以实际代码中，返回类型会比较宽松，也就是比如对象多给属性也不会ts提示
 * 3、介于上面的ts本身原因，这边优先ts提示，故而childs中的项类型，不会提供多元化
 */
type CreateElementConfig<T extends keyof HTMLElementTagNameMap> = {
    /** 元素标签 */
    tagName:T,
    /*是否需要这个元素,替代display*/
    show?:boolean | (()=> boolean),
    /** 类名 */
    className?:string,
    /** 内容 */
    innerText?:string,
    innerHTML?:string,
    /** 属性 */
    attributes?:Partial<GetAttributesType<T>>,
    /** 样式 */
    style?:Partial<GetStyleType>,
    events?:GetEventsType<T>,
    hooks?:{
        onCreated?:(ele:HTMLElementTagNameMap[T]) => void,
        onMounted?:(ele:HTMLElementTagNameMap[T]) => void,
    },
    childs?:Array<CommonEleType> | (()=> Array<CommonEleType>),
}
export interface CreateUpdateElementConfig<T extends keyof HTMLElementTagNameMap> extends Omit<CreateElementConfig<T>,'events'> {
    /** 暴露更新自身节点的函数 */
    getUpdateFun?:(updateFun:() => boolean,ele:HTMLElementTagNameMap[T]) => void,
    /** 事件中，也提供更新自身节点的函数 */
    events?:GetEventsTypeAndUpdateFunArg<T>
}

/**
 * 对应的函数类型
 */
export type CreateElementFun = <T extends keyof HTMLElementTagNameMap>(config: CreateElementConfig<T>,parentNode?:ParentEleType) => HTMLElementTagNameMap[T] | undefined

export type CreateUpdateElementFun = <T extends keyof HTMLElementTagNameMap>(getUpdateConfig:()=>CreateUpdateElementConfig<T>,parentNode?:ParentEleType) => HTMLElementTagNameMap[T] | undefined

export type AppendChildElementsFun = <T extends CommonEleType>(parentNode:ParentEleType,childs:Array<T>) => Array<NonNullable<T>>;

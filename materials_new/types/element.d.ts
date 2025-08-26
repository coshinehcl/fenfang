import {PickByChildTypes,OmitIndexSignature} from '@types'
type TransformToFunction<M,Target> = {
    [K in keyof M]: (e: ExtendObjTarget<M[K],Target>) => void;
};
type ExtendObjTarget<M,Target> = Omit<M,'target'> & {
  target:Target
}
type TransformToString<T> = {
  [K in keyof T]:string
}
export interface CreateElementConfig<T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap> {
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
      attributes?:Partial<TransformToString<HTMLElementTagNameMap[T]>> & {[key:`data-${string}`]:string},
      /** 样式 */
      style?:Partial<OmitIndexSignature<PickByChildTypes<CSSStyleDeclaration,string>>>,
      /** 事件 */
      // HTMLElementEventMap
      events?:Partial<TransformToFunction<HTMLElementEventMap,HTMLElementTagNameMap[T]>>
      /** 子节点 */
      childs?:Array<CreateElementConfig | Element | undefined> | (()=> Array<CreateElementConfig | Element | undefined>),
      /** 可通过这个函数拿到本node节点 */
      returnNode?:(ele:HTMLElementTagNameMap[T]) => void,
      /** 如果是自定义节点，因为是closed。所以需要提供祖先节点 */
      attachedQueryNode?:Element | ShadowRoot,
      /** 可通过这个函数拿到本node节点,此时改节点是已挂载的状态 */
      returnAttachedNode?:(ele:HTMLElementTagNameMap[T]) => void,
      /** 拿到更新函数，由外部触发更新逻辑 */
      returnUpdateFun?:(updateFun:() => void,ele:HTMLElementTagNameMap[T]) => void
  }
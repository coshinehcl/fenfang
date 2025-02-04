type TransformToFunction<T> = {
    [K in keyof T]: (e: T[K],currentNode:HTMLElement) => void;
  };
  export interface CreateElementConfig<T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap> {
      /** 元素标签 */
      tagName:T,
      /** 类名 */
      className?:string,
      /** 内容 */
      innerText?:string,
      innerHTML?:string,
      /** 属性 */
      attributes?:Partial<HTMLElementTagNameMap<T>>
      /** text样式 */
      cssText?:string,
      /** 样式 */
      style?:Partial<CSSStyleDeclaration>,
      /** 事件 */
      // HTMLElementEventMap
      events?:Partial<TransformToFunction<HTMLElementEventMap>>
      /** 子节点 */
      childs?:Array<CreateElementConfig | Element>,
      /** 可通过这个函数拿到本node节点 */
      returnNode?:(ele:HTMLElementTagNameMap[T]) => void,
      /** 可通过这个函数拿到本node节点,此时改节点是已挂载的状态 */
      returnAttachedNode?:(ele:HTMLElementTagNameMap[T]) => void,
  }
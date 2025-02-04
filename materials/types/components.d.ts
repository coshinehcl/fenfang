import { CustomElementInitMap } from './index'
interface ComponentsExport<T extends keyof CustomElementInitMap = keyof CustomElementInitMap> {
    tagName:T,
    cssName:string,
    createNode:(shadowRoot:ShadowRoot,data:CustomElementInitMap[T]['data'],params:CustomElementInitMap[T]['params']) => void
}
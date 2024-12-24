import { CustomElementInitMap } from './index'
interface ComponentsExport<T extends keyof CustomElementInitMap = keyof CustomElementInitMap> {
    tagName:T,
    createNode:(shadowRoot:ShadowRoot,data:CustomElementInitMap[T]['data'],params:CustomElementInitMap[T]['params']) => void
}
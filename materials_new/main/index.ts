import { createElement,createUpdateElement,getRecordList,initCustomElement,createCustomElement,showMessage } from '@utils'
import {CreateElementConfig} from '@types'
import {defaultRecordList,recordRecordBelong} from '@config'

import customComponents from '@components'
customComponents.forEach(customComponentsItem => {
    initCustomElement(customComponentsItem)
})
createCustomElement('my-actions',{},document.body)

function isMountedToDocument(ele:Element | ShadowRoot):boolean {
    if(!ele) {
        return false
    }
    function getParentNode(_ele:Element | ParentNode):ParentNode | undefined {
        if(!_ele) {
            return undefined
        } else if(_ele instanceof ShadowRoot) {
            return _ele.host
        } else if(_ele.parentNode){
            return  _ele.parentNode
        } else {
            return undefined
        }
    }
    let parentNode:ParentNode | undefined = ele;
    let isMounted:boolean = false;
    while(parentNode) {
        parentNode = getParentNode(parentNode)
        if(parentNode?.nodeType === document.nodeType) {
            isMounted = true;
        }
    }
    return isMounted;
}
isMountedToDocument(document.body)
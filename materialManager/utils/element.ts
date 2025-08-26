import { CreateElementFun,AppendChildElementsFun,CreateUpdateElementFun,CreateUpdateElementConfig} from '@types'
import { waitCondition,isMountedToDocument } from './common'
import { objectKeys,arrayFilterNull } from './tsHelper'

export const appendChildElements:AppendChildElementsFun = (parentNode,childs) => {
    const usefulChilds = arrayFilterNull(childs);
    if(parentNode) {
        usefulChilds.forEach(childNode => {
            parentNode.appendChild(childNode);
        })
    }
    return usefulChilds;
}
export const createElement:CreateElementFun = (config,parentNode) => {
    const {tagName,show = true,hooks,childs,...attrs} = config;
    if(!tagName) return;
    let isShow:boolean = typeof show === 'function' ? show() : show;
    if(!isShow) return;
    const elementNode = document.createElement(tagName);
    // 设置属性
    objectKeys(attrs).forEach(attrKey => {
        if(attrKey === 'innerHTML' || attrKey === 'innerText' || attrKey === 'className') {
            elementNode[attrKey] = attrs[attrKey] ?? '';
        } else if(attrKey === 'style') {
            const arrrValue = attrs[attrKey] || {};
            objectKeys(arrrValue).forEach(i => {
                if(arrrValue[i] !== undefined) { 
                    elementNode.style.setProperty(i.replace(/([A-Z])/g, '-$1').toLowerCase(),arrrValue[i] || '');
                }
            })
        } else if(attrKey === 'attributes') {
            const arrrValue = attrs[attrKey] || {};
            objectKeys(arrrValue).forEach(i => {
                if(arrrValue[i] !== undefined) {
                    elementNode.setAttribute(i as string,arrrValue[i] as string);
                }
            })
        } else if(attrKey === 'events') {
            const arrrValue = attrs[attrKey] || {};
            objectKeys(arrrValue).forEach(i => {
                if(i && typeof arrrValue[i] === 'function') {
                    elementNode.addEventListener(i,arrrValue[i] as any);
                }
            })
        }
    })
    if(childs) {
        if(typeof childs === 'function') {
            appendChildElements(elementNode,childs());
        } else {
            appendChildElements(elementNode,childs);
        }
    }
    // 本身节点树构建完成，则触发onCreated
    if(hooks && hooks.onCreated && typeof hooks.onCreated === 'function') {
        hooks.onCreated(elementNode)
    }
    // 本身挂到父节点树上
    if(parentNode) {
        parentNode.appendChild(elementNode);
    }
    // 挂载到document后，则触发onMounted
    if(hooks && hooks.onMounted && typeof hooks.onMounted === 'function') {
        waitCondition(()=> isMountedToDocument(elementNode)).then(()=> {
            if(hooks.onMounted) {
                hooks.onMounted(elementNode);
            }
        })
    }
    return elementNode;
}
export const createUpdateElement:CreateUpdateElementFun = (getConfig,parentNode) => {
    function updateFun(){
        if(elementNode && elementNode.parentNode) {
            const newElementNode = createUpdateElement(getConfig);
            // 在老节点前插入新的本体
            if(newElementNode) {
                elementNode.parentNode.insertBefore(newElementNode,elementNode);
            }
            // 移除老节点
            elementNode.remove();
            return true
        } else {
            return false;
        }
    }
    if(!getConfig || typeof getConfig !== 'function') return;
    const config = getConfig();
    const {getUpdateFun,events,...attrs} = config;
    let newEvents:any = {};
    if(events) {
        objectKeys(events).forEach(eventKey => {
            if(typeof events[eventKey] === 'function') {
                newEvents[eventKey] = (e:any)=> {
                    events[eventKey]?.(e,updateFun);
                }
            }
        })
    }
    const elementNode = createElement({...attrs,events:newEvents},parentNode);
    if(!elementNode) return;
    if(getUpdateFun && typeof getUpdateFun === 'function') {
        getUpdateFun(updateFun,elementNode)
    }
    return elementNode;
}
export const removeChilds = (ele:Element | ShadowRoot)=> {
    if(!ele) return;
    if(ele instanceof Element || ele instanceof ShadowRoot) {
        while(ele.firstChild) {
            ele.removeChild(ele.firstChild);
        }
    }
}
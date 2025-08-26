import { CreateElementConfig } from '@types'
import { objectKeys,waitCondition } from './common'
export function createChildsElement(childs:CreateElementConfig['childs'],parentNode:Element | ShadowRoot):Array<Element>{
    if(typeof childs === 'function'){
        childs = childs();
    }
    const childNodes:Array<Element | undefined> = [];
    if(Array.isArray(childs) && childs.length) {
        childs.forEach(childItem => {
            if(childItem instanceof Element) { 
                childNodes.push(childItem)
            } else if(childItem){
                childNodes.push(createElement(childItem))
            } else {
                childNodes.push(undefined);
            }
        })       
    }
    if(parentNode) {
        childNodes.forEach(childNode => {
            if(childNode) {
                parentNode.appendChild(childNode);
            }
        })
    }
    return childNodes.filter(Boolean) as Array<Element>;
}
export function createElement<T extends keyof HTMLElementTagNameMap>(config:CreateElementConfig<T>,rootNode?:Element | ShadowRoot):HTMLElementTagNameMap[T] | undefined {
    const { tagName,show = true,childs,returnNode,attachedQueryNode,returnAttachedNode,returnUpdateFun,...attrs} = config;
    let isShow:boolean;
    if(typeof show === 'function') {
        isShow = show();
    } else {
        isShow = show;
    }
    if(!isShow) {
        return;
    }
    // 生成节点
    const currentNode = document.createElement(tagName);
    // 设置属性
    objectKeys(attrs).forEach(attrKey => {
        if(attrKey === 'innerHTML' || attrKey === 'innerText' || attrKey === 'className') {
            currentNode[attrKey] = attrs[attrKey] || '';
        } else if(attrKey === 'attributes') {
            const arrrValue = attrs[attrKey]! || {};
            objectKeys(arrrValue).forEach(i => {
                if(arrrValue[i] !== undefined) {
                    currentNode.setAttribute(i as string,arrrValue[i] as string);
                }
            })
        } else if(attrKey === 'style') {
            const arrrValue = attrs[attrKey]! || {};
            objectKeys(arrrValue).forEach(i => {
                currentNode.style.setProperty(i.replace(/([A-Z])/g, '-$1').toLowerCase(),arrrValue[i] || '');
            })
        } else if(attrKey === 'events') {
            const arrrValue = attrs[attrKey]! || {};
            objectKeys(arrrValue).forEach(i => {
                if(arrrValue[i]) {
                    currentNode.addEventListener(i,arrrValue[i] as any);
                }
            })
        }
    })
    // 处理子节点
    if(childs) {
        createChildsElement(childs,currentNode);
    }
    if(rootNode) {
        rootNode.appendChild(currentNode);
    }
    // 处理函数
    if(returnNode) {
        returnNode(currentNode);
    }
    if(returnAttachedNode) {
        waitCondition(()=> (attachedQueryNode || document.body).contains(currentNode)).then(res => {
            returnAttachedNode(currentNode);
        })
    }
    return currentNode;
}
export function createUpdateElement<T extends keyof HTMLElementTagNameMap>(getConfig:()=>CreateElementConfig<T>,rootNode?:Element | ShadowRoot):HTMLElementTagNameMap[T] | undefined{
    const config = getConfig();
    const currentNode = createElement(config,rootNode);
    if(currentNode && config.returnUpdateFun) {
        function updateFun(){
            if(currentNode && currentNode.parentNode) {
                const newCurrentNode = createUpdateElement(getConfig);
                if(newCurrentNode) {
                    currentNode.parentNode.insertBefore(newCurrentNode,currentNode);
                }
                // 移除老节点
                currentNode.remove();
            }
        }
        config.returnUpdateFun(updateFun,currentNode)
    }
    return currentNode;
}
export const removeChilds = (ele:Element | ShadowRoot)=> {
    if(!ele) return;
    if(ele instanceof Element || ele instanceof ShadowRoot) {
        while(ele.firstChild) {
            ele.removeChild(ele.firstChild);
        }
    }
}
import { CreateElementConfig } from '../types/index'
import { waitCondition,objectKeys } from './index'
export function createElement<T extends keyof HTMLElementTagNameMap>(config:CreateElementConfig<T>,parentNode?:Element | ShadowRoot):HTMLElementTagNameMap[T] {
    const {tagName,childs,returnNode,returnAttachedNode,...attrs} = config;
    // 1、生成node
    const node = document.createElement(tagName);
    // 设置属性
    objectKeys(attrs).forEach(key => {
        const value:any = attrs[key];
        if(value === undefined) return;
        if(key === 'innerText' || key === 'innerHTML' || key === 'className') {
            node[key] = value;
        } if(key === 'cssText') {
            node.style.cssText = value;
        } else if(key === 'style') {
            Object.keys(value).forEach(i => {
                node.style.setProperty(i.replace(/([A-Z])/g, '-$1').toLowerCase(),value[i]);
            })
        } else if(key === 'attributes') {
            Object.keys(value).forEach(attrName => {
                node.setAttribute(attrName,value[attrName]);
            })
        } else if(key === 'events'){
            Object.keys(value).forEach(eventName => {
                node.addEventListener(eventName,value[eventName]);
            })
        }
    })
    // 添加子节点
    if(childs && childs.length) {
        const childsConfig = Array.isArray(childs) ? childs : [childs];
        childsConfig.forEach(childConfigItem => {
            if(childConfigItem instanceof Element) {
                node.appendChild(childConfigItem);
            } else {
                createElement(childConfigItem,node);
            }
        })
    }
    if(parentNode) {
        parentNode.appendChild(node);
    }
    if(returnNode) {
        returnNode(node);
    }
    if(returnAttachedNode) {
        waitCondition(()=> {
            return document.body.contains(node); // 挂载到body上，才触发
        }).then(()=> {
            returnAttachedNode(node);
        }).catch(()=> {
            returnAttachedNode(node);
        })
    }
    return node;
}
export const removeChilds = (ele:Element)=> {
    if(!ele || !(ele instanceof Element)) return;
    while(ele.firstChild) {
        ele.removeChild(ele.firstChild);
    }
}
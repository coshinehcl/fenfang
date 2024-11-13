function querySelector(selector,parentNode = document) {
    if(!selector) throw new Error('selector is required');
    if(typeof selector === 'string') {
        return parentNode.querySelector(selector);
    }
    return selector;
}
export function createElement(config,parentNode,topNode) {
    const { tagName,childs,slots,...attrs } = config;
    // 1、生成node
    const node = document.createElement(tagName);
    topNode = topNode || node;
    // 设置属性
    Object.keys(attrs).forEach(key => {
        if(key === 'cssText') {
            node.style.cssText = attrs[key];
        } else if(key === 'style') {
            Object.keys(attrs[key]).forEach(i => {
                node.style.setProperty(i.replace(/([A-Z])/g, '-$1').toLowerCase(),attrs[key][i]);
            })
        } else if(key === 'attributes') {
            Object.keys(attrs[key]).forEach(attrName => {
                node.setAttribute(attrName,attrs[key][attrName]);
            })
        } else if(key === 'events'){
            Object.keys(attrs[key]).forEach(eventName => {
                node.addEventListener(eventName,(e)=> {
                    attrs[key][eventName](e,topNode)
                });
            })
        } else {
            try{
                node[key] = attrs[key];
            }catch(err){}
        }
    })
    // 添加子节点
    if(childs) {
        const childsConfig = Array.isArray(childs) ? childs : [childs];
        childsConfig.forEach(childConfigItem => {
            if(childConfigItem instanceof HTMLElement) {
                node.appendChild(childConfigItem);
            } else {
                createElement(childConfigItem,node,topNode);
            }
        })
    }
    if(parentNode) {
        parentNode = querySelector(parentNode);
        parentNode.appendChild(node);
    }
    return node;
}
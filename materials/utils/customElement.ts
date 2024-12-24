import { CustomElementInitMap,ComponentsExport,CustomElement } from '../types/index'
export function initCustomElement<T extends keyof CustomElementInitMap>(config:ComponentsExport<T>){
    class myEle extends HTMLElement implements CustomElement<T>{
        $shadowRoot;
        $initHandler!:Function;
        constructor(){
            super();
            this.$shadowRoot = this.attachShadow({ mode: 'closed' });
        }
        connectedCallback() {
            if(this.$initHandler) {
                this.$initHandler();
            }
        }
        initHandler(data:any,params:any){
            this.$initHandler = () => {
                config.createNode(this.$shadowRoot,data,params)
            }
        }
        active(){
            const wrapperNode = this.$shadowRoot.querySelector('.wrapper');
            if(wrapperNode) {
                wrapperNode.classList.add('active');
                setTimeout(() => {
                    wrapperNode.classList.remove('active');
                }, 3000);
            }
        }
    }
    customElements.define(config.tagName, myEle);
}
export function createCustomElement<T extends keyof CustomElementInitMap>(tagName:T,options:CustomElementInitMap[T],parentNode?:Element){
    const node = document.createElement(tagName) as CustomElement<T>;
    node.initHandler(options.data,options.params);
    if(parentNode) {
        parentNode.appendChild(node);
    }
    return node;
}
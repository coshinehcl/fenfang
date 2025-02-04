import { CustomElementInitMap,ComponentsExport,CustomElement } from '@types'
function preloadStyle(cssName:string):Promise<string>{
    const url = `./dist/${cssName}.css`
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseText)
          } else {
            reject(new Error(`Failed to load stylesheet: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Failed to load stylesheet'));
        xhr.send();
      });
}
export function initCustomElement<T extends keyof CustomElementInitMap>(config:ComponentsExport<T>){
    // 预加载样式，避免闪现
    const stylePromise = preloadStyle(config.cssName);
    class myEle extends HTMLElement implements CustomElement<T>{
        $shadowRoot;
        $initHandler!:Function;
        constructor(){
            super();
            this.$shadowRoot = this.attachShadow({ mode: 'closed' });
        }
        connectedCallback() {
            stylePromise.then(res => {
                const styles = new CSSStyleSheet();
                styles.replaceSync(res);
                this.$shadowRoot.adoptedStyleSheets = [styles];
            })
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
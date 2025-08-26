import {CustomTag,CustomElementExport ,CustomEleOptionsMap,FunctionObject,CustomEleType,MyMessageEleOptions,HtmlActionLabelMap} from '@types'
function preloadStyle(cssName:string):Promise<string>{
    const url = `../dist/${cssName}.css`
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseText)
          } else if(xhr.status === 404) {
            resolve(''); // 此时认为不需要样式
          } else {
            reject(new Error(`Failed to load stylesheet: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Failed to load stylesheet'));
        xhr.send();
      });
}
export function initCustomElement<T extends CustomTag>(config:CustomElementExport<T>){
    // 预加载样式，避免闪现
    const stylePromise = preloadStyle(config.tagName);
    class myEle extends HTMLElement implements CustomEleType{
        $shadowRoot;
        $initHandler!:Function;
        $exportFuns!:FunctionObject;
        constructor(){
            super();
            this.$shadowRoot = this.attachShadow({ mode: 'closed' });
        }
        connectedCallback() {
            const newStylePromise = stylePromise.then(res => {
                if(res) {
                    const styles = new CSSStyleSheet();
                    styles.replaceSync(res);
                    this.$shadowRoot.adoptedStyleSheets = [styles];
                }
                return res;
            })
            if(this.$initHandler) {
                this.$initHandler(newStylePromise);
            }
        }
        initHandler(options:any){
            this.$initHandler = (_newStylePromise:Promise<string>) => {
                const exportFuns = config.createNode(this.$shadowRoot,options,_newStylePromise);
                this.$exportFuns = exportFuns || {};
            }
        }
    }
    customElements.define(config.tagName, myEle);
}
export function createCustomElement<T extends CustomTag>(tagName:T,options:CustomEleOptionsMap[T],parentNode?:Element){
    const node = document.createElement(tagName) as CustomEleType;
    node.initHandler(options);
    if(parentNode) {
        parentNode.appendChild(node);
    }
    return node;
}

// 自定义元素的方法
export function showMessage(textList:string | Array<string>,options?:MyMessageEleOptions):Promise<'确定' | '取消' | 'ok'>{
    let myMessageEle = document.querySelector('my-message') as CustomEleType;
    if(!myMessageEle) {
        myMessageEle = createCustomElement('my-message',{},document.body);
    }
    return myMessageEle.$exportFuns.show(textList,options);
}
export function updateHtmlAction<T extends keyof HtmlActionLabelMap>(label:T,status:HtmlActionLabelMap[T]) {
    const myActionEle = document.querySelector('my-actions') as CustomEleType;
    if(!myActionEle) {
        return;
    }
    return myActionEle.$exportFuns.updateAction(label,status)
}
export function saveHtmlActionStatus<T extends keyof HtmlActionLabelMap>(status:HtmlActionLabelMap[T]) {
    const myActionEle = document.querySelector('my-actions') as CustomEleType;
    if(!myActionEle) {
        return;
    }
    return myActionEle.$exportFuns.saveStatus(status)
}
export function actionFireBack(replaceFun:Function) {
    const myActionEle = document.querySelector('my-actions') as CustomEleType;
    if(!myActionEle) {
        return;
    }
    return myActionEle.$exportFuns.actionFireBack(replaceFun || (()=>{}))
}
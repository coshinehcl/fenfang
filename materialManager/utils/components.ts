import { ComponentExport,ComponentName,ComponentConfigMap,CreateComponentFun 
    ,MyComponent,CreateComponentParams,CreateReuseComponentFun,CreateElementConfig} from '@types'
import { GetPromiseAndParams, objectKeys } from './tsHelper'
const urlCache:{
    [key:string]:Promise<string>
} = {};
function preloadStyle(name:string):Promise<string>{
    const url = `../dist/${name}.css`;
    if(url in urlCache) {
        return urlCache[url];
    }
    const ret = new Promise<string>((resolve, reject) => {
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
    })
    urlCache[url] = ret;
    return ret;
}

export function initComponent<T extends ComponentName>(config:ComponentExport<T>) {
    if(customElements.get(config.componentName)) return;
    function getComponent(){
        return  class myComponent extends HTMLElement implements MyComponent<T>{
            private _config
            private _shadowRoot
            private _preloadstylePromise
            private _injectPromise
            private _injectPromiseResolve
            private _exposeMethodsResolve
            $getExposeMethods
            constructor(){
                super();
                this._config = config.content();;
                this._shadowRoot = this.attachShadow({ mode: 'closed' });
                // 注入props的promise
                const injectPromiseList = GetPromiseAndParams<CreateComponentParams<T>>();
                this._injectPromise = injectPromiseList[0];
                this._injectPromiseResolve = injectPromiseList[1];
                // 暴露函数的promise
                const exposeMethodsPromiseList = GetPromiseAndParams<ComponentConfigMap[T]['exposeMethods']>();
                this._exposeMethodsResolve = exposeMethodsPromiseList[1];
                this.$getExposeMethods = ()=> exposeMethodsPromiseList[0];
                // 加载style
                this._preloadstylePromise = preloadStyle(config.componentName);
                // 执行onCreated。这里略,因为没意义： this._config.onCreated
            }
            connectedCallback(){
                Promise.all([
                    this._preloadstylePromise,
                    this._injectPromise
                ]).then(resList => {
                    const [styleStr,injectData] = resList;
                    // 注入样式
                    const styles = new CSSStyleSheet();
                    styles.replaceSync(styleStr);
                    this._shadowRoot.adoptedStyleSheets = [styles];
                    // 执行onMounted
                    const exposeMethods = this._config.onMounted(
                        this._shadowRoot,
                        ...injectData
                    );
                    // 暴露函数，执行resolve
                    this._exposeMethodsResolve(exposeMethods);
                })
            }
            disconnectedCallback(){
                if(typeof this._config.onDestroy === 'function') {
                    // 执行onDestroy
                    this._config.onDestroy(this._shadowRoot)
                }
            }
            injectProps(...args:CreateComponentParams<T>){
                //  注入props 执行resolve
                this._injectPromiseResolve(args);
            }
        }
    }
    if(config.reuseComponentNames) {
        config.reuseComponentNames.forEach(reuseName => {
            customElements.define(reuseName, getComponent());
        })
    }
    customElements.define(config.componentName, getComponent());
}

export const createComponent:CreateComponentFun = (name,options,status,elementConfig) => {
    const elementNode = document.createElement(name) as MyComponent<typeof name>;
    if('injectProps' in elementNode) {
        elementNode.injectProps(options,status)
    } else {
        console.error(`检查${name}组件是否注册`)
    }
    if(elementConfig) {
        if(elementConfig.style) {
            objectKeys(elementConfig.style).forEach(i => {
                let v = elementConfig.style?.[i];
                if(v !== undefined) {
                    elementNode.style.setProperty(i.replace(/([A-Z])/g, '-$1').toLowerCase(),v || '');
                }
            })
        } 
        if(elementConfig.attributes) {
            objectKeys(elementConfig.attributes).forEach(i => {
                let v = elementConfig.attributes?.[i];
                if(v !== undefined) {
                    elementNode.setAttribute(i as string,v as string);
                }
            })
        }
    }
    return elementNode;
}
export const createReuseComponent:CreateReuseComponentFun = (name,targetName,options,status,elementConfig) => {
    const elementNode = document.createElement(name) as MyComponent<typeof targetName>;
    if('injectProps' in elementNode) {
        elementNode.injectProps(options,status)
    } else {
        console.error(`检查${name}组件是否注册`)
    }
    if(elementConfig) {
        if(elementConfig.style) {
            objectKeys(elementConfig.style).forEach(i => {
                let v = elementConfig.style?.[i];
                if(v !== undefined) {
                    elementNode.style.setProperty(i.replace(/([A-Z])/g, '-$1').toLowerCase(),v || '');
                }
            })
        } 
        if(elementConfig.attributes) {
            objectKeys(elementConfig.attributes).forEach(i => {
                let v = elementConfig.attributes?.[i];
                if(v !== undefined) {
                    elementNode.setAttribute(i as string,v as string);
                }
            })
        }
    }
    return elementNode;
}
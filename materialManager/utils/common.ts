import { ArrayPushItem } from '@types'
export function waitCondition(conditionFun:()=> boolean,timeout = 2000):Promise<boolean>{
    return new Promise((resolve,reject) => {
        const now = Date.now();
        const timer = setInterval(()=> {
            if(Date.now() - now > timeout) {
                clearInterval(timer)
                reject(new Error('等待超时'))
            } else if(conditionFun()) {
                clearInterval(timer)
                resolve(true)
            }
        },10)
    })
}
export function isMountedToDocument(ele:Element | ShadowRoot):boolean {
    if(!ele) {
        return false
    }
    function getParentNode(_ele:Element | ParentNode):ParentNode | undefined {
        if(!_ele) {
            return undefined
        } else if(_ele instanceof ShadowRoot) {
            return _ele.host.parentNode ?? undefined
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
export function waitEleDuration(ele:Element,className:string,isAdd:boolean):Promise<void>{
    if(!ele || ele === null) {
        return Promise.resolve();
    }
    // 拿到元素设置的 animation-duration
    const style = window.getComputedStyle(ele);
    let durationTimeStr = '';
    if(style.animationDuration.includes('s')) {
        durationTimeStr = style.transitionDuration
    } else {
        durationTimeStr = style.animationDuration
    }
    // 0.3s 单位也可能是ms。也可能有多个值，如果有多个值，取大值
    const durationTimeStrLit = durationTimeStr.split(',');
    const durationTimeList:number[] = [];
    durationTimeStrLit.forEach(i => {
        if(i.includes('ms')) {
            durationTimeList.push(parseFloat(durationTimeStr))
        } else {
            durationTimeList.push(parseFloat(durationTimeStr) * 1000)
        }
    })
    const durationTime = Math.max(...durationTimeList);
    return new Promise((resolve) => {
        if(isAdd) {
            ele.classList.add(className);
        } else {
            ele.classList.remove(className);
        }
        setTimeout(() => {
            resolve()
        }, durationTime);
    })
}
export function cancelableTasks(controller:AbortController,tasks:Array<(status:boolean,resolveV:any,rejectV:any)=> any>) {
    return new Promise(async (resolve,reject) => {
        if(controller.signal.aborted) {
            reject(new Error('任务已取消'))
            return;
        }
        const abortListener = () => {
            reject(new Error('任务被中止'));
        };
        controller.signal.addEventListener('abort',abortListener);
        let lastIsResolve = true;
        let lastResolveValue = undefined;
        let lastRejectValue = undefined;
        for(const taskItem of tasks) {
            // taskItem的catch会传递给下一个taskItem。并不会中断流程
            // 整个任务的状态，由最后一个决定
            try {
                if(controller.signal.aborted) {
                    break;
                }
                lastResolveValue = await taskItem(lastIsResolve,lastResolveValue,lastRejectValue);
                lastIsResolve = true;
                lastRejectValue = undefined;
            } catch(err) {
                lastResolveValue = undefined;
                lastIsResolve = false;
                lastRejectValue = err;
            }
        }
        controller.signal.removeEventListener('abort', abortListener);
        if(controller.signal.aborted) return;
        if(lastIsResolve) {
            resolve(lastResolveValue);
        } else {
            reject(lastRejectValue);
        } 
    })
}
export class MoreTimeExecute {
    controller!:AbortController
    pendingPromise!:Promise<any> | undefined
    constructor(){
        // this.tasks = tasks;
    }
    async execute<T>(tasks:ArrayPushItem<
        Array<(status:boolean,resolveV:any,rejectV:any)=> any>,
        (status:boolean,resolveV:any,rejectV:any)=> Promise<T> | T
    >):Promise<T> {
        // 如果当前有进行中的
        if(this.pendingPromise) {
            // 中断上次的tasks
            this.controller.abort();
            // 等待上次情况结束
            try {
                await this.pendingPromise;
            } catch(err){}
        }
        // 执行本次的请求
        this.controller = new AbortController();
        this.pendingPromise = cancelableTasks(this.controller,tasks);
        return this.pendingPromise.finally(()=> {
            this.pendingPromise = undefined;
        });
    }
}

export function sleep(duration:number) {
    return new Promise<void>((resolve)=> {
        setTimeout(() => {
            resolve()
        }, duration);
    })
}
export function getJson(name:string):Promise<object> {
    return new Promise((resolve,reject) => {
        const url = `../dist/${name}.json`;
        fetch(url).then(response => {
            if (!response.ok) {
              reject(new Error(`HTTP error! status: ${response.status}`));
            }
            resolve(response.json())
        })
    })
}
type UrlType = `http:${string}` | `https://${string}`
const dependenciesCache:{
    [index:string]:boolean
} = {}
export function addScriptToGlobal(url:UrlType):Promise<string>{
    return new Promise((resolve,reject) => {
        if(dependenciesCache[url]) {
            resolve('ok')
        } else {
            const script = document.createElement('script');
            script.src = url;
            script.type = 'text/javascript';
            document.head.appendChild(script);
            script.onload = function() {
                dependenciesCache[url] = true;
                resolve('ok')
            };
            script.onerror = function() {
                reject(new Error('加载失败'))
            };
        }
    })
}
export function addObserve<T extends object,K extends keyof T>(obj:T,field:K,fun:(v:T[K])=>void) {
    let _innerV:T[K] = obj[field];
    // 确保第一次赋值，会触发fun,确保所有逻辑都能初始化成功
    let isFirstset = true;
    Object.defineProperty(obj,field,{
        set(v:T[K]){
            if(isFirstset) {
                _innerV = v;
                fun(v)
            } else if(v !== _innerV) {
                _innerV = v;
                fun(v)
            }
            isFirstset = false;
        },
        get(){
            return _innerV;
        }
    })
}
export const getCurrentDate = ()=> {
    const _date = new Date();
    const year = String(_date.getFullYear());
    const month = String(_date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以加1
    const day = String(_date.getDate()).padStart(2, '0');
    return {
        year,
        month,
        day,
        full:`${year}-${month}-${day}`,
        fullStr:`${year}${month}${day}`
    }
}
export function getFormatNum(num:number,accuracy:number = 1):number {
    if(accuracy === 0) {
        return Math.round(num)
    } else {
        const acc = Math.pow(10,accuracy)
        return Math.round(num * acc) / acc;
    }
}
export const getDayDistance = (date1:string,date2:string):number =>  {
    if(!date1 || !date2) return 0;
    const leftDate = new Date(date1).getTime();
    const rightDate = new Date(date2).getTime();
    const millisecondsDiff = leftDate - rightDate;
    const daysDiff = Math.round(millisecondsDiff / (1000 * 60 * 60 * 24));
    return daysDiff;
}
export function debounce<T>(func:(...args:T[])=>unknown, delay:number, immediate = false) {
    let timer:number | null = null;
    return function (...args:T[]) {
      // @ts-ignore 
      const context = this;
      // 清除之前的定时器
      if (timer) clearTimeout(timer);
      if (immediate && !timer) {
        // 如果需要立即执行，并且当前没有定时器，则立即执行一次
        func.apply(context, args);
      }
      // 设置新的定时器
      timer = setTimeout(() => {
        timer = null; // 定时器结束后清空
        if (!immediate) {
          func.apply(context, args); // 执行函数
        }
      }, delay);
    };
  }
/**
 * EMA 值 拿到平均值
 * @param data 数据列表
 * @param period 周期
 * @returns 平均值
 */
export function exponentialMovingAverage(data:number[], period:number) {
    const alpha = 0.3; // 平滑因子,越大，则越容易收到波动影响
    const smaList:number[] = []
    // 先计算一个周期内的平均值
    for(let i = 0;i < period;i++) {
        if(i === 0) {
            smaList.push(data[i]);
            continue;
        }
        let lastV = smaList[i -1];
        smaList.push(lastV + (data[i] -lastV) * alpha);
    }
    if(data.length > period) {
        // 再计算一个周期外的平均值
        // 计算后续的 EMA 值
        for (let i = period; i < data.length; i++) {
            const currentValue = data[i];
            const previousEMA = smaList[smaList.length - 1];
            const currentEMA = (currentValue - previousEMA) * alpha + previousEMA;
            smaList.push(currentEMA);
        }
    }
    return smaList;
  }
export async function oneByone<T>(list:Array<T>,processFun:(item:T) => any){
    for(let i = 0; i < list.length; i++) {
        await processFun(list[i]);
    }
}

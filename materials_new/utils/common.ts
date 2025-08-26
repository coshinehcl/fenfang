export function deleteProperty<T extends object, K extends keyof T>(obj: T, prop: K):Omit<T,K>{
    const newObj = JSON.parse(JSON.stringify(obj)) as T;
    delete obj[prop];
    return obj
}
export function cloneData<T>(data:T):T {
    return JSON.parse(JSON.stringify(data))
}
export function objectKeys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
}
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
export const getDayDistance = (date1:string,date2:string):number =>  {
    if(!date1 || !date2) return 0;
    const leftDate = new Date(date1).getTime();
    const rightDate = new Date(date2).getTime();
    const millisecondsDiff = leftDate - rightDate;
    const daysDiff = Math.round(millisecondsDiff / (1000 * 60 * 60 * 24));
    return daysDiff;
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
export function generateIncrementalArray(n:number) {
    if (n <= 0) return [];
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    const sum = arr.reduce((acc, val) => acc + val, 0);
    // 归一化数组，使所有元素之和等于1
    const normalizedArr = arr.map(val => val / sum);
    // 后三位，改为平均值(后面的权重均衡下)
    const lastThreeArr = normalizedArr.slice(-3);
    const lastThreeSum = lastThreeArr.reduce((acc,val) => acc + val,0);
    return [...normalizedArr.slice(0,-3),...lastThreeArr.map(i => lastThreeSum / lastThreeArr.length)];
}

export function removeEle(ele:HTMLElement,newClassName:string):Promise<string>{
    if(!ele || ele === null) {
        return Promise.resolve('移除');
    }
    // 拿到元素设置的 animation-duration
    const style = window.getComputedStyle(ele);
    let durationTimeStr = '';
    if(['0s','0ms'].includes(style.animationDuration)) {
        durationTimeStr = style.transitionDuration
    } else {
        durationTimeStr = style.animationDuration
    }
    // 0.3s 单位也可能是ms
    let durationTime:number = 0;
    if(durationTimeStr.includes('ms')) {
        durationTime = parseFloat(durationTimeStr)
    } else {
        durationTime = parseFloat(durationTimeStr) * 1000
    }
    return new Promise((resolve) => {
        ele.classList.add(newClassName);
        setTimeout(() => {
            ele.remove();
            resolve('移除')
        }, durationTime);
    })
}
export async function oneByone<T>(list:Array<T>,processFun:(item:T) => any){
    for(let i = 0; i < list.length; i++) {
        await processFun(list[i]);
    }
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
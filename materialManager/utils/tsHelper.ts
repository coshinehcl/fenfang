/**
 * 本模块提供一些ts的辅助函数
 * 避免ts类型的丢失
 */
import { ObjectPick } from '@types'
export function cloneData<T>(obj:T):T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => cloneData(item)) as any;
    }
    const clonedObj: any = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = cloneData(obj[key]);
        }
    }
    return clonedObj;
}
export function objectKeys<T extends object>(obj: T) {   
    /** Object.keys会丢失key的具体类型，只会返回string[] */
    return Object.keys(obj) as (keyof T)[]
}
export function arrayFilterNull<I>(arr:Array<I>):Array<NonNullable<I>> {
    return arr.filter(i => i !== undefined && i !== null) as any;
}
/** 返回指定类型的一个Promise并且返回resolve和reject */
export function GetPromiseAndParams<T>(){
    let resolve!:(value: T) => void;
    let reject!:(reason?: any) => void;
    const p = new Promise<T>((_resolve,_reject) => {
        resolve = _resolve;
        reject = _reject
    })
    return [p,resolve,reject] as const;
}

export function objectPick<T extends object,K extends keyof T>(obj:T,keys:Array<K>):ObjectPick<T,K>{
    const newObj:any = {};
    keys.forEach(i => {
        newObj[i] = obj[i]
    })
    return newObj as ObjectPick<T,K>
}
export function objectOmit<T extends object,K extends keyof T>(obj:T,keys:Array<K>){
    const newObj:Partial<T> = cloneData(obj);
    keys.forEach(i => {
        delete newObj[i]
    })
    return newObj as Omit<T,K>
}
export function capitalizeFirstLetter<T extends string>(str:T) {
    return str.charAt(0).toUpperCase() + str.slice(1) as Capitalize<T>;
}
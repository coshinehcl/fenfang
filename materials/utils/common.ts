import { DateFull } from '../types/index'
/** 等待某个条件满足后执行 */
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
/** 获取当前日期和格式化 */
export const getCurrentDate = ()=> {
    const _date = new Date();
    const year = String(_date.getFullYear());
    const month = String(_date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以加1
    const day = String(_date.getDate()).padStart(2, '0');
    return {
        year,
        month,
        day,
        full:`${year}-${month}-${day}` as DateFull
    }
}
/** 获取两个日期先差多少天 */
export const getDayDistance = (date1:DateFull,date2:DateFull):number =>  {
    if(!date1 || !date2) return 0;
    const leftDate = new Date(date1).getTime();
    const rightDate = new Date(date2).getTime();
    const millisecondsDiff = leftDate - rightDate;
    const daysDiff = Math.round(millisecondsDiff / (1000 * 60 * 60 * 24));
    return daysDiff;
}
/** 对数字格式话 */
export function getFormatNum(num:number,accuracy:number = 1):number {
    if(accuracy === 0) {
        return Math.round(num)
    } else {
        const acc = Math.pow(10,accuracy)
        return Math.round(num * acc) / acc;
    }
}
/** clone */
export function cloneData<T>(data:T):T {
    return JSON.parse(JSON.stringify(data))
}
export function dateFullToNum(date:DateFull) {
    return Number(date.split('-').join(''))
}

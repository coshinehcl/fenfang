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
export function objectKeys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
}
export const getCurrentDate = (date?:Date)=> {
    const _date = date ? new Date(date) : new Date();
    const year = String(_date.getFullYear());
    const month = String(_date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以加1
    const day = String(_date.getDate()).padStart(2, '0');
    return {
        year,
        month,
        day,
        full:`${year}${month}${day}`
    }
}
function formatDate(date:Date){
    return getCurrentDate(date)
}
export function parseDate(dateString:string) {
    // 假设输入的格式为 'YYYYMMDD'
    const year = parseInt(dateString.slice(0, 4), 10);
    const month = parseInt(dateString.slice(4, 6), 10) - 1; // 注意月份是从0开始的
    const day = parseInt(dateString.slice(6, 8), 10);
    return new Date(year, month, day);
}

export function getWeekRanges(startDateStr:string, endDateStr:string) {
    // 解析并创建Date对象
    let start = parseDate(startDateStr);
    const end = parseDate(endDateStr);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const weekRanges = [];
    while (start <= end) {
        weekRanges.push(formatDate(start).full);
        start.setDate(start.getDate() + 7);
    }
    return weekRanges;
}
export function getMonthRanges(startDateStr:string, endDateStr:string) {
    // 解析并创建Date对象
    let start = parseDate(startDateStr);
    const end = parseDate(endDateStr);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const monthRanges = [];
    while (start <= end) {
        monthRanges.push(formatDate(start).full);
        start.setMonth(start.getMonth() + 1);
    }
    return monthRanges;
}
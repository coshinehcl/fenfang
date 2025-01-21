import type {keyDateItem} from '@types'
const babyKeyDateKey = 'babyKeyDateKey';
const defaultKeyDate:Array<keyDateItem> = [
    {
        belongWeek:'20241010',
        title:'社区医院',
        content:'孕酮',
        date:'20241012'
    },
    {
        belongWeek:'20241212',
        title:'第1次产检',
        content:'尿血',
        date:'20241214'
    },
    {
        belongWeek:'20241212',
        title:'第2次产检',
        content:'NT检查',
        date:'20241216'
    },
    {
        belongWeek:'20250102',
        title:'第3次产检',
        content:'无创',
        date:'20250102'
    },
    {
        belongWeek:'20250116',
        title:'第4次产检',
        content:'尿常规',
        date:'20250120'
    },
    {
        belongWeek:'20250206',
        title:'第5次产检',
        content:'四维彩超',
        date:'20250208'
    },
    {
        belongWeek:'20250213',
        title:'第6次产检',
        content:'尿常规',
        date:'20250217'
    }
]
export const getKeyDateList = () => {
    const keyDateList = localStorage.getItem(babyKeyDateKey);
    if(keyDateList) {
        try {
            const _list = JSON.parse(keyDateList) as Array<keyDateItem>;
            return Array.isArray(_list) ? _list : [];            
        } catch(err){
            return defaultKeyDate;
        }
    } else {
        return defaultKeyDate
    }
}
export const setKeyDateList = (list:Array<keyDateItem>) => {
    localStorage.setItem(babyKeyDateKey,JSON.stringify(list));
}
import type {keyDateItem} from '@types'
const babyKeyDateKey = 'babyKeyDateKey';
export const getKeyDateList = () => {
    const keyDateList = localStorage.getItem(babyKeyDateKey);
    if(keyDateList) {
        try {
            const _list = JSON.parse(keyDateList) as Array<keyDateItem>;
            return Array.isArray(_list) ? _list : [];            
        } catch(err){
            return [];
        }
    } else {
        return []
    }
}
export const setKeyDateList = (list:Array<keyDateItem>) => {
    localStorage.setItem(babyKeyDateKey,JSON.stringify(list));
}
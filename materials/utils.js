export function getDate(date){
    const _date = new Date(date)
    const year = _date.getFullYear();
    const month = String(_date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以加1
    const day = String(_date.getDate()).padStart(2, '0');
    return {
        year,
        month,
        day,
        full:`${year}-${month}-${day}`
    }
}
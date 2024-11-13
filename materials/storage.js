export const getCacheData = (key) => {
    const data = localStorage.getItem(key);
    if(data) {
        try {
            return JSON.parse(data);
        } catch(err){
            return data;
        }
    }
}
/**
 * 更新到缓存中
 * @param {'repo' | 'system'} key 
 * @param {string | object} data
 */
export const setCacheData = (key,data) => {
    // const cacheData = getCacheData(key);
    if(!data) {
        localStorage.removeItem(key)
    } else {
        if(typeof data === 'object') {
            localStorage.setItem(key,JSON.stringify(data));
        } else {
            localStorage.setItem(key,data);
        }
    }
}
// 这里是处理数据相关的
import { DateFull,RecordItem,RecordMaterialItem,RecordMaterialItemBrandItem,BrandItem } from '@types'
import { cloneData,getFormatNum } from '@utils'
import { recordItemBelongs } from '@config/recordList'
import { getNewMaterialsList } from '@config/materialsList'
const RecordListStorageKey = 'materials_recordList'
const materialsList = getNewMaterialsList();
function sortRecordList(recordList:Array<RecordItem>):Array<RecordItem>{
    recordList.sort((l,r) => {
        const l_recordDateNumber = Number(l.recordDate.split('-').join(''));
        const r_recordDateNumber = Number(r.recordDate.split('-').join(''));
        if(l_recordDateNumber < r_recordDateNumber) {
            return -1;
        } else if(l_recordDateNumber === r_recordDateNumber) {
            return 0;
        } else {
            return 1;
        }
    })
    return recordList;
}
/** 获取记录数据列表 */
export const getRecordList = () => {
    const recordList = localStorage.getItem(RecordListStorageKey);
    if(recordList) {
        try {
            const _list = JSON.parse(recordList) as Array<RecordItem>;
            // 取出来的时候，排序好
            if(Array.isArray(_list)) {
                return sortRecordList(_list);
            } else {
                return [];
            }
            
        } catch(err){
            return [];
        }
    } else {
        return []
    }
}
/** 设置记录数据进来 */
export const setRecordList = (recordList:Array<RecordItem>) => {
    try {
        localStorage.setItem(RecordListStorageKey,JSON.stringify(recordList));
    } catch(err) {
        alert('内存不足，将会移除部分老数据')
        sortRecordList(recordList);
        recordList = recordList.slice(1);
        // 再次存储
        setRecordList(recordList);
    }
    
}
export const removeRecordList = () => {
    localStorage.removeItem(RecordListStorageKey)
}
/** 更新记录的物料列表数据 */
function updateBelongRecordMaterialItemList(oldBelongRecordMaterialItemList?:Array<RecordMaterialItem>):Array<RecordMaterialItem>{
    // 更新物流列表
    return cloneData(materialsList).map(i => {
        const oldMaterialItem = oldBelongRecordMaterialItemList ? oldBelongRecordMaterialItemList.find(x => x.label === i.label) : undefined;
        // 更新品牌列表
        const newList = i.list.map(_i => {
            const oldMaterialItemBrandItem = oldMaterialItem ? oldMaterialItem.list.find(x => x.label === _i.label) : undefined;
            // 根据新的品牌列表和旧的numList数据生成新的numList
            const newNumList = _i.specs.map((__i,__index) => {
                return {
                    unit:__i.unit,
                    spec:__i.spec,
                    num:oldMaterialItemBrandItem ? oldMaterialItemBrandItem.numList[__index].num : 0
                }
            })
            return {
                label:_i.label,
                priority:_i.priority,
                isDeprecated:_i.isDeprecated || false,
                numList:newNumList
            }
        })
        return {
            label:i.label, 
            unit:i.unit,
            list:newList
        }
    })
}
/** 根据最新的materialsList来更新recordList */
export const updateRecordList = () => {
    const recordList = getRecordList();
    recordList.forEach(recordItem => {
        recordItemBelongs.forEach(belong => {
            recordItem[belong.field] = updateBelongRecordMaterialItemList(recordItem[belong.field]);
        })
    })
    setRecordList(recordList);
}

/** 根据类型和日期，拿到某个记录项(会依据物品的更新来更新) */
export const getRecordItem = (type:'newData' | 'modifyData',date:DateFull):RecordItem => {
    const recordList = getRecordList();
    let oldRecordItem:RecordItem | undefined;
    if(type === 'modifyData') {
        oldRecordItem = recordList.find(i => i.recordDate === date);
    }
    const recordItem:Partial<RecordItem> = {
        recordDate:date,
    };
    recordItemBelongs.forEach(belong => {
        recordItem[belong.field] = updateBelongRecordMaterialItemList(oldRecordItem?.[belong.field]);
    })
    return recordItem as RecordItem;
}

export const getRecordBrandItemTotalInfo = (brandItem:RecordMaterialItemBrandItem) => {
    let total:number = 0,totalTexts:Array<string> = [];
    brandItem.numList.forEach((numListItem,numListIndex) => {
        let currentTotal = 0;
        if(numListItem.num) {
            const currentTotalTexts = [`${numListItem.num}${numListItem.unit}`];
            currentTotal = numListItem.num * (numListItem.spec); 
            for(let j = numListIndex + 1;j < brandItem.numList.length;j++) {
                currentTotalTexts.push(`${brandItem.numList[j - 1].spec}${brandItem.numList[j].unit}`);
                currentTotal = currentTotal * (brandItem.numList[j].spec);                                              
            }
            totalTexts.push(currentTotalTexts.join('*'))
        }
        total += currentTotal;
    })
    return {total,totalText:totalTexts.join('+')}
}
export const getRecordMaterialItemTotalInfo = (materialItem:RecordMaterialItem) => {
    return materialItem.list.map(brandItem => getRecordBrandItemTotalInfo(brandItem))
}
export function formatSpecNum(specs:BrandItem['specs'],num:number){
    const _specs: BrandItem['specs']= JSON.parse(JSON.stringify(specs)) || [];
    let value:number = num;
    let str:string;
    if(num > 0) {
        const valueFormatList:Array<{value:number,unit:string}> = [];
        _specs.reverse().forEach((_i,_index) => {
            if(_index === 0) {
                valueFormatList.push({
                    value:num,
                    unit:_i.unit
                });
            } else {
                num = num / _i.spec;
                valueFormatList.push({
                    value:getFormatNum(num),
                    unit:_i.unit
                });
            }
        })
        return valueFormatList;
    } else {
        return [{
            value:num,
            unit:_specs.slice(-1)[0].unit
        }];
    }
}
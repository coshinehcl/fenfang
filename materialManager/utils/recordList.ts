import { RecordListStorageKey, recordBelongList,chartDataFields} from '@config'
import {RecordItemBase,BelongNumObj, MaterialItem, BrandItem, RecordBrandItemBase,
     RecordBrandItemFull,RecordItemFull, BelongNumObjFull, RecordItemComputed,
     BelongComputedNumObj,BelongNumChangeHooks,ChartDataFieldsType,
     RecordMaterialComputed,RecordBelongList} from '@types'
import { cloneData, getJson,getMaterialList,objectOmit,capitalizeFirstLetter,addObserve, 
    objectKeys,getDayDistance,getFormatNum,getMaterialValueText,getBrandValueText,debounce,exponentialMovingAverage,setMaterials } from '@utils'

function getEmptyRecordBrandItem(brandItem:BrandItem) {
    const belongObj = recordBelongList.reduce((total,cur) => {
        total[cur.belong] = brandItem.specs.map(specItem => {
            return {
                unit:specItem.unit,
                num:0
            }
        })
        return total;
    },{} as BelongNumObj)
    return {
        label:brandItem.label,
        ...belongObj
    }
}
function getEmptyRecordMaterialItem(materialItem:MaterialItem) {
    return {
        label:materialItem.label,
        list:materialItem.list.map(brandItem => getEmptyRecordBrandItem(brandItem))
    }
}
export function getEmptyRecordItem(date:RecordItemBase['recordDate']):RecordItemBase{
    const materialList = getMaterialList();
    return {
        recordDate:date,
        list:materialList.map(materialItem => getEmptyRecordMaterialItem(materialItem))
    }
}
/**
 * 获得recordItemBase数组
 * @returns 
 */
export async function getRecordListBase(voidGetJson = false){
    let _recordListStr = localStorage.getItem(RecordListStorageKey);
    let _recordList: Array<RecordItemBase> = [];
    if(!_recordListStr || (voidGetJson && _recordListStr === '[]')) {
        try {
            _recordList = await getJson('defaultRecordList') as Array<RecordItemBase>;
            if(_recordList && _recordList.length) {
                localStorage.setItem(RecordListStorageKey,JSON.stringify(_recordList))
            }
        } catch(err){
            console.error(err);
            _recordList = []
        }
    } else {
        try {
            _recordList = JSON.parse(_recordListStr)
        } catch(err) {
            _recordList = []
        }
    }
    return _recordList;
}
export function setRecordListBase(list:Array<RecordItemBase>) {
    if(list && Array.isArray(list) && list.every(i => i.recordDate && Array.isArray(i.list))) {
        localStorage.setItem(RecordListStorageKey,JSON.stringify(list));
    }
    return '格式不正确'
}

/**
 * 排序
 * @param recordList 
 */
function sortRecordList(recordList:Array<RecordItemBase>) {
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
}
/**
 * 更新记录列表中的物料,确保记录中的物料/品牌顺序和物料列表一致
 * 且没有的补充，多余的丢弃
 */
function updateRecordList(recordList:Array<RecordItemBase>){
    const materialList = getMaterialList();
    // 物料排序及整理
    recordList.forEach(recordItem => {
        const newRecordMaterialList:RecordItemBase['list'] = [];
        // 按照物料本身的顺序来
        materialList.forEach(materialItem => {
            let recordMaterialItem = recordItem.list.find(i => i.label === materialItem.label);
            if(!recordMaterialItem) {
                recordMaterialItem = getEmptyRecordMaterialItem(materialItem)
            } else {
                // brandItem的顺序和检查
                const newRecordBrandList:Array<RecordBrandItemBase> = [];
                materialItem.list.forEach(brandItem => {
                    let recordBrandItem = recordMaterialItem?.list.find(i => i.label === brandItem.label);
                    if(!recordBrandItem) {
                        recordBrandItem = getEmptyRecordBrandItem(brandItem);
                    }
                    newRecordBrandList.push(recordBrandItem);
                })
                recordMaterialItem.list = newRecordBrandList;
            }
            newRecordMaterialList.push(recordMaterialItem)
        })
        recordItem.list = newRecordMaterialList;
    })
    return recordList;
}
/**
 * 获得recordItemFull数组
 * @param recordList 
 */
function fillRecordList(recordList:Array<RecordItemBase>):Array<RecordItemFull>{
    const materialList = getMaterialList();
    return recordList.map(recordItem => {
        return {
            ...recordItem,
            list:recordItem.list.map(recordMaterialItem => {
                const findMaterialItem = materialList.find(i => i.label === recordMaterialItem.label)!;
                return {
                    ...recordMaterialItem,
                    ...findMaterialItem,
                    list:recordMaterialItem.list.map(recordBrandItem => {
                        const findBrandItem = findMaterialItem.list.find(i => i.label === recordBrandItem.label)!;
                        const belongObj = recordBelongList.reduce((total,cur) => {
                            total[cur.belong] = recordBrandItem[cur.belong].map(specItem => {
                                if(!findBrandItem) {
                                    console.log(findMaterialItem,recordBrandItem)
                                }
                                const findSpecItem = findBrandItem.specs.find(i => i.unit === specItem.unit)!;
                                if(!findSpecItem) {
                                    console.log(findBrandItem,specItem)
                                }
                                return {
                                    ...specItem,
                                    spec:findSpecItem.spec
                                }
                            })
                            return total;
                        },{} as BelongNumObjFull)
                        return {
                            ...recordBrandItem,
                            ...findBrandItem,
                            ...belongObj
                        }
                    })
                }
            })
        }
    })
}
function recordListAddFields(recordList:Array<RecordItemFull>):Array<RecordItemComputed>{
    function getComputedFields(){
        return recordBelongList.reduce((total,cur) => {
            total[`${cur.belong}Num`] = 0; 
            return total;
        },{} as BelongComputedNumObj);
    }
    function getHooksFields(){
        return recordBelongList.reduce((total,cur) => {
            total[`on${capitalizeFirstLetter(cur.belong)}NumChange`] = [];
            return total;
        },{} as BelongNumChangeHooks);
    }
    return recordList.map(recordItem => {
        return {
            ...recordItem,
            list:recordItem.list.map(recordMaterialItem => {
                return {
                    ...recordMaterialItem,
                    computed:getComputedFields(),
                    hooks:getHooksFields(),
                    chartData:chartDataFields.reduce((total,cur) => {
                        total[cur.field] = cur.default;
                        return total;
                    },{} as any) as ChartDataFieldsType,
                    onChartDataChange:[],
                    list:recordMaterialItem.list.map(recordBrandItem => {
                        return {
                            ...recordBrandItem,
                            computed:getComputedFields(),
                            hooks:getHooksFields()
                        }
                    })
                }
            })
        }
    })
}
/** 根据specs拿到数量 */
function getSpecsValue(specs:RecordBrandItemFull['system']):number {
    let total = 0;
    specs = cloneData(specs);
    let numRate = 1;
    specs.reverse().forEach(i => {
        numRate = numRate * i.spec;
        total += i.num * numRate;
    })
    return total;
}
function _setChartExtendData(recordList:Array<RecordItemComputed>){
    const materialList = getMaterialList();
    // 设置平均日耗
    materialList.forEach(materialItem => {
        const recordMaterialList = recordList.map(recordItem => recordItem.list.find(i => i.label === materialItem.label)!);
        // 如果当前dayUse是'-',则averageDayUse继承上个
        const dayUseVoidIndexList:number[] = [];
        recordMaterialList.forEach((i,index) => {
            if(i.chartData.dayUse === '-') {
                dayUseVoidIndexList.push(index)
            }
        })
        const NotVoidIndexMap:Record<`${number}`,number> = {};
        let notVoidNewIndex:number = 0;
        const dayUseNotVoidList = recordMaterialList.filter((i,index) => {
            if(i.chartData.dayUse !== '-') {
                NotVoidIndexMap[`${index}`] = notVoidNewIndex++;
                return true;
            }
            return false;
        }).map(i => i.chartData.dayUse) as number[];
        const averageList = exponentialMovingAverage(dayUseNotVoidList,3);
        // 设置平均值
        recordMaterialList.forEach((recordMaterialItem,recordMaterialIndex) => {
            // 第一项，采用物料中的数据，保存记录列表的时候，也要记得更新物料中的均值
            if(recordMaterialIndex === 0) {
                recordMaterialItem.chartData.averageDayUse = getFormatNum(materialItem.baseAverageDayUse);
            } else {
                // 如果当前没有DayUse。则继承上个记录的availableDay，确保不丢失信息
                const lastRecordMaterialItem = recordMaterialList[recordMaterialIndex -1];
                if(recordMaterialItem.chartData.dayUse === '-') {
                    recordMaterialItem.chartData.averageDayUse = getFormatNum(lastRecordMaterialItem.chartData.averageDayUse);
                } else {
                    recordMaterialItem.chartData.averageDayUse = getFormatNum(averageList[NotVoidIndexMap[`${recordMaterialIndex}`]]);
                }
            }
        })
        // 设置出库
        recordMaterialList.forEach((recordMaterialItem) => {
            if(recordMaterialItem.chartData.dayUse === '-') {
                recordMaterialItem.chartData.outSuggestStrong = 0;
                recordMaterialItem.chartData.outSuggestStrongText = '日耗为-,不出库'
                recordMaterialItem.chartData.outSuggestRelax = 0;
                recordMaterialItem.chartData.outSuggestRelaxText =  '日耗为-,不出库';
            } else {
                const systemNum = recordMaterialItem.computed.systemNum;
                const repoFullNum = recordMaterialItem.computed.repoNum + recordMaterialItem.computed.repoExtraNum;
                const averageDayUse = recordMaterialItem.chartData.averageDayUse;
                if(systemNum > repoFullNum) {
                    // 要多出库
                    let daysForLeveling = 0;
                    if(systemNum >= repoFullNum + averageDayUse * 14) {
                        daysForLeveling = 14;
                    } else {
                        daysForLeveling = 7;
                    }
                    const moreOutStrong = getFormatNum((systemNum - repoFullNum) / 7);
                    const moreOutRelax = getFormatNum((systemNum - repoFullNum) / daysForLeveling);
                    recordMaterialItem.chartData.outSuggestStrong = getFormatNum(averageDayUse + moreOutStrong);
                    recordMaterialItem.chartData.outSuggestStrongText = `系统多余仓库,多出(${moreOutStrong}),强出库:<strong>${recordMaterialItem.chartData.outSuggestStrong}</strong>`
                    recordMaterialItem.chartData.outSuggestRelax = getFormatNum(averageDayUse + moreOutRelax);
                    recordMaterialItem.chartData.outSuggestRelaxText = `系统多余仓库,多出(${moreOutRelax}),缓出库:<strong>${recordMaterialItem.chartData.outSuggestRelax}</strong>`
                } else if(systemNum === repoFullNum) {
                    // 正常出库
                    recordMaterialItem.chartData.outSuggestStrong = averageDayUse;
                    recordMaterialItem.chartData.outSuggestRelax = averageDayUse;
                    recordMaterialItem.chartData.outSuggestStrongText = `系统拉平仓库,正常出库:<strong>${averageDayUse}</strong>`
                    recordMaterialItem.chartData.outSuggestRelaxText = `系统拉平仓库,正常出库:<strong>${averageDayUse}</strong>`
                } else if(systemNum < repoFullNum) {
                    // 要少出库
                    let daysForLeveling = 0;
                    if(repoFullNum >= systemNum + averageDayUse * 14) {
                        daysForLeveling = 14;
                    } else {
                        daysForLeveling = 7;
                    }
                    const lessOutStrong = getFormatNum((repoFullNum - systemNum) / 7);
                    const lessOutRelax = getFormatNum((repoFullNum - systemNum) / daysForLeveling);
                    const strongOut = averageDayUse - lessOutStrong;
                    const relaxOut = averageDayUse - lessOutRelax;
                    recordMaterialItem.chartData.outSuggestStrong = strongOut > 0 ? getFormatNum(strongOut) : 0;
                    recordMaterialItem.chartData.outSuggestStrongText = `系统少于仓库,少出(${lessOutStrong}),强出库:<strong>${recordMaterialItem.chartData.outSuggestStrong}</strong>`
                    recordMaterialItem.chartData.outSuggestRelax = relaxOut > 0 ? getFormatNum(relaxOut) : 0;
                    recordMaterialItem.chartData.outSuggestRelaxText = `系统少余仓库,少出(${lessOutRelax}),缓出库:<strong>${recordMaterialItem.chartData.outSuggestRelax}</strong>`   
                }
            }
        })
        // 设置购买
        recordMaterialList.forEach((recordMaterialItem) => {
            const averageDayUse = recordMaterialItem.chartData.averageDayUse;
            const repoFullNum = recordMaterialItem.computed.repoNum + recordMaterialItem.computed.repoExtraNum;
            const needUseDay = 50;
            const needPurchaseDay = 50 - getFormatNum(repoFullNum / averageDayUse);
            if(recordMaterialItem.chartData.dayUse === '-') {
                recordMaterialItem.chartData.availableDay = getFormatNum(repoFullNum / averageDayUse);
                recordMaterialItem.chartData.purchaseSuggest = '-';
                recordMaterialItem.chartData.purchaseSuggestText = '日耗为-,不购买'
            } else {
                recordMaterialItem.chartData.availableDay = getFormatNum(repoFullNum / averageDayUse);
                recordMaterialItem.chartData.purchaseSuggest = needPurchaseDay <= 0 ? 0 :getFormatNum(needPurchaseDay * averageDayUse);
                recordMaterialItem.chartData.purchaseSuggestText = recordMaterialItem.chartData.purchaseSuggest <= 0 ? '数量充足，无需购买' : `需购买<strong>${recordMaterialItem.chartData.purchaseSuggest}</strong>`
            }
        })
    })
}
const setChartExtendData = debounce(_setChartExtendData,0,false);
function getChartBasicData(materialItem:RecordMaterialComputed,recordIndex:number,recordList:Array<RecordItemComputed>){
    // 拿到styleUse
    const systemNum = materialItem.computed.systemNum;
    const repoFullNum = materialItem.computed.repoNum + materialItem.computed.repoExtraNum;
    const purchaseNum = materialItem.computed.purchaseNum;
    // 拿到上个recordItem
    if(recordIndex === 0) return;
    const lastRecordItem = recordList[recordIndex -1];
    const lastRecordMaterialItem = lastRecordItem.list.find(i => i.label === materialItem.label)!;
    const lastSystemNum = lastRecordMaterialItem.computed.systemNum;
    const lastRepoFullNum = lastRecordMaterialItem.computed.repoNum + lastRecordMaterialItem.computed.repoExtraNum;
    const lastPurchaseNum = lastRecordMaterialItem.computed.purchaseNum;
    // 拿到dayDistance
    const dayDistance = getDayDistance(recordList[recordIndex].recordDate,lastRecordItem.recordDate);
    // 拿到styleUse
    const styleUse = lastRepoFullNum + purchaseNum - repoFullNum;
    // 这边需要判断当前是否有Day-use
    if(systemNum === 0 && lastSystemNum === 0 && repoFullNum === 0 && lastRepoFullNum === 0) {
        // materialItem.chartData.dayUse = '-'
    } else {
        materialItem.chartData.dayUse = getFormatNum(styleUse/dayDistance);
    }
    materialItem.chartData.weekUseText = `${getMaterialValueText(materialItem,getFormatNum(styleUse * 7/dayDistance))}`;
    materialItem.chartData.monthUseText = `${getMaterialValueText(materialItem,getFormatNum(styleUse * 30/dayDistance))}`;
    // 以下的依赖所有chartData的dayUse已初始化，且需要防抖
    setChartExtendData(recordList);
}
function recordListAddObserver(recordList:Array<RecordItemComputed>):Array<RecordItemComputed>{
    return recordList.map((recordItem,recordIndex) => {
        return {
            ...recordItem,
            list:recordItem.list.map(recordMaterialItem => {
                // 物料数量增加响应
                objectKeys(recordMaterialItem.computed).forEach(computedKey => {
                    addObserve(recordMaterialItem.computed,computedKey,(v)=> {
                        // 执行物料hooks
                        recordMaterialItem.hooks[`on${capitalizeFirstLetter(computedKey)}Change`].forEach(fun => {
                            try {
                                fun(v);
                            } catch(err){}
                        })
                    })
                    // 物料hooks增加fun:去修改chartData数据
                    recordMaterialItem.hooks[`on${capitalizeFirstLetter(computedKey)}Change`].push(()=> {
                        getChartBasicData(recordMaterialItem,recordIndex,recordList)
                    })
                })
                // chartData增加响应
                objectKeys(recordMaterialItem.chartData).forEach(computedKey => {
                    addObserve(recordMaterialItem.chartData,computedKey,(v)=> {
                        recordMaterialItem.onChartDataChange.forEach(fun => {
                            try {
                                fun();
                            } catch(err){}
                        })
                    })
                })
                return {
                    ...recordMaterialItem,
                    list:recordMaterialItem.list.map(recordBrandItem => {
                        recordBelongList.forEach(belongItem => {
                            recordBrandItem[belongItem.belong].forEach(specItem => {
                                // 品牌数量增加响应
                                addObserve(specItem,'num',(v)=> {
                                    // 计算品牌的归属值
                                    recordBrandItem.computed[`${belongItem.belong}Num`] = getSpecsValue(recordBrandItem[belongItem.belong]);
                                })
                            })
                        })
                        // 品牌的computed值改变，触发对应hooks
                        objectKeys(recordBrandItem.computed).forEach(computedKey=> {
                            addObserve(recordBrandItem.computed,computedKey,(v)=> {
                                // 执行品牌hooks
                                recordBrandItem.hooks[`on${capitalizeFirstLetter(computedKey)}Change`].forEach(fun => {
                                    try {
                                        fun(v);
                                    } catch(err){}
                                })
                            })
                            // 品牌hooks增加fun：去修改物料的对应数量
                            recordBrandItem.hooks[`on${capitalizeFirstLetter(computedKey)}Change`].push(()=> {
                                function getBrandsNum(_materialItem:RecordMaterialComputed):number {
                                    let total = 0;
                                    _materialItem.list.forEach(i => {
                                        total += i.computed[computedKey]
                                    })
                                    return total;
                                }
                                recordMaterialItem.computed[computedKey] = getBrandsNum(recordMaterialItem);
                            })
                        })
                        return {
                            ...recordBrandItem,
                        }
                    })
                }
            })
        }
    })
}
function recordListFireObserver(recordList:Array<RecordItemComputed>):Array<RecordItemComputed>{
    recordList.forEach(recordItem => {
        recordItem.list.forEach(recordMaterialItem => {
            recordMaterialItem.list.forEach(recordBrandItem => {
                recordBelongList.forEach(belongItem => {
                    // 初始化更新computed。然后触发其它observer逻辑
                    recordBrandItem.computed[`${belongItem.belong}Num`] = getSpecsValue(recordBrandItem[belongItem.belong]);
                })
            })
        })
    })
    return recordList;
}

export function initRecordList(recordList:Array<RecordItemBase>){
    recordList = cloneData(recordList);
    sortRecordList(recordList);
    recordList = updateRecordList(recordList);
    const recordListFull = fillRecordList(recordList);
    const recordList1 = recordListAddFields(recordListFull);
    const recordList2 = recordListAddObserver(recordList1);
    const recordList3 = recordListFireObserver(recordList2);
    return recordList3;
}

export function validateRecordItem(recordItem:RecordItemComputed) {
    if(!recordItem.recordDate) return '日期不能为空';
    if(!recordItem.list.length) return '列表不能为空';
    let errMsg:[RecordBelongList[number]['belong'],number,string];
    recordItem.list.some((recordMaterialItem,recordMaterialIndex) => {
        recordMaterialItem.list.some(recordBrandItem => {
            recordBelongList.some(belongItem => {
                const v = recordBrandItem.computed[`${belongItem.belong}Num`]
                if(typeof v !== 'number') {
                    errMsg = [belongItem.belong,recordMaterialIndex,'数量需要为数字']
                    return true;
                }
                if(isNaN(v)) {
                    errMsg = [belongItem.belong,recordMaterialIndex,'数量需要为数字']
                    return true;
                }
                if(v < 0) {
                    errMsg = [belongItem.belong,recordMaterialIndex,'数量需要为大于0']
                    return true;
                }
            })
            if(errMsg) return true;
        })
        if(errMsg) return true;
    })
    return errMsg! ? errMsg : ''
}

export function setRecordList(recordList:Array<RecordItemComputed>){
    let errMsg:any;
    let errrRecordIndex;
    recordList.some((recordItem,recordIndex) => {
        errMsg = validateRecordItem(recordItem);
        if(errMsg) {
            errrRecordIndex = recordIndex;
            return true
        };
    })
    if(errMsg){
        console.error(recordList,`index:${errrRecordIndex}`,errMsg)
        throw new Error('数据异常')
    }
    const recordListBase:Array<RecordItemBase> = [];
    // 只存储10项，多余裁剪，为了不丢失均值信息，这个数据保留到物料中
    const MaxStorageNum = 10;
    let storageList:Array<RecordItemComputed> = recordList;
    if(recordList.length > MaxStorageNum) {
        storageList = recordList.slice(-MaxStorageNum);
        const spliceItem = recordList[recordList.length - MaxStorageNum -1];
        const materialList = getMaterialList();
        materialList.forEach(materialItem => {
            const findItem = spliceItem.list.find(i => i.label === materialItem.label);
            if(findItem) {
                materialItem.baseAverageDayUse = findItem.chartData.averageDayUse;
            }
        })
        setMaterials(materialList);
    }
    storageList.forEach(recordItem => {
        const newList = recordItem.list.map(recordMaterialItem => {
            return {
                label:recordMaterialItem.label,
                list:recordMaterialItem.list.map(recordBrandItem => {
                    const newSpecsObj = recordBelongList.reduce((total,cur)=> {
                        total[cur.belong] = recordBrandItem[cur.belong].map(i => {
                            return {
                                unit:i.unit,
                                num:i.num
                            }
                        })
                        return total;
                    },{} as BelongNumObj)
                    return {
                        label:recordBrandItem.label,
                        ...newSpecsObj
                    }
                })
            }
        })
        recordListBase.push({
            recordDate:recordItem.recordDate,
            list:newList
        })
    })
    // 存储异常，抛到外面感知
    localStorage.setItem(RecordListStorageKey,JSON.stringify(recordListBase));
}

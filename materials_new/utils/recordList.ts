import { BrandItem, MaterialsItem, RecordItemBase,RecordItemFull,RecordItemHooks,RecordMaterialItemBase } from '@types'
import { RecordMaterialItemHooks,RecordBrandItemHooks,RecordBelong,RecordBrandItemNumList,RecordBrandItemBase } from '@types'
import { recordRecordBelong ,defaultRecordList} from '@config'
import { getMaterialList,setMaterialList,getSpecsText} from './materialList'
import { deleteProperty,objectKeys,getDayDistance,getFormatNum,generateIncrementalArray,getCurrentDate,cloneData } from '@utils'
const RecordListStorageKey = 'materials_recordList_new'
function createRecordBrandItem(brandItem:BrandItem):RecordBrandItemBase{
    const belongNumObj:Partial<Omit<RecordBrandItemBase,'label'>> = {};
    recordRecordBelong.forEach(belongItem => {
        belongNumObj[belongItem.field] = brandItem.specs.map(i => {
            return {
                ...i,
                num:0
            }
        })
    })
    return {
        label:brandItem.label,
        ...(belongNumObj as Omit<RecordBrandItemBase,'label'>)
    }
}
function createRecordMaterialItem(materialItem:MaterialsItem):RecordMaterialItemBase{
    return {
        label:materialItem.label,
        list:materialItem.list.map(brandItem => createRecordBrandItem(brandItem))
    }
}
/**
 * 根据物料列表，修改初始记录列表
 *  - 如果有新物料，则添加到记录列表中
 *  - 如果有新品牌，则添加到记录列表中
 *  - 不在物料列表中的物料，则会从记录列表中移除
 *  - 记录项中的物料顺序，按照materialList来(虽然后续不依赖顺序，只会通过label来定位)
 * @param recordList 记录列表
 */
export function updateRecordListByMaterialList(recordList:Array<RecordItemBase>):Array<RecordItemBase>{
    const newRecordList:Array<RecordItemBase> = [];
    recordList.forEach(recordItem => {
        const newRecordMaterialsList:Array<RecordMaterialItemBase>= [];
        // 确保物料顺序
        getMaterialList().forEach(materialItem => {
            const findRecordMaterialItem = recordItem.list.find(i => i.label === materialItem.label);
            if(findRecordMaterialItem) {
                // 如果原记录中，有，则确认品牌是否有
                const newRecordBrandList:Array<RecordBrandItemBase>= [];
                // 保证品牌的顺序
                materialItem.list.forEach(brandItem => {
                    const findRecordBrandItem = findRecordMaterialItem.list.find(i => i.label === brandItem.label);
                    if(findRecordBrandItem) {
                        newRecordBrandList.push(findRecordBrandItem)
                    } else {
                        newRecordBrandList.push(createRecordBrandItem(brandItem))
                    }
                })
                newRecordMaterialsList.push({
                    ...findRecordMaterialItem,
                    list:newRecordBrandList
                });
            } else {
                // 如果原记录中，没有，则添加进来
                newRecordMaterialsList.push(createRecordMaterialItem(materialItem))
            }
        })
        newRecordList.push({
            recordDate:recordItem.recordDate,
            list:newRecordMaterialsList
        })
    })
    return newRecordList;
}

/**
 * 对记录列表排序
 * @param recordList 记录列表
 * @returns 排序后的记录列表
 */
function sortRecordList(recordList:Array<RecordItemBase>):Array<RecordItemBase>{
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
    return recordList
}
/**
 * 对物料增加额外信息
 * @param recordList 原始记录列表
 * @returns Array<RecordItemFull>
 */
function complementRecordList(recordList:Array<RecordItemBase>):Array<RecordItemFull> {
    return recordList.map(recordItem => {
        return {
            ...recordItem,
            list:recordItem.list.map(recordMaterialItem => {
                const findMaterialItem = getMaterialList().find(i => i.label === recordMaterialItem.label)! || {};
                return {
                    // 补充物料的信息
                    ...findMaterialItem,
                    ...recordMaterialItem,
                    list:recordMaterialItem.list.map(recordBrandItem => {
                        const findBrandItem = findMaterialItem.list.find(i => i.label === recordBrandItem.label)! || {};
                        return {
                            ...recordBrandItem,
                            // 补充品牌的信息
                            ...deleteProperty(findBrandItem,'specs')
                        }
                    })
                }
            })
        }
    })
}
/**
 * 对记录项，增加钩子，用于更新数据及界面
 * 根据品牌的belongField规格中的num
 *  - 更新品牌的computed对应字段的值
 *  - 触发品牌的hooks对应的钩子
 *  - 触发对应物料
 *      - 更新物料的computed对应字段的值
 *      - 触发物料的hooks对应的钩子
 *      - 给物料的hooks增加修改物料图表数据的钩子
 * @param recordItem 补充额外信息后的记录项
 */
function hooksRecordList(recordList:Array<RecordItemFull>):Array<RecordItemHooks> {
    function getBrandNum(belongField:RecordBelong[number]['field'],brandItem:RecordBrandItemHooks):number {
        const newBrandItemSpecs:RecordBrandItemNumList = JSON.parse(JSON.stringify(brandItem[belongField]));
        newBrandItemSpecs.reverse();
        let v = 0;
        let rate = 1;
        newBrandItemSpecs.forEach(specsItem => {
            rate = rate * specsItem.spec;
            v += specsItem.num * rate;
        })
        return v;
    }
    function getBrandSpecsText(brandItem:RecordBrandItemBase):string {
        const newBrandItemSpecs:RecordBrandItemNumList = JSON.parse(JSON.stringify(brandItem.system));
        return getSpecsText(newBrandItemSpecs);
    }
    function getMaterialNum(belongField:RecordBelong[number]['field'],materialItem:RecordMaterialItemHooks) {
        let v = 0;
        materialItem.list.forEach(brandItem => {
            const computedField = `${belongField}Num` as `${RecordBelong[number]['field']}Num`
            v += brandItem.computed[computedField]
        })
        return v;
    }
    function updateBrandComputedValueAndFireHooks(belongField:RecordBelong[number]['field'],brandItem:RecordBrandItemHooks,materialItem:RecordMaterialItemHooks){
        const v = getBrandNum(belongField,brandItem)
        const computedField = `${belongField}Num` as `${RecordBelong[number]['field']}Num`
        brandItem.computed[computedField] = v;
        // 触发自身的hooks
        const hooksField = `${belongField}NumChange` as `${RecordBelong[number]['field']}NumChange`
        brandItem.hooks[hooksField].forEach(i => {
            i(v)
        })
        // 如果是repo则要更新repoFull
        if(belongField.includes('repo')) {
            const repoV = getBrandNum('repo',brandItem);
            const repoExtraV = getBrandNum('repoExtra',brandItem);
            brandItem.computed['repoFullNum'] = repoV + repoExtraV;
            brandItem.hooks['repoFullNumChange'].forEach(i => {
                i(v)
            })
        }
        // 触发updateMaterialComputedValue
        updateMaterialComputedValueAndFireHooks(belongField,materialItem)
    }
    function updateMaterialComputedValueAndFireHooks(belongField:RecordBelong[number]['field'],materialItem:RecordMaterialItemHooks) {
        const v = getMaterialNum(belongField,materialItem);
        const computedField = `${belongField}Num` as `${RecordBelong[number]['field']}Num`
        materialItem.computed[computedField] = v;
         // 触发自身的hooks
         const hooksField = `${belongField}NumChange` as `${RecordBelong[number]['field']}NumChange`
         materialItem.hooks[hooksField].forEach(i => {
             i(v)
         })
        // 如果是repo则要更新repoFull
        if(belongField.includes('repo')) {
            const repoV = getMaterialNum('repo',materialItem);
            const repoExtraV = getMaterialNum('repoExtra',materialItem);
            materialItem.computed['repoFullNum'] = repoV + repoExtraV;
            materialItem.hooks['repoFullNumChange'].forEach(i => {
                i(v)
            })
        }
    }
    function updateMaterialComputedChartDataAndFireHooks(recordList:Array<RecordItemHooks>,materialLabel?:RecordMaterialItemHooks['label']){
        // 1、提供图表的展示信息
        // 2、提供addRecordItem/modifyRecordItem的辅助信息
        function _getAverageDayUse(recordMaterialItem:RecordMaterialItemHooks,recordIndex:number):number {
            if(recordIndex === 0) {
                return getFormatNum(recordMaterialItem.baseAverageDayUse);
            } else {
                const preRecordMaterialItem = recordList[recordIndex -1].list.find(i => i.label === recordMaterialItem.label)! || {};
                const currentMaterialItemDayUse = recordMaterialItem.computed.chartData.dayUse;
                const preMaterialItemAverageDayUse = preRecordMaterialItem.computed.chartData.averageDayUse;
                if(currentMaterialItemDayUse === '-') {
                    // 如果，当前项，没有DayUse，则保持为上一个的均日耗
                    return preMaterialItemAverageDayUse;
                } else {
                    // 否则，和上一个的均日耗，作0.5计算
                    return getFormatNum(currentMaterialItemDayUse * 0.5 + preMaterialItemAverageDayUse * 0.5)
                }
            }
        }
        function _getOutSuggestInfo(recordMaterialItem:RecordMaterialItemHooks){
            const systemNum = recordMaterialItem.computed.systemNum;
            const repoNum = recordMaterialItem.computed.repoNum;
            const repoFullNum = recordMaterialItem.computed.repoFullNum;
            const usage = recordMaterialItem.uasge;
            const averageDayUse = recordMaterialItem.computed.chartData.averageDayUse;
            function _computed(_systemNum:number,_repoNum:number,isRepoFull:boolean){
                let outSuggestText = `系统(${_systemNum})${isRepoFull ? '总仓库' : '仓库'}(${_repoNum})`;
                let outSuggest:number;
                // 暴力出库情况下。需要10天内抹平差异，不管差异多大
                // 柔和出库情况下。会根据差异大小，调整抹平差异的时间
                if(_systemNum > _repoNum) {
                    // 系统数量较多，需要多出库
                    const moreOutRate = Math.round((_systemNum - _repoNum) / averageDayUse);
                    let catchUpDays:number;
                    if(moreOutRate < 10) {
                        outSuggestText+='[系统稍多]'
                        catchUpDays = isRepoFull ? 7 * 2 : 10;// 2周抹平差异
                    } else if(moreOutRate < 20) {
                        outSuggestText+='[系统较多]'
                        catchUpDays = isRepoFull ? 7 * 4 : 10;// 4周抹平差异
                    } else {
                        outSuggestText+='[系统远多]'
                        catchUpDays = isRepoFull ? 7 * 6 : 10;// 6周抹平差异
                    }
                    const moreOut = getFormatNum((1 / catchUpDays) * averageDayUse); 
                    outSuggest = Math.min(...[averageDayUse + moreOut,usage.max]);
                    outSuggest = getFormatNum(outSuggest);
                    outSuggestText+=`[逻辑${averageDayUse}+${moreOut}]`
                    outSuggestText+=`[出库<strong>${outSuggest}</strong>]`
                } else if(_systemNum === _repoNum){
                    outSuggestText+='[一样多]'
                    outSuggest = averageDayUse;
                    outSuggest = getFormatNum(outSuggest);
                    outSuggestText+=`[出库<strong>${outSuggest}</strong>]`
                } else {
                    // 系统较少，需要少出库
                    const lessOutRate = Math.round((_repoNum - _systemNum) / averageDayUse);
                    let catchUpDays:number;
                    if(lessOutRate < 10) {
                        outSuggestText+='[总仓库稍多]'
                        catchUpDays = isRepoFull ? 7 * 2 : 10 
                    } else if(lessOutRate < 20) {
                        outSuggestText+='[总仓库较多]'
                        catchUpDays = isRepoFull ? 7 * 4 : 10
                    } else {
                        outSuggestText+='[总仓库远多]'
                        catchUpDays = isRepoFull ? 7 * 6 : 10
                    }
                    const lessOut = getFormatNum((1 / catchUpDays) * averageDayUse); 
                    outSuggest = Math.max(...[averageDayUse - lessOut,usage.min]);
                    outSuggest = getFormatNum(outSuggest);
                    outSuggestText+=`[逻辑${averageDayUse}-${lessOut}]`
                    outSuggestText+=`[出库<strong>${outSuggest}</strong>]`
                }
                return {
                    outSuggest:outSuggest,
                    outSuggestText
                }
            }
            const outSuggestByRepoInfo = _computed(systemNum,repoNum,false);
            const outSuggestByRepoFullInfo = _computed(systemNum,repoFullNum,true)
            return {
                outSuggestByRepo:outSuggestByRepoInfo.outSuggest,
                outSuggestByRepoFull:outSuggestByRepoFullInfo.outSuggest,
                outSuggestTextByRepo:outSuggestByRepoInfo.outSuggestText,
                outSuggestTextByRepoFull:outSuggestByRepoFullInfo.outSuggestText
            }
        }
        function getNumToMaxUnitNumTextList(recordMaterialItem:RecordMaterialItemHooks,num:number) {
            return recordMaterialItem.list.map(recordBrandItem => {
                if(recordBrandItem.isDeprecated) {
                    return ''
                } else {
                    const MaxUnitMapMinUnitNum = recordBrandItem.system.reduce((total,cur) => {
                        total = total * cur.spec;
                        return total;
                    },1);
                    return `${getFormatNum(num / MaxUnitMapMinUnitNum)}${recordBrandItem.system[0].unit}`
                }
            }).filter(Boolean);
        }
        function _getPurchaseInfo(recordMaterialItem:RecordMaterialItemHooks,recordIndex:number){
            let _repoFullNum = recordMaterialItem.computed.repoFullNum;
            let _averageDayUse = recordMaterialItem.computed.chartData.averageDayUse;
            const currentRecordItem = recordList[recordIndex];
            let _purchaseText = '';
            let _purchaseNum = 0;
            const availableDays = 45; // 需要用多久
            if(_averageDayUse === 0) {
                return {
                    purchaseSuggest:_purchaseNum,
                    purchaseSuggestText:'[日耗为0，无法计算]'
                }
            }
            if(recordIndex === recordList.length -1) {
                _purchaseText+=`[预计]`;
                const dayDistanceToday = getDayDistance(getCurrentDate().full,currentRecordItem.recordDate);
                _repoFullNum = getFormatNum(_repoFullNum - (_averageDayUse * dayDistanceToday));
            }
            _purchaseText+=`[仓库${_repoFullNum}]`
             _purchaseText+=`[日耗${_averageDayUse}]`
            const availableDay = _repoFullNum > 0 ? getFormatNum(_repoFullNum / _averageDayUse) : 0;
            _purchaseText+=`[可用${availableDay}天]`;
            if(availableDay >= availableDays) {
                _purchaseNum = 0;
                _purchaseText+=`[无需购买]`
            } else {
                _purchaseNum = getFormatNum((availableDays - availableDay) * _averageDayUse);
                _purchaseText+=`[需要购买<strong>${getNumToMaxUnitNumTextList(recordMaterialItem,_purchaseNum)}</strong>]`
            }
            return {
                purchaseSuggest:_purchaseNum,
                purchaseSuggestText:_purchaseText
            }
        }
        function _updateMaterialChartData(recordMaterialItem:RecordMaterialItemHooks,recordIndex:number){
            const currentRecordItem = recordList[recordIndex];
            const currentRecordMaterialItem = recordMaterialItem;
            const currentChartData = currentRecordMaterialItem.computed.chartData;
            if(recordIndex !== 0) {
                // 此时可以计算dayUse/weekUseText
                const prevRecordItem = recordList[recordIndex -1];
                const prevRecordMaterialItem = prevRecordItem.list.find(i => i.label === recordMaterialItem.label)! || {};
                const dayDistance = getDayDistance(currentRecordItem.recordDate,prevRecordItem.recordDate);
                const repoFullUse = prevRecordMaterialItem.computed.repoFullNum + currentRecordMaterialItem.computed.purchaseNum - currentRecordMaterialItem.computed.repoFullNum;
                // 更新dayUse,weekUseText
                // 如果上次和这次的仓库和系统都是0，则认为是后续添加的物料，此时没有它的记录信息
                if(prevRecordMaterialItem.computed.repoFullNum === 0 && 
                    prevRecordMaterialItem.computed.systemNum === 0 && 
                    currentRecordMaterialItem.computed.repoFullNum === 0 &&
                    currentRecordMaterialItem.computed.systemNum
                ) {
                    currentChartData.dayUse = '-';
                    currentChartData.weekUseText = '';
                } else {
                    currentChartData.dayUse = getFormatNum(repoFullUse / dayDistance);
                    currentChartData.weekUseText = getNumToMaxUnitNumTextList(recordMaterialItem,currentChartData.dayUse * 7).toString();
                }
            }
            // 计算其它currentChartData的值
            currentChartData.averageDayUse = _getAverageDayUse(recordMaterialItem,recordIndex);
            // 基于averageDayUse,更新availableDay,outSuggest,outSuggestText,purchaseSuggest,purchaseSuggestText
            if(currentChartData.averageDayUse <= 0) {
                // 对于异常数据，则不进入后续计算
                currentChartData.availableDay = '-';
                currentChartData.outSuggestByRepo = '-';
                currentChartData.outSuggestByRepoFull = '-';
                currentChartData.outSuggestTextByRepo = '[数据异常，无法计算]';
                currentChartData.outSuggestTextByRepoFull = '';
                currentChartData.purchaseSuggest = 0;
                currentChartData.purchaseSuggestText = '[数据异常，无法计算]';
            } else {
                currentChartData.availableDay = getFormatNum(currentRecordMaterialItem.computed.repoFullNum / currentChartData.averageDayUse);
                const outSuggestInfo = _getOutSuggestInfo(recordMaterialItem);
                currentChartData.outSuggestByRepo = outSuggestInfo.outSuggestByRepo;
                currentChartData.outSuggestByRepoFull = outSuggestInfo.outSuggestByRepoFull;
                currentChartData.outSuggestTextByRepo = outSuggestInfo.outSuggestTextByRepo;
                currentChartData.outSuggestTextByRepoFull = outSuggestInfo.outSuggestTextByRepoFull;
                // 计算购买
                const purchaseInfo = _getPurchaseInfo(recordMaterialItem,recordIndex)
                currentChartData.purchaseSuggest = purchaseInfo.purchaseSuggest;
                currentChartData.purchaseSuggestText = purchaseInfo.purchaseSuggestText;
            }
            // 触发钩子
            recordMaterialItem.hooks.chartDataChange.forEach(i => {
                i(cloneData(recordMaterialItem.computed.chartData))
            })
        }
        // 入口
        recordList.forEach((recordItem,recordIndex) => {
            if(materialLabel) {
                // 只更新此物料的
                const findRecordMaterialItem = recordItem.list.find(i => i.label === materialLabel);
                if(findRecordMaterialItem) {
                    _updateMaterialChartData(findRecordMaterialItem,recordIndex)
                }
            } else {
                recordItem.list.forEach(recordMaterialItem => {
                    _updateMaterialChartData(recordMaterialItem,recordIndex)
                })
            }
        })
    }
    function addComputedAndHooksFields(recordList:Array<RecordItemFull>):Array<RecordItemHooks>{
        return recordList.map(recordItem => {
                const recordHooksItem:RecordItemHooks = {
                ...recordItem,
                list:recordItem.list.map(recordMaterialItem => {
                    const findMaterialItem = getMaterialList().find(i => i.label === recordMaterialItem.label)! || {};
                    const recordMaterialHooksItem:RecordMaterialItemHooks = {
                        ...recordMaterialItem,
                        computed:{
                            purchaseNum:0,
                            repoNum:0,
                            repoExtraNum:0,
                            systemNum:0,
                            repoFullNum:0,
                            chartData:{
                                dayUse:'-',
                                weekUseText:'',
                                averageDayUse:findMaterialItem.baseAverageDayUse || 0, // 默认值是物料列表中配置的baseAverageDayUse
                                availableDay:'-',
                                outSuggestByRepo:'-',
                                outSuggestTextByRepo:'',
                                outSuggestByRepoFull:'-',
                                outSuggestTextByRepoFull:'',
                                purchaseSuggest:0,
                                purchaseSuggestText:'',
                            },
                        },
                        hooks:{
                            purchaseNumChange:[],
                            repoNumChange:[],
                            repoExtraNumChange:[],
                            systemNumChange:[],
                            repoFullNumChange:[],
                            chartDataChange:[]
                        },
                        list:recordMaterialItem.list.map(recordBrandItem => {
                            const recordBrandHooksItem:RecordBrandItemHooks = {
                                ...recordBrandItem,
                                computed:{
                                    // 默认值
                                    purchaseNum:0,
                                    repoNum:0,
                                    repoExtraNum:0,
                                    systemNum:0,
                                    repoFullNum:0
                                },
                                hooks:{
                                    // 默认值
                                    purchaseNumChange:[],
                                    repoNumChange:[],
                                    repoExtraNumChange:[],
                                    systemNumChange:[],
                                    repoFullNumChange:[],
                                },
                                specsText:getBrandSpecsText(recordBrandItem)
                            }
                            // 增加监听
                            recordRecordBelong.forEach(belongItem => {
                                recordBrandItem[belongItem.field].forEach(specsItem => {
                                    let _innerNum = specsItem['num'];
                                    Object.defineProperty(specsItem,'num',{
                                        set(v:number){
                                            if(typeof v !== 'number') return;
                                            if(v !== _innerNum) {
                                                _innerNum = v;
                                                updateBrandComputedValueAndFireHooks(belongItem.field,recordBrandHooksItem,recordMaterialHooksItem)
                                            }
                                        },
                                        get(){
                                            return _innerNum;
                                        }
                                    })
                                })
                            })
                            return recordBrandHooksItem;
                        })
                    }
                    return recordMaterialHooksItem
                }),
            }
            return recordHooksItem
        })
    }
    function fireBrandNumChangeToFillValue(recordHooksList:Array<RecordItemHooks>){
        recordHooksList.forEach(recordItem => {
            recordItem.list.forEach(recordMaterialItem => {
                // 1、手动触发更新品牌数量，进而触发所有逻辑
                recordMaterialItem.list.forEach(recordBrandItem => {
                    recordRecordBelong.forEach(belongItem => {
                        updateBrandComputedValueAndFireHooks(belongItem.field,recordBrandItem,recordMaterialItem)
                    })
                })
            })
            // 给后续物料的computed的数据变化，增加修改chartData的钩子
            recordItem.list.forEach(recordMaterialItem => {
                //  给记录项下的物料，增加hooks:更新ChartData 及 hooks
                const hoolsKeys = objectKeys(recordMaterialItem.hooks)
                hoolsKeys.forEach(hookItem => {
                    // chartDataChange此字段排除
                    if(hookItem === 'chartDataChange') return;
                    // 这两个变动，必定会repoFullNumChange。所以排除这两个
                    if(hookItem === 'repoNumChange' || hookItem === 'repoExtraNumChange') return;
                    recordMaterialItem.hooks[hookItem].push((value) => {
                        updateMaterialComputedChartDataAndFireHooks(recordHooksList,recordMaterialItem.label)
                    })
                })
            })
        })
        // 统一执行一遍
        updateMaterialComputedChartDataAndFireHooks(recordHooksList)
    }
    // 主流程
    const recordHooksList = addComputedAndHooksFields(recordList);
    fireBrandNumChangeToFillValue(recordHooksList);
    return recordHooksList;
}
export function createRecordItem(recordDate:string):RecordItemBase{
    return {
        recordDate,
        list:getMaterialList().map(materialItem => createRecordMaterialItem(materialItem))
    }
}
/**
 * 存储记录列表，最多只会保存10项
 * @param recordList 记录列表
 * @returns 
 */
export function setRecordList(recordList:Array<RecordItemHooks>){
    // 校验是否有相同日期的
    const recordDateList:string[] = [];
    const isRecordDateRepeat = recordList.some(i => {
        if(recordDateList.includes(i.recordDate)) {
            recordDateList.push(i.recordDate);
            return true
        } else {
            recordDateList.push(i.recordDate);
            return false;
        }
    })
    if(isRecordDateRepeat) {
        alert(`记录项日期重复${recordDateList[recordDateList.length -1]}`);
        return;
    }
    const newRecordList = recordList.slice(-10);
    const newRecordFirstItem = newRecordList[0];
    const newMaterialList = getMaterialList().map(materialItem => {
        const findMaterialItem = newRecordFirstItem.list.find(_i => _i.label === materialItem.label)!;
        return {
            ...materialItem,
            // 更新物料的基准baseAverageDayUse
            baseAverageDayUse:findMaterialItem.baseAverageDayUse
        }
    })   
    const recordBaseList = newRecordList.map(recordItem => {
        return {
            recordDate:recordItem.recordDate,
            list:recordItem.list.map(recordMaterialItem => {
                return {
                    label:recordMaterialItem.label,
                    list:recordMaterialItem.list.map(recordBrandItem => {
                        const belongNumObj:Partial<Omit<RecordBrandItemBase,'label'>> = {};
                        recordRecordBelong.forEach(belongItem => {
                            belongNumObj[belongItem.field] = recordBrandItem[belongItem.field]
                        })
                        return {
                            label:recordBrandItem.label,
                            ...(belongNumObj as Omit<RecordBrandItemBase,'label'>)
                        }
                    })
                }
            })
        }
    })
    try {
        localStorage.setItem(RecordListStorageKey,JSON.stringify(recordBaseList));
        setMaterialList(newMaterialList)
    } catch(err){
        alert('存储异常')
     }
}
export function getRecordList(): Array<RecordItemBase>{
    let _recordListStr = localStorage.getItem(RecordListStorageKey);
    let _recordList: Array<RecordItemBase> = [];
    if(!_recordListStr) {
        _recordList =  defaultRecordList
    } else {
        try {
            _recordList = JSON.parse(_recordListStr)
        } catch(err) {
            _recordList = defaultRecordList
        }
    }
    return _recordList;
}
export function initRecordList(recordList:Array<RecordItemBase>):Array<RecordItemHooks>{
    sortRecordList(recordList);
    const newRecordList = updateRecordListByMaterialList(recordList);
    const recordFullList = complementRecordList(newRecordList);
    const recordHooksList = hooksRecordList(recordFullList);
    return recordHooksList;
}

export function getFormatNumBySpecs(brandItem:RecordBrandItemHooks,num:number):string{
    if(brandItem.isDeprecated) {
        return ''
    } else {
        let total = 1;
        let unit= '';
        const specs = cloneData(brandItem.system).reverse();
        for(const specItem of specs) {
            const newTotal = total * specItem.spec;
            if(num / newTotal < 0.5) {
                break;
            }
            unit = specItem.unit;
            total = newTotal;
        }
        return `${getFormatNum(num / total)}${unit}`
    }
}
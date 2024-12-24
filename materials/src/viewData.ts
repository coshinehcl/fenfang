import { ActionHandler,ChartItemRenderDataItemLike,ChartLabelFields,ChartItemBasic,ChartItemBasicAndRenderBasic,ChartItem,GetArrayType,RecordBelongsFields, CreateElementConfig,ChartFooterFields } from '@types'
import { getRecordList,cloneData, waitCondition, createElement, createCustomElement, removeChilds, getRecordBrandItemTotalInfo, getDayDistance, getFormatNum, getCurrentDate,formatSpecNum } from '@utils'
import { materialsList } from '@config/materialsList'
import { recordItemBelongs } from '@config/recordList'
// 根据记录列表，拿到label单独的记录列表组成的基础数据数组
function getChartItemBasicInfoList():Array<ChartItemBasic>{
    const recordList = getRecordList();
    const viewDataItemList:Array<ChartItemBasic & {
        recordList:Array<Partial<GetArrayType<ChartItemBasic['recordList']>>>
    }> = [];
    materialsList.forEach(materialItem => {
        viewDataItemList.push({
            label:materialItem.label,
            basicInof:{
                uasge:materialItem.uasge,
                unit:materialItem.unit,
                brandList:materialItem.list
            },
            recordList:[]
        })
    })
    recordList.forEach(recordItem => {
        recordItemBelongs.forEach(belongItem => {
            viewDataItemList.forEach(viewDataItem => {
                const _item = recordItem[belongItem.field].find(x => x.label === viewDataItem.label);
                if(_item) {
                    const viewDataItemRecordListItem = viewDataItem.recordList.find(x => x.recordDate === recordItem.recordDate);
                    if(!viewDataItemRecordListItem) {
                        viewDataItem.recordList.push({
                            recordDate: recordItem.recordDate,
                            [belongItem.field]: _item,
                        })
                    } else {
                        viewDataItemRecordListItem[belongItem.field] = _item;
                    }
                }
            })
        })
    })
    return cloneData(viewDataItemList)
}
// 处理基础信息，得到基础的渲染数据
function getChartItemRenderDataBasicList(list:Array<ChartItemBasic>):Array<ChartItemBasicAndRenderBasic> {
    return list.map(materialItem => {
        const brandList:ChartItemBasicAndRenderBasic['renderData']['brandList'] = [];
        materialItem.recordList.forEach(recordItem => {
            recordItemBelongs.forEach(belong => {
                recordItem[belong.field].list.forEach((recordBrandItem,recordBrandIndex) => {
                    if(!brandList[recordBrandIndex]) {
                        brandList[recordBrandIndex] = []
                    }
                    const findItem =  brandList[recordBrandIndex].find(x => x.recordDate === recordItem.recordDate);
                    if(findItem) {
                        findItem[belong.field] = getRecordBrandItemTotalInfo(recordBrandItem).total;
                    } else {
                        const defaultValueObj = recordItemBelongs.reduce((total:any,cur) => {
                            total[cur.field] = 0;
                            return total;
                        },{}) as Record<RecordBelongsFields,0>
                        brandList[recordBrandIndex].push({
                            recordDate:recordItem.recordDate,
                            label:recordBrandItem.label,
                            priority:recordBrandItem.priority,
                            // 默认值，避免ts报错
                            ...defaultValueObj,
                            [belong.field]:getRecordBrandItemTotalInfo(recordBrandItem).total
                        })
                    }
                })
            })
        })
        const materialItemRenderList:ChartItemBasicAndRenderBasic['renderData']['materialItem']= []
        materialItem.recordList.forEach((recordItem,recordIndex) => {
            const defaultValueObj = recordItemBelongs.reduce((total:any,cur) => {
                total[cur.field] = 0;
                return total;
            },{}) as Record<RecordBelongsFields,0>
            const materialItemRenderListItem:GetArrayType<typeof materialItemRenderList> = {
                label:materialItem.label,
                recordDate:recordItem.recordDate,
                ...defaultValueObj
            }
            recordItemBelongs.forEach(belong => {
                materialItemRenderListItem[belong.field] = brandList.reduce((total,cur) => {
                    total += cur[recordIndex][belong.field] || 0;
                    return total;
                },0)
            })
            materialItemRenderList.push(materialItemRenderListItem)
        })
        return {
            ...materialItem,
            renderData:{
                materialItem:materialItemRenderList,
                brandList:brandList
            }
        }
    })
}
function generateIncrementalArray(n:number) {
    if (n <= 0) return [];
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    const sum = arr.reduce((acc, val) => acc + val, 0);
    // 归一化数组，使所有元素之和等于1
    const normalizedArr = arr.map(val => val / sum);
    // 后三位，改为平均值(后面的权重均衡下)
    const lastThreeArr = normalizedArr.slice(-3);
    const lastThreeSum = lastThreeArr.reduce((acc,val) => acc + val,0);
    return [...normalizedArr.slice(0,-3),...lastThreeArr.map(i => lastThreeSum / lastThreeArr.length)];
}
function getAverageNum(list:Array<{dayUse:number | '-'}>):('-' | number){
    // 找到有价值的index。从这个index后面的值才计算
    const useIndex = list.findIndex(i => i.dayUse !== '-' && i.dayUse !== 0);
    if(useIndex === -1) {
        return '-'
    } else {
        const _list = list.slice(useIndex).filter(i => i.dayUse !== '-');
        if(_list.length > 0) {
            const incrementalArray = generateIncrementalArray(_list.length);
            return _list.reduce((total,cur,index) => {
                total += (cur.dayUse as number) * incrementalArray[index]
                return getFormatNum(total);
            },0)
        } else {
            return '-'
        }
    }
}
function getMaterialOutSuggestInfo(item:ChartItemRenderDataItemLike,basicInfo:ChartItem['basicInof']){
    const { repo,system,dayUse,averageDayUse } = item;
    const { min,max } = basicInfo.uasge;
    let outSuggest:'-' | number = '-';
    let outSuggestText = '';
    if(!averageDayUse || averageDayUse === '-') {
        return {
            outSuggest,
            outSuggestText:`系统(${system})仓库(${repo})`
        }
    }
    const systemCompareRepoMoreNum = system - repo;
    const planOutNum = getFormatNum(averageDayUse + (systemCompareRepoMoreNum / 30));
    const outSuggestTextBase = `系统(${system})仓库(${repo})均日耗(${averageDayUse})计划(${planOutNum})`
    if(systemCompareRepoMoreNum > 0) {
       if(planOutNum >= max) {
            outSuggest = max;
            outSuggestText = `${outSuggestTextBase};系统远多于仓库,出库:max(<strong>${outSuggest}</strong>)`
       } else {
            outSuggest = planOutNum;
            outSuggestText = `${outSuggestTextBase};系统多于仓库,出库:(<strong>${outSuggest}</strong>)`
       }
    } else {
        if(planOutNum <= min) {
            outSuggest = min;
            outSuggestText = `${outSuggestTextBase};系统远少于仓库,出库:min(<strong>${outSuggest}</strong>)`
        } else {
            outSuggest = planOutNum;
            outSuggestText = `${outSuggestTextBase};系统远少于仓库,出库:(<strong>${outSuggest}</strong>)`
        }
    }
    return {
        outSuggest:getFormatNum(outSuggest),
        outSuggestText
    }
}
// 处理基础的渲染数据，得到dayUse等计算值
function getChartItemRenderDataComputedList(list:Array<ChartItemBasicAndRenderBasic>):Array<ChartItem> {
    return list.map(chartBasicItem => {
        // 先计算物料本身
        const newRenderDataMaterialItemList:ChartItem['renderData']['materialItem'] = [];
        chartBasicItem.renderData.materialItem.forEach((materialItemRenderListItem,index) => {
            if(index === 0) {
                newRenderDataMaterialItemList.push({
                    ...materialItemRenderListItem,
                    dayUse:'-',
                    weekUse:'-',
                    averageDayUse:'-',
                    availableDay:'-',
                    outSuggest:'-',
                    outSuggestText:'',
                    purchaseSuggest:0,
                    purchaseSuggestText:''
                })
            } else {
                const lastItem = chartBasicItem.renderData.materialItem[index -1];
                const dayDistance = getDayDistance(materialItemRenderListItem.recordDate,lastItem.recordDate);
                const useNum = lastItem.repo + materialItemRenderListItem.purchase - materialItemRenderListItem.repo;
                const dayUse = getFormatNum(useNum / dayDistance);
                newRenderDataMaterialItemList.push({
                    ...materialItemRenderListItem,
                    dayUse,
                    weekUse:getFormatNum(dayUse * 7),
                    averageDayUse:'-',
                    availableDay:'-',
                    outSuggest:'-',
                    outSuggestText:'',
                    purchaseSuggest:0,
                    purchaseSuggestText:''
                })
                // push之后再计算
                const lastPushItem = newRenderDataMaterialItemList.slice(-1)[0]
                lastPushItem.averageDayUse = getAverageNum(newRenderDataMaterialItemList);
                if(lastPushItem.averageDayUse !== '-') {
                    lastPushItem.availableDay = getFormatNum(lastPushItem.repo / lastPushItem.averageDayUse);
                    let availableDay = lastPushItem.availableDay;
                    const needSufficeDay = 40;
                    function getBrandPerchaseFormatNum(num:number){
                        // 默认只用第一个品牌来作为参考
                        const lastFormatItem = formatSpecNum(chartBasicItem.basicInof.brandList[0].specs,num).slice(-1)[0];
                        return `(<strong>${lastFormatItem.value}${lastFormatItem.unit}<strong>)`
                    }
                    if(index ===  chartBasicItem.renderData.materialItem.length -1) {
                        const dayDistance = getDayDistance(getCurrentDate().full,lastItem.recordDate);
                        const currentRepoNum = getFormatNum(lastPushItem.repo - lastPushItem.averageDayUse * dayDistance)
                        if(availableDay - dayDistance >= needSufficeDay) {
                            lastPushItem.purchaseSuggestText = `到目前为止,仓库${currentRepoNum}均日耗${lastPushItem.averageDayUse},可用${getFormatNum(availableDay - dayDistance)}天,无需购买`
                        } else if(availableDay <= dayDistance) {
                            lastPushItem.purchaseSuggest = getFormatNum(needSufficeDay * lastPushItem.averageDayUse);
                            lastPushItem.purchaseSuggestText = `到目前为止,仓库${currentRepoNum}均日耗${lastPushItem.averageDayUse},需要购买${lastPushItem.purchaseSuggest}${getBrandPerchaseFormatNum(lastPushItem.purchaseSuggest)}`
                        } else {
                            lastPushItem.purchaseSuggest = getFormatNum((needSufficeDay - availableDay + dayDistance) * lastPushItem.averageDayUse);
                            lastPushItem.purchaseSuggestText = `到目前为止,仓库${currentRepoNum}均日耗${lastPushItem.averageDayUse},可用${getFormatNum(availableDay - dayDistance)}天,需要购买${ lastPushItem.purchaseSuggest}${getBrandPerchaseFormatNum(lastPushItem.purchaseSuggest)}`
                        }
                    } else {
                        if(availableDay >= needSufficeDay) {
                            lastPushItem.purchaseSuggestText = `无需购买,仓库${lastPushItem.repo}均日耗${lastPushItem.averageDayUse},可用${availableDay}天`
                        } else {
                            lastPushItem.purchaseSuggest = getFormatNum((needSufficeDay - availableDay)* lastPushItem.averageDayUse);
                            lastPushItem.purchaseSuggestText = `仓库${lastPushItem.repo}均日耗${lastPushItem.averageDayUse},可用${availableDay}天，需要购买${lastPushItem.purchaseSuggest}${getBrandPerchaseFormatNum(lastPushItem.purchaseSuggest)}`
                        }
                    }
                }
                const outSuggestInfo = getMaterialOutSuggestInfo(lastPushItem,chartBasicItem.basicInof);
                lastPushItem.outSuggest = outSuggestInfo.outSuggest;
                lastPushItem.outSuggestText = outSuggestInfo.outSuggestText;
            }
        })
        // 再计算品牌
        const newRenderDataRenderList:ChartItem['renderData']['brandList'] = []
        chartBasicItem.renderData.brandList.forEach((brandRenderListItem,index1) => {
            brandRenderListItem.forEach((brandRenderItem,index2) => {
                if(index2 === 0) {
                    newRenderDataRenderList.push([{
                        ...brandRenderItem,
                        dayUse:'-',
                        weekUse:'-',
                        averageDayUse:'-',
                        availableDay:'-',
                        outSuggest:'-',
                        outSuggestText:'',
                        purchaseSuggest:0,
                        purchaseSuggestText:''
                    }])
                } else {
                    const lastItem =  chartBasicItem.renderData.brandList[index1][index2 -1];
                    const dayDistance = getDayDistance(brandRenderItem.recordDate,lastItem.recordDate);
                    const useNum = lastItem.repo +  brandRenderItem.purchase - brandRenderItem.repo;
                    const dayUse = getFormatNum(useNum / dayDistance);
                    newRenderDataRenderList[index1].push({
                        ...brandRenderItem,
                        dayUse,
                        weekUse:getFormatNum(dayUse * 7),
                        averageDayUse:'-',
                        availableDay:'-',
                        outSuggest:'-',
                        outSuggestText:'',
                        purchaseSuggest:0,
                        purchaseSuggestText:''
                    })
                    // push之后再计算
                    const lastPushItem = newRenderDataRenderList[index1].slice(-1)[0];
                    lastPushItem.averageDayUse = getAverageNum(newRenderDataRenderList[index1]);
                    if(lastPushItem.averageDayUse !== '-') {
                        lastPushItem.availableDay = getFormatNum(lastPushItem.repo / lastPushItem.averageDayUse)
                    }
                    if(chartBasicItem.renderData.brandList.length === 1) {
                        lastPushItem.outSuggest = newRenderDataMaterialItemList[index2].outSuggest;
                        lastPushItem.outSuggestText = newRenderDataMaterialItemList[index2].outSuggestText;
                        lastPushItem.purchaseSuggest = newRenderDataMaterialItemList[index2].purchaseSuggest;
                        lastPushItem.purchaseSuggestText = newRenderDataMaterialItemList[index2].purchaseSuggestText;
                    } else {
                        const outSuggestInfo = getMaterialOutSuggestInfo(lastPushItem,chartBasicItem.basicInof);
                        lastPushItem.outSuggest = outSuggestInfo.outSuggest;
                        lastPushItem.outSuggestText = outSuggestInfo.outSuggestText;
                    }
                }
            })
        })
        // 再计算品牌的出库和购买
        // setBrandsOutSuggestInfo(newRenderDataMaterialItemList,newRenderDataRenderList);
        // setBrandsPurchaseInfo(newRenderDataMaterialItemList,newRenderDataRenderList);
        return {
            ...chartBasicItem,
            renderData:{
                materialItem:newRenderDataMaterialItemList,
                brandList:newRenderDataRenderList
            }
        }
    })
}
export const viewData:ActionHandler = async (parentNode,params) => {
    const chartItemBasicInfoList = getChartItemBasicInfoList();    
    const chartItemBasicRenderDataList = getChartItemRenderDataBasicList(chartItemBasicInfoList);
    const chartItemList = getChartItemRenderDataComputedList(chartItemBasicRenderDataList)
    console.log(chartItemList);
    await waitCondition(() => {
        return Chart !== undefined
    })
    if(!Chart.registry.plugins.datalabels){
        Chart.register(ChartDataLabels);
    }
    params.pageNavManager.updatePageNav();
    const chartSelectOptionsFieldMap:{
        [key in ChartLabelFields]:string
    }= {
        system:'系统',
        repo:'仓库',
        purchase:'购买',
        dayUse:'日耗',
        weekUse:'周耗',
        outSuggest:'出库建议',
        purchaseSuggest:'购买建议',
        averageDayUse:'均日耗',
        availableDay:'可用天数'
    }
    const chartSelectOptions:Array<{
        label:string,
        list:Array<ChartLabelFields>,
        footer:Array<ChartFooterFields>
    }> = [
        {
            label:'仓库系统',
            list:['system','repo'],
            footer:[]
        },
        {
            label:'消耗',
            list:['dayUse','averageDayUse'],
            footer:[]
        },
        {
            label:'出库建议',
            list:['averageDayUse','outSuggest'],
            footer:['outSuggestText']
        },
        {
            label:'购买建议',
            list:['availableDay','purchaseSuggest'],
            footer:['purchaseSuggestText']
        }
    ]
    const chartWrapperNode = createElement({
        tagName:'div',
        className:'chart-wrapper',
        childs:[
            {
                tagName:'div',
                className:'chart-select-wrapper',
                returnNode(ele) {
                    params.pageNavManager.addPageNav(ele,'选择图表')
                },
                childs:[
                    {
                        tagName:'label',
                        innerText:'选择图表',
                    },
                    {
                        tagName:'select',
                        className:'chart-select',
                        events:{
                            change(e:Event){
                                if(!e.target) return;
                                render((e.target as HTMLInputElement).value)
                            }
                        },
                        childs:[
                            {
                                tagName:'option',
                                 attributes:{
                                    value:'',
                                },
                                innerText:'请选择'
                            },
                            ...(chartSelectOptions.map(i => {
                                return {
                                    tagName:'option',
                                    attributes:{
                                        value:i.label,
                                    },
                                    innerText:i.label
                                }
                            }) as Array<CreateElementConfig>)
                        ],
                       
                    }
                ]
            },
            {
                tagName:'div',
                className:'chart-content'
            }
        ]
    },parentNode)
    function render(chartLabelStr:string = ''){
        const chartContentNode = chartWrapperNode.querySelector('.chart-content');
        if(!chartContentNode) return;
        removeChilds(chartContentNode);
        params.pageNavManager.updatePageNav();
        if(!chartLabelStr) return;
        const findChartLabelItem = chartSelectOptions.find(i => i.label === chartLabelStr);
        if(!findChartLabelItem) return;
        chartItemList.forEach(chartItem => {
            const myCharts = createCustomElement('my-charts',{
                data:chartItem,
                params:{
                    label:chartItem.label,
                    datasetsLabels:findChartLabelItem.list,
                    footer:findChartLabelItem.footer,
                    datasetsLabelsMap:chartSelectOptionsFieldMap
                }
            })
            createElement({
                tagName:'div',
                className:'chart-item',
                returnNode(ele){
                    params.pageNavManager.addPageNav(ele,chartItem.label);
                },
                childs:[
                    {
                        tagName:'div',
                        className:'chart-item-title',
                        innerText:chartItem.label
                    },
                    myCharts
                ]
            },chartContentNode)
        })
    }
    render();
}
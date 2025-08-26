import { ChartDataItem,MaterialsItem, ChartDataFields,ChartShowFields,RecordMaterialItemHooks} from '@types'
import { getRecordList,initRecordList } from './recordList'
import { chartShowTypes,chartFieldsMap } from '@config'
import { getMaterialList } from './materialList'
import {cloneData} from './common' 

export function getChartDataItem(chartTypeLabel:(typeof chartShowTypes)[number]['label'],materialItemLabel:MaterialsItem['label']):ChartDataItem{
    const recordList = initRecordList(getRecordList());
    const chartTypeItem = chartShowTypes.find(i => i.label === chartTypeLabel);
    const chartDataItem: ChartDataItem = {
        labels:[],
        datasets:[],
        materialItemLabel:materialItemLabel,
        chartMaterialItems:[]
    }
    if(!chartTypeItem || !materialItemLabel || !getMaterialList().find(i => i.label === materialItemLabel)) {
        return chartDataItem;
    }
    // 初始化datasets
    const { fields } = chartTypeItem;
    fields.forEach(fieldItem => {
        chartDataItem.datasets.push({
            field:fieldItem,
            label:chartFieldsMap[fieldItem],
            data:[]
        })
    })
    // 完成剩余的labels/datasets.data
    function getFieldValue(field:(typeof fields)[number],materialItem?:RecordMaterialItemHooks):string | number | null {
        if(!materialItem) return null;
        const computedValue = materialItem.computed;
        if(field in computedValue) {
            return computedValue[field as keyof Omit<typeof computedValue,'chartData'>]
        } else if(field in computedValue.chartData) {
            return computedValue.chartData[field as keyof typeof computedValue.chartData]
        } else {
            return null
        }
    }
    recordList.forEach(recordItem => {
        const findMaterialItem = recordItem.list.find(i => i.label === materialItemLabel)!;
        chartDataItem.labels.push(recordItem.recordDate);
        fields.forEach((fieldItem,index) => {
            chartDataItem.datasets[index].data.push(getFieldValue(fieldItem,findMaterialItem))
        })
        chartDataItem.chartMaterialItems.push(cloneData({
            ...findMaterialItem,
            recordDate:recordItem.recordDate
        }))
    })
    return chartDataItem;
}
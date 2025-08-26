import { MaterialItem ,RecordItemComputed,RecordMaterialComputed} from '@types'
import { getMaterialList,getRecordListBase, initRecordList } from '@utils'
export async function getChartData(label?:MaterialItem['label']){
    const labels:Array<MaterialItem['label']> = [];
    if(label) {
        labels.push(label);
    } else {
        labels.push(...getMaterialList().map(i => i.label))
    }
    const recordBaseList = await getRecordListBase();
    const recordList = initRecordList(recordBaseList);
    type ChartItemList = Array<{
        recordDate:RecordItemComputed['recordDate']
    } & RecordMaterialComputed>
    const chartDataList:Array<ChartItemList> = [];
    labels.forEach(_label => {
        const chartDataItemList:ChartItemList = [];
        recordList.forEach(recordItem => {
            const recordMaterialItem = recordItem.list.find(i => i.label === _label)!;
            chartDataItemList.push({
                recordDate:recordItem.recordDate,
                ...recordMaterialItem
            })
        })
        chartDataList.push(chartDataItemList);
    })
    return chartDataList;
}
import { ActionHandler, DateFull } from '@types'
import { createForm } from './createForm';
import { getRecordItem,getCurrentDate,getRecordList,getDayDistance, setRecordList } from '@utils'
export const newData:ActionHandler = (parentNode,params) => {
    createForm({
        type:'newData',
        params,
        parentNode:parentNode,
        getFormData(date){
            return getRecordItem('newData',date)
        },
        createDateNode(renderForm){
            return  {
                tagName:'input',
                className:'form-date',
                attributes:{
                    type:'date',
                    value:'',
                    max:getCurrentDate().full
                },
                events:{
                    change(event:Event){
                        let recordDate = (event.target as HTMLInputElement)?.value as (DateFull | undefined);
                        function update(){
                            renderForm(recordDate);
                        }
                        if(!recordDate) {
                            update();
                            return;
                        }
                        // 校验当前recordData是否可行
                        const recordList = getRecordList();
                        if(getDayDistance(recordDate,getCurrentDate().full) > 0) {
                            alert('不能选择未来日期');
                            recordDate = undefined;
                            update();
                            return;
                        } else if(recordList.length > 1 && getDayDistance(recordDate,recordList.slice(-1)[0].recordDate) < 0) {
                            alert(`要大于最近记录日期:${recordList.slice(-1)[0].recordDate}`);
                            recordDate = undefined;
                            update();
                            return;
                        }
                        const findItem = recordList.find(i => i.recordDate === recordDate);
                        if(findItem) {
                            alert('数据列表中已有该日期的数据记录');
                            (event.target as HTMLInputElement).value = '';
                            recordDate = undefined;
                            update();
                            return;
                        }
                        update();
                    }
                }
            }
        },
        createSubmitNodes(data){
            return [
                {
                    tagName:'div',
                    className:'form-submit-item',
                    innerText:'提交',
                    events:{
                        click(e:MouseEvent) {
                            const recordList = getRecordList();
                            recordList.push(data);
                            setRecordList(recordList);
                            alert('提交成功');
                            location.reload();
                        }
                    }
                }
            ]
        }
    })
}
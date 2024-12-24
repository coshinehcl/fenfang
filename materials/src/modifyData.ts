import { ActionHandler,DateFull,CreateElementConfig } from '@types'
import { createForm } from './createForm';
import { getRecordItem,getCurrentDate,getRecordList,getDayDistance, setRecordList } from '@utils'
export const modifyData:ActionHandler = (parentNode,params) => {
    createForm({
        type:'modifyData',
        params,
        parentNode:parentNode,
        getFormData(date){
            return getRecordItem('modifyData',date)
        },
        createDateNode(renderForm){
            const recordList = getRecordList();
            return  {
                tagName:'select',
                className:'form-date',
                attributes:{
                    placeholder:'请选择',
                    value:''
                },
                childs:[
                    {
                        tagName:'option',
                        attributes:{
                            value:'',
                        },
                        innerText:'请选择'
                    },
                    ...(recordList.reverse().map(recordItem => {
                        return {
                            tagName:'option',
                            attributes:{
                                value:recordItem.recordDate,
                            },
                            innerText:recordItem.recordDate
                        }
                    }) as Array<CreateElementConfig>)
                ],
                events:{
                    input(e:Event){
                        if(!e.target) return;
                        const recordDate = (e.target as HTMLInputElement).value as (DateFull | undefined);
                        renderForm(recordDate);
                    }
                }
            }
        },
        createSubmitNodes(data){
            return [
                {
                    tagName:'div',
                    className:'form-submit-item',
                    style:{
                        color:'red'
                    },
                    innerText:'移除',
                    events:{
                        click(){
                            const confirm = window.confirm('确定移除吗？');
                            if(!confirm) return;
                            const list = getRecordList();
                            const findIndex = list.findIndex(i => i.recordDate === data.recordDate);
                            if(findIndex !== -1) {
                                list.splice(findIndex,1);
                                setRecordList(list);
                                alert('移除成功');
                                location.reload();
                            } else {
                                alert(`移除失败:${findIndex}`);
                            }
                        }
                    }
                },
                {
                    tagName:'div',
                    className:'form-submit-item',
                    innerText:'修改',
                    events:{
                        click(){
                            const list = getRecordList();
                            const findIndex = list.findIndex(i => i.recordDate === data.recordDate);
                            if(findIndex !== -1) {
                                list.splice(findIndex,1,data);
                                setRecordList(list);
                                alert('修改成功');
                                location.reload();
                            } else {
                                alert(`修改失败:${findIndex}`);
                            }
                        }
                    } 
                }
            ]
        }
    })
}
import { CreateForm, DateFull } from '@types'
import { getRecordList,dateFullToNum,cloneData,createElement,removeChilds,createCustomElement } from '@utils'
import { recordItemBelongs } from '@config/recordList'
function getLastRecordItem(date:DateFull){
    const recordList = getRecordList();
    const currentDateNum = dateFullToNum(date);
    let lastRecordDataIndex = -1;
    const beforeRecordList =  recordList.filter(i => {
        const recordDataNum = dateFullToNum(i.recordDate);
        return recordDataNum < currentDateNum
    })
    if(beforeRecordList.length) {
        return beforeRecordList.slice(-1)[0]
    } else {
        return undefined
    }
}
export const createForm:CreateForm = (options)=> {
    const {parentNode,createDateNode,createSubmitNodes,getFormData,params} = options;
    const formWrapperNode = createElement({
        tagName:'div',
        className:'form-content-wrapper',
        childs:[
            {
                tagName:'div',
                className:'form-date-wrapper',
                returnNode(ele){
                    params.pageNavManager.addPageNav(ele,'选择日期')
                },
                childs:[
                    {
                        tagName:'div',
                        innerText:'选择日期',
                    },
                    createDateNode(renderForm)
                ]
            },
            {
                tagName:'div',
                className:'form-content'
            }
        ]
    },parentNode);
    const formContentNode = formWrapperNode.querySelector('.form-content');
    function renderForm(date?:DateFull) {
        if(!formContentNode) return;
        removeChilds(formContentNode);
        params.pageNavManager.updatePageNav();
        if(!date) return;
        const currentRecordItem = getFormData(date);
        const lastRecordItem = getLastRecordItem(date);
        recordItemBelongs.forEach((belong,belongIndex) => {
            if(belong.field === 'repo' && options.type === 'newData') {
                createElement({
                    tagName:'div',
                    innerText:`请确保其他数据填写完成再填写${belong.label}`,
                    style:{
                        margin:'10px 0',
                        textAlign:'center',
                    },
                    events:{
                        click(){
                            submitWrapperNode.scrollIntoView({
                                behavior:'smooth'
                            })
                        }
                    }
                },formContentNode)
            }
            createElement({
                tagName:'div',
                className:'form-belong',
                returnNode(ele){
                    params.pageNavManager.addPageNav(ele,belong.label)
                },
                attributes:{
                    'data-belong':belong.label
                },
                childs:[
                    {
                        tagName:'div',
                        className:'form-belong-title',
                        innerText:belong.label
                    },
                    {
                        tagName:'div',
                        className:'form-belong-wrapper',
                        childs:currentRecordItem[belong.field].map((i,index) => {
                            const lastMaterialItem = lastRecordItem ? lastRecordItem[belong.field].find(x => x.label === i.label) : undefined;
                            const myInputsNode = createCustomElement('my-inputs',{
                                data:i,
                                params:{
                                    belong:belong.field,
                                    belongText:belong.label,
                                    onlyDisplayLastSpecInput:belong.field === 'system',
                                    pageScrollToNextBelongSelf:() => {
                                        let nextBelongIndex = belongIndex + 1;
                                        if(belongIndex === recordItemBelongs.length -1) {
                                            nextBelongIndex = 0;
                                        }
                                        formContentNode.querySelectorAll('.form-belong')[nextBelongIndex].querySelectorAll('my-inputs')[index].scrollIntoView({
                                            behavior:'smooth'
                                        });
                                    },
                                    lastMaterialItem,
                                    currentRecordItem:currentRecordItem
                                }
                            })
                            return myInputsNode;
                        })
                    }
                ]
            },formContentNode)
        })
        const submitWrapperNode = createElement({
            tagName:'div',
            className:'form-submit-wrapper',
            returnNode(ele) {
                params.pageNavManager.addPageNav(ele,'提交')
            },
            childs:createSubmitNodes(currentRecordItem)
        },formContentNode)
    }
}
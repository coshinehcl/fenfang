import { materialsList } from './config.js';
import { createElement } from './createElement.js'
import { getCacheData,setCacheData } from './storage.js'
import { getDate } from './utils.js'
// 表单模块
const inputCommon = (formData,field,node,title,formDataChangeCb) => {
    const inputModule = createElement({
        tagName:'div',
        className:`form-block ${field}`,
        childs:[
            {
                tagName:'div',
                className:'form-block-title',
                innerText:title
            },
            {
                tagName:'div',
                className:'form-block-content',
            }
        ]
    },node)
    const inputBlockContent = inputModule.querySelector('.form-block-content');
    if(!formData[field] || !Array.isArray(formData[field])) {
        formData[field] = materialsList.map(i => ({
            label:i.label,
            numList:i.units.map(_i => ({
                num:undefined,
                unit:_i.label,
                spec:_i.spec
            })),
            unit:i.units[i.units.length - 1].label,
            total:0,
            totalText:'',
            totalTextFull:''
        }));
        formDataChangeCb();
    }
    formData[field].forEach((i,index) => {
        const itemData =  formData[field][index];
        createElement({
            tagName:'div',
            className:'form-block-content-item',
            childs:[
                {
                    tagName:'div',
                    className:'form-block-content-item-label',
                    innerText:i.label
                },
                {
                    tagName:'div',
                    className:'form-block-content-item-inputs',
                    style:{
                        marginTop:'6px',
                    },
                    childs:i.numList.map((inputNumItem,_index) => {
                        return {
                            tagName:'div',
                            className:'form-block-content-item-input-block',
                            childs:[
                                {
                                    tagName:'input',
                                    attributes:{
                                        type:"number",
                                        value:inputNumItem.num
                                    },
                                    events:{
                                        'input':(e,topNode)=> {
                                            inputNumItem.num = Number(e.target.value);
                                            const inputsResultNode = topNode.querySelector('.total .result');
                                            let total = 0;
                                            let totalTexts = [];
                                            itemData.numList.forEach((numListItem,numListIndex) => {
                                                let currentTotal = 0;
                                                if(numListItem.num) {
                                                    currentTotal = numListItem.num
                                                    const currentTotalTexts = [`${numListItem.num}${numListItem.unit}`];
                                                    for(let j = numListIndex;j < itemData.numList.length;j++) {
                                                        if(itemData.numList[j].spec) {
                                                            currentTotalTexts.push(`${itemData.numList[j].spec}${itemData.numList[j+1].unit}`);
                                                            currentTotal = currentTotal * (itemData.numList[j].spec || 1);
                                                        }                                                
                                                    }
                                                    totalTexts.push(currentTotalTexts.join('*'))
                                                }
                                                total += currentTotal;
                                            })
                                            itemData.total = total;
                                            itemData.totalText = totalTexts.join(' + ');
                                            if(itemData.totalText) {
                                                itemData.totalTextFull = `${itemData.totalText} = ${total}${itemData.unit}`
                                                inputsResultNode.innerText = itemData.totalTextFull;
                                            } else {
                                                inputsResultNode.innerText = ''
                                            }
                                            formDataChangeCb();
                                        }
                                    }
                                },
                                {
                                    tagName:'span',
                                    innerText:inputNumItem.unit,
                                    style:{
                                        color:'#999'
                                    }
                                }
                            ]
                        
                        }
                    })
                },
                {
                    tagName:'div',
                    className:'total',
                    childs:[
                        {
                            tagName:'div',
                            innerText:'共计',
                            style:{
                                color:"#999",
                                fontSize:'15px',
                                marginTop:'6px',
                            }
                        },
                        {
                            tagName:'div',
                            className:'result',
                            innerText:itemData.totalTextFull,
                            style:{
                                color:"#999",
                                fontSize:'14px'
                            }
                        }
                    ]
                }
            ]
        },inputBlockContent)
    })
}
const inputAction = (node)=> {
    // 1、采购数量
    // 2、当前仓库数量
    // 3、系统库存数量
    let recordDate = getDate(new Date()).full;
    let formData;
    function getFormData(){
        // 切换日期后，inputData的值会清空
        let _formData = getCacheData('inputData');
        if(!_formData) {
            const formDateList = getCacheData('formDateList') || [];
            _formData = formDateList.find(i => i.recordDate === recordDate) || {};
        }
        _formData.recordDate = recordDate;
        return _formData;
    }
    const formNode = createElement({
        tagName:'div',
        className:'form-wrapper',
        childs:[
            {
                tagName:'div',
                className:'form-date-wrapper',
                childs:[
                    {
                        tagName:'div',
                        childs:[
                            {
                                tagName:'label',
                                innerText:'日期：',
                            },
                            {
                                tagName:'input',
                                className:'form-date',
                                attributes:{
                                    type:'date',
                                    value:recordDate
                                },
                                events:{
                                    input(e){
                                        setCacheData('inputData');
                                        recordDate = e.target.value;
                                        // 重新渲染
                                        renderForm();
                                    }
                                }
                            }
                        ]
                    },
                    {
                        tagName:'div',
                        style:{
                            marginTop:'8px',
                            color:'#999',
                            fontSize: '14px'
                        },
                        innerText:'选择一个日期，如果该日期有数据，则是修改表单，如果没有数据，则是新增数据'
                    }
                ]
            },
            {
                tagName:'div',
                className:'form-content'
            },
            {
                tagName:'div',
                className:'form-submit',
                innerText:'提交',
                events:{
                    click(){
                        const formDateList = getCacheData('formDateList') || [];
                        const _formData = formDateList.find(i => i.recordDate === recordDate);
                        if(_formData) {
                            // 如果找到，则更新该数据
                            Object.keys(formData).forEach(key => {
                                _formData[key] = formData[key]
                            })
                        } else {
                            formDateList.unshift(formData);
                        }
                        // 更新缓存
                        setCacheData('inputData');
                        setCacheData('formDateList',formDateList);
                        alert('已提交')
                    }
                }
            }
        ]
    },node);
    function renderForm(){
        formData = getFormData();
        function formDataChangeCb(){
            setCacheData('inputData',formData)
        }
        const formContentNode = formNode.querySelector('.form-content');
        // 重新渲染表单
        while(formContentNode.firstChild) {
            formContentNode.removeChild(formContentNode.firstChild);
        }
        inputCommon(formData,'purchase',formContentNode,'采购数量',formDataChangeCb);
        inputCommon(formData,'repo',formContentNode,'当前仓库数量',formDataChangeCb);
        inputCommon(formData,'system',formContentNode,'系统库存数量',formDataChangeCb);
    }
    renderForm();
}
// 查看数据模块
const viewAction = (node) => {
    Chart.register(ChartDataLabels);
    const formDateList = getCacheData('formDateList') || [];
    if(formDateList.length) {
        // 排序
        formDateList.sort((l,r) => {
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
        function getDayDistance(day1,day2) {
            const leftDate = new Date(day1);
            const rightDate = new Date(day2);
            const millisecondsDiff = leftDate - rightDate;
            const daysDiff = Math.round(millisecondsDiff / (1000 * 60 * 60 * 24));
            return daysDiff;
        }
        // 生成日消耗/周消耗/出仓建议
        const viewData = {};
        materialsList.forEach(item => {
            if(!viewData[item.label]) {
                viewData[item.label] = [];
            }
        })
        function getBaseData(item,index,field){
            item[field].forEach(_item => {
                let _itemData = viewData[_item.label][index];
                if(!_itemData) {
                    _itemData = {};
                    viewData[_item.label].push(_itemData)
                }
                _itemData[field] = _item.total
            })
        }
        function setExtraData(label,index,data) {
            Object.keys(data).forEach(key => {
                viewData[label][index][key] = data[key]
            })
        }
        formDateList.forEach((item,index) => {
            ['purchase','repo','system'].forEach(key => {
                getBaseData(item,index,key)
            })
            if(index === 0) {
                item.system.forEach(_i => {
                    setExtraData(_i.label,index,{
                        dayUse:0,
                        weekUse:0,
                        outSuggest:0,
                        recordDate:item.recordDate
                    })
                })
                return;
            }
            const lastRecoedData = formDateList[index -1];
            const dayDistance = getDayDistance(item.recordDate,lastRecoedData.recordDate);
            item.system.forEach((_i) => {
                const viewItemData = viewData[_i.label][index];
                const lastViewItemData = viewData[_i.label][index - 1];
                const useNum = lastViewItemData.repo + viewItemData.purchase - viewItemData.repo;
                const dayUse = parseInt(useNum / dayDistance);
                let outSuggest = 0;
                if(viewItemData.system > viewItemData.repo) {
                    outSuggest = dayUse + parseInt((viewItemData.system - viewItemData.repo) / 30);
                }
                setExtraData(_i.label,index,{
                    dayUse: dayUse,
                    weekUse:dayUse * 7,
                    outSuggest,
                    recordDate:item.recordDate
                })
            })
        })
         // 创建图表
         materialsList.forEach(item => {
            const viewItemNode = createElement({
                tagName:'div',
                className:'view-item',
                childs:[
                    {
                        tagName:'div',
                        className:'view-item-title',
                        innerText:item.label
                    },
                    {
                        tagName:'canvas',
                        className:'view-item-canvas',
                        attributes:{
                            width:'200',
                            height:'200',
                        }
                    }
                ]
            },node);
            const viewLabelList = viewData[item.label];
            const fieldMap = {
                purchase:'购买',
                repo:'仓库',
                system:'系统',
                dayUse:'日耗',
                weekUse:'周耗',
                outSuggest:'出仓建议'
            }
            new Chart(viewItemNode.querySelector('canvas').getContext('2d'), {
                type:'line',
                data:{
                    labels:viewLabelList.map(i => i.recordDate),
                    datasets:['purchase','repo','system','dayUse','weekUse','outSuggest'].map(key => ({
                        label:fieldMap[key],
                        data:viewLabelList.map(i => i[key]),
                        hidden:!['outSuggest','dayUse'].includes(key),
                        datalabels: {
                            anchor: 'end',
                            align: 'end',
                            formatter: (value) => value // 显示数据值
                        }
                    }))
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        datalabels: {
                            color: '#36A2EB', // 数据标签颜色
                            font: {
                                weight: 'bold',
                                size: 12,
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            })
        })
        console.log(viewData)
    }
}
const fireAction = (node,type) => {
    const actionMap = {
        input:inputAction,
        view:viewAction,
    }
    actionMap[type](node)
}
window.fireAction = fireAction;
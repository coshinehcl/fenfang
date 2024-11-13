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
                                tagName:'div',
                                innerText:'选择日期：',
                            },
                            {
                                tagName:'select',
                                className:'form-date-select',
                                events:{
                                    input(e,topNode){
                                        setCacheData('inputData');
                                        recordDate = e.target.value;
                                        const recordDateNode = topNode.querySelector('.form-date-record-date');
                                        recordDateNode.innerText = `当前日期:${recordDate}`;
                                        // 重新渲染
                                        renderForm();
                                    }
                                },
                                childs:(getCacheData('formDateList') || []).map(_i => ({
                                    tagName:'option',
                                    attributes:{
                                        value:_i.recordDate,
                                    },
                                    innerText:_i.recordDate
                                }))
                            },
                            {
                                tagName:'input',
                                className:'form-date',
                                attributes:{
                                    type:'date',
                                    value:recordDate
                                },
                                events:{
                                    input(e,topNode){
                                        setCacheData('inputData');
                                        recordDate = e.target.value;
                                        const recordDateNode = topNode.querySelector('.form-date-record-date');
                                        recordDateNode.innerText = `当前日期:${recordDate}`;
                                        // 重新渲染
                                        renderForm();
                                    }
                                }
                            },
                        ]
                    },
                    {
                        tagName:'div',
                        className:'form-date-record-date',
                        innerText:`当前日期:${recordDate}`
                    },
                    {
                        tagName:'div',
                        style:{
                            marginTop:'8px',
                            color:'#999',
                            fontSize: '14px'
                        },
                        innerText:'从记录数据或日期列表中选择一个日期'
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
        const viewNode = createElement({
            tagName:'div',
            className:'view-wrapper',
            childs:[
                {
                    tagName:'div',
                    className:'view-select-wrapper',
                    childs:[
                        {
                            tagName:'label',
                            innerText:'选择图表类型',
                        },
                        {
                            tagName:'select',
                            className:'view-select',
                            events:{
                                change(e){
                                    renderView(e.target.value)
                                }
                            },
                            childs:[
                                {
                                    tagName:'option',
                                    attributes:{
                                        value:'all',
                                    },
                                    innerText:'全部'
                                },{
                                    tagName:'option',
                                    attributes:{
                                        value:'currentNum',
                                    },
                                    innerText:'当前数量'
                                },
                                {
                                    tagName:'option',
                                    attributes:{
                                        value:'out',
                                        selected:"selected"
                                    },
                                    innerText:'出库'
                                }
                            ]
                        }
                    ]
                },
                {
                    tagName:'div',
                    className:'view-content'
                }
            ]
        },node)
        function renderView(type){
            // 重新渲染图表
            const viewContentNode = viewNode.querySelector('.view-content');
            while(viewContentNode.firstChild) {
                viewContentNode.removeChild(viewContentNode.firstChild);
            }
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
                },viewContentNode);
                const viewLabelList = viewData[item.label];
                const fieldMap = {
                    purchase:'购买',
                    repo:'仓库',
                    system:'系统',
                    dayUse:'日耗',
                    weekUse:'周耗',
                    outSuggest:'出仓建议'
                }
                const typeMapDataSets = {
                    all:['purchase','repo','system','dayUse','weekUse','outSuggest'],
                    currentNum:['repo','system'],
                    out:['dayUse','outSuggest']
                }
                new Chart(viewItemNode.querySelector('canvas').getContext('2d'), {
                    type:'line',
                    data:{
                        labels:viewLabelList.map(i => i.recordDate),
                        datasets:typeMapDataSets[type].map(key => ({
                            label:fieldMap[key],
                            data:viewLabelList.map(i => i[key]),
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
                                color: '#315efb', // 数据标签颜色
                                font: {
                                    weight: 'bold',
                                    size: 14,
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
        }
        renderView('out');
    }
}
// 导入导出模块
const inOutAction = (node) => {
    const jsonId = '仓库物料'
    function downloadJSON() {
        // 将数据转换为JSON字符串
        const jsonString = JSON.stringify({
            jsonId, // 作为鉴别是不是本json
            list:getCacheData('formDateList') || []
        }, null, 2); // 格式化JSON字符串，增加可读性
        // 创建一个Blob对象
        const blob = new Blob([jsonString], { type: 'application/json' });
        // 创建一个链接元素
        const link = document.createElement('a');
        // 设置链接的href为Blob对象的URL
        link.href = URL.createObjectURL(blob);
        // 设置下载的文件名
        link.download = '仓库物料数据';
        // 触发点击事件以下载文件
        link.click();
        // 释放Blob URL
        URL.revokeObjectURL(link.href);
    }
    createElement({
        tagName:'div',
        className:'in-out-block',
        childs:[{
            tagName:'input',
            attributes:{
                type:'file',
                id:'inOutInput',
                accept:'.json'
            },
            style:{
                display:'none'
            },
            events:{
                input(event){
                    const file = event.target.files[0];
                    if (file.type !== 'application/json') {
                        alert('请选择 JSON 文件！')
                        event.target.value = ''; // 清空选择
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        let jsonData;
                        try {
                            jsonData = JSON.parse(e.target.result);
                        } catch (error) {
                            alert('文件内容不是有效的 JSON 格式！');
                            return;
                        }
                        if(jsonData && jsonData.jsonId === jsonId) {
                            // 进一步校验数据格式
                            setCacheData('formDateList',jsonData.list);
                            alert('导入成功')
                        } else {
                            alert('JSON 格式不对，请检查！');
                        }
                        event.target.value = ''; // 清空
                    };
                    reader.readAsText(file);
                }
            }
        },{
            tagName:'label',
            className:'in-out-btn',
            innerText:'导入',
            attributes:{
                for:'inOutInput'
            },
            events:{
                click(){

                }
            }
        },{
            tagName:'div',
            className:'in-out-btn',
            innerText:'导出',
            events:{
                click(){
                    downloadJSON();
                }
            }
        }]
    },node)
}
const fireAction = (node,type) => {
    const actionMap = {
        input:inputAction,
        view:viewAction,
        inOutData:inOutAction
    }
    actionMap[type](node)
}
window.fireAction = fireAction;
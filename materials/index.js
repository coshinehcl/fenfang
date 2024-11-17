import { materialsList } from './config.js';
import { createElement } from './createElement.js'
import { getCacheData,setCacheData } from './storage.js'
import { getDate } from './utils.js'
import defaultData from './defaultFormDataList.js'
function init(){
    const formDateList = getCacheData('formDateList');
    if(!formDateList) {
        setCacheData('formDateList',defaultData)
    }
}
init();
const recordTypes = [
    {
        label:'系统数量',
        field:'system',
        config:{
            hiddenBeforeInputs:true
        }
    },
    {
        label:'购买数量',
        field:'purchase',
        config:{}
    },
    {
        label:'库存数量',
        field:'repo',
        config:{}
    },
]
// 表单和视图数据，以materialsList数据为准(可能会增删一些物料)
function initRecordTypeItem(field,initList = []){
    return materialsList.map(i => {
        const initData = initList.find(_i => _i.label === i.label) || {};
        return {
            label:i.label,
            numList:(initData.numList || i.specs).map(_i => ({
                num:_i.num,
                unit:_i.unit,
                spec:_i.spec
            })),
            unit:i.specs[i.specs.length - 1].unit,
            total:initData.total || 0,
            totalText:initData.totalText || '',
            totalTextFull:initData.totalTextFull || ''
        }
    });
}
function updateFormDateList(){
    const formDateList = getCacheData('formDateList') || [];
    if(formDateList.length) {
        formDateList.forEach(recordItem => {
            recordTypes.forEach(recordTypeItem => {
                const copyList = JSON.parse(JSON.stringify(recordItem[recordTypeItem.field] || '[]'));
                recordItem[recordTypeItem.field] = initRecordTypeItem(recordTypeItem.field,copyList);
            })
        })
        setCacheData('formDateList',formDateList);
    }
}
// 表单：新增/修改/移除 模块
const createFormBlockNode = (formData,field,config) => {
    const { node,title,setFormCache,hiddenBeforeInputs } = config;
    const formBlockNode = createElement({
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
    const formBlockContentNode = formBlockNode.querySelector('.form-block-content');
    // 列表数据以materialsList 为准
    if(!formData[field] || !Array.isArray(formData[field])) {
        formData[field] = [];
    }
    const copyList = JSON.parse(JSON.stringify(formData[field]));
    formData[field] = initRecordTypeItem(field,copyList);
    setFormCache(formData);
    formData[field].forEach((i,index) => {
        const itemData = formData[field][index];
        createElement({
            tagName:'div',
            className:'form-block-content-item item',
            attributes:{
                'data-belong':title
            },
            childs:[
                {
                    tagName:'div',
                    className:'form-block-content-item-label',
                    innerText:i.label,
                    attributes:{
                        'data-label':i.label,
                    },
                    events:{
                        click(e){
                            const sameTypesNode = node.querySelectorAll(`.form-block-content-item-label[data-label="${i.label}"]`);
                            if(sameTypesNode) {
                                const list = Array.from(sameTypesNode);
                                const index = list.findIndex(i => i === e.target);
                                console.log(index);
                                let targetNode;
                                if(index < list.length -1) {
                                    targetNode = list[index + 1];
                                } else {
                                    targetNode = list[0]
                                }
                                targetNode.parentNode.scrollIntoView();
                            }
                        }
                    }
                },
                {
                    tagName:'div',
                    className:'form-block-content-item-inputs',
                    style:{
                        marginTop:'6px',
                    },
                    childs:i.numList.map((inputNumItem,_index) => {
                        if(hiddenBeforeInputs && _index !== i.numList.length -1) {
                            return;
                        }
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
                                            setFormCache(formData);
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
                    }).filter(i => Boolean(i))
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
        },formBlockContentNode)
    })
}
const formCommon = (node,config) => {
    const { formType,initCacheData,createDateNode,createSubmitNodes } = config;
    const formCacheKey = `${formType}Cache`;
    function setFormCache(data){
        setCacheData(formCacheKey,data)
    }
    function getFormCache(){
        return getCacheData(formCacheKey);
    }
    if(initCacheData) {
        setFormCache(initCacheData)
    }
    const formNode = createElement({
        tagName:'div',
        className:'form-wrapper',
        childs:[
            {
                tagName:'div',
                className:'form-date-wrapper item',
                attributes:{
                    'data-belong':'选择日期'
                },
                childs:[
                    {
                        tagName:'div',
                        innerText:'选择日期：',
                    },
                    createDateNode(setFormCache,getFormCache,renderForm)
                ]
            },
            {
                tagName:'div',
                className:'form-content'
            },
        ]
    },node);
    const formContentNode = formNode.querySelector('.form-content');
    function renderForm(){
        const formData = getCacheData(formCacheKey) || {};
        // 重新渲染表单
        while(formContentNode.firstChild) {
            formContentNode.removeChild(formContentNode.firstChild);
        }
        if(!formData.recordDate) return;
        recordTypes.forEach(recordTypeItem => {
            createFormBlockNode(formData,recordTypeItem.field,{
                node:formContentNode,
                title:recordTypeItem.label,
                hiddenBeforeInputs:recordTypeItem.config.hiddenBeforeInputs,
                setFormCache
            });
        })
        createElement({
            tagName:'div',
            className:'form-submit',
            childs:[
                ...createSubmitNodes(setFormCache,getFormCache)
            ]
        },formContentNode);
    };
    if((getFormCache() || {}).recordDate) {
        renderForm();
    }
}
const newDataAction = (node)=> {
    formCommon(node,{
        formType:'newData',
        createDateNode(setFormCache,getFormCache,renderForm){
            const { recordDate } = getFormCache() || {};
            return {
                tagName:'input',
                className:'form-date',
                attributes:{
                    type:'date',
                    value:recordDate,
                    max:getDate(new Date()).full
                },
                events:{
                    input(e){
                        const formDateList = getCacheData('formDateList') || [];
                        const recordDate = e.target.value;
                        if(!recordDate) {
                            setFormCache();
                            renderForm();
                            e.target.value = '';
                            return;
                        }
                        const findItem = formDateList.find(i => i.recordDate === recordDate);
                        if(findItem) {
                            setFormCache();
                            renderForm();
                            e.target.value = '';
                            alert('当前日期已有记录，不允许选择该日期')
                            return;
                        }
                        setFormCache({
                            recordDate
                        });
                        // 重新渲染
                        renderForm();
                    }
                }
            }
        },
        createSubmitNodes(setFormCache,getFormCache){
            const formCache = getFormCache();
            const regainInputBtn = formCache && formCache.recordDate ? [{
                tagName:'div',
                innerText:'恢复上次输入',
                className:'form-submit-btn',
                events:{
                    click(){

                    }
                }
            }] : [];
            return [
                ...regainInputBtn,
                {
                tagName:'div',
                innerText:'提交',
                className:'form-submit-btn',
                events:{
                    click(){
                        const formData = getFormCache();
                        const formDateList = getCacheData('formDateList') || [];
                        const findItem =  formDateList.find(i => i.recordDate === formData.recordDate);
                        if(findItem) {
                            alert('缓存中已有改日期数据，请到[修改数据]中修改');
                            return;
                        }
                        formDateList.push(formData);
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
                        // 清除缓存
                        setFormCache();
                        // 更新物料列表数据到缓存中
                        setCacheData('formDateList',formDateList);
                        alert('已提交')
                        location.reload();
                    }
                }
            }]
        }
    })
}
const modifyDataAction = (node)=> {
    updateFormDateList();
    formCommon(node,{
        formType:'modifyData',
        initCacheData:{},
        createDateNode(setFormCache,getFormCache,renderForm) {
            const formDateList =  getCacheData('formDateList') || [];
            const optionsList = formDateList.map(_i => ({
                tagName:'option',
                attributes:{
                    value:_i.recordDate,
                },
                innerText:_i.recordDate,

            }))
            optionsList.reverse(); // 新的日期排前面
            optionsList.unshift(({
                tagName:'option',
                attributes:{
                    value:'',
                },
                innerText:'请选择'
            }))
            return {
                tagName:'select',
                className:'form-date',
                attributes:{
                    placeholder:'请选择',
                    value:''
                },
                events:{
                    input(e){
                        const recordDate = e.target.value
                        if(!recordDate) {
                            setFormCache();
                        } else {
                            const findItem =  formDateList.find(i => i.recordDate ===recordDate);
                            if(!findItem) {
                                setFormCache();
                                alert('当前日期的数据不存在')
                            } else {
                                setFormCache({
                                    recordDate,
                                    ...findItem
                                });
                            }
                        }
                        // 重新渲染
                        renderForm();
                    }
                },
                childs:optionsList
            }
        },
        createSubmitNodes(setFormCache,getFormCache){
            return [{
                tagName:'div',
                innerText:'删除',
                className:'form-submit-btn',
                style:{
                    color:'red'
                },
                events:{
                    click(){
                        const confirm = window.confirm('确认删除吗')
                        if(confirm) {
                            const formData = getFormCache();
                            const formDateList = getCacheData('formDateList') || [];
                            setCacheData('formDateList',formDateList.filter(i => {
                                return i.recordDate !== formData.recordDate
                            }));
                            // 清除缓存
                            setFormCache();
                            // 刷新页面
                            location.reload();
                        }
                    }
                }
            },{
                tagName:'div',
                innerText:'提交',
                className:'form-submit-btn',
                events:{
                    click(){
                        const formData = getFormCache();
                        const formDateList = getCacheData('formDateList') || [];
                        const findItem =  formDateList.find(i => i.recordDate === formData.recordDate);
                        if(!findItem) {
                            alert('缓存中并没有改日期的数据，请到新增数据中提交');
                            return;
                        }
                        Object.keys(formData).forEach(key => {
                            findItem[key] = formData[key];
                        })
                        // 清除缓存
                        setFormCache();
                        // 更新物料列表数据到缓存中
                        setCacheData('formDateList',formDateList);
                        alert('已提交')
                        location.reload();
                    }
                }
            }]
        }
    })
}
// 表单：查看模块
const viewDataAction = (node) => {
    function waitChartLoad(){
        return new Promise(resolve => {
            const timer = setInterval(()=> {
                clearInterval(timer);
                resolve();
            },100)
        })
    }
    waitChartLoad().then(()=> {
        if(!Chart.registry.plugins.datalabels){
            Chart.register(ChartDataLabels);
        }
        updateFormDateList();
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
            function setBaseData(item,index,field){
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
                recordTypes.forEach(i => {
                    setBaseData(item,index,i.field)
                })
                if(index === 0) {
                    materialsList.forEach(_i => {
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
                materialsList.forEach((_i) => {
                    const viewItemData = viewData[_i.label][index];
                    const lastViewItemData = viewData[_i.label][index - 1];
                    const useNum = lastViewItemData.repo + viewItemData.purchase - viewItemData.repo;
                    const dayUse = parseInt(useNum / dayDistance);
                    let outSuggest = 0;
                    let outSuggestText = ''
                    const averageMoreOut = parseInt((viewItemData.system - viewItemData.repo) / 30);
                    if(viewItemData.system > viewItemData.repo) {
                        if(averageMoreOut > dayUse) {
                            outSuggest = dayUse * 2;
                            outSuggestText = `系统(${viewItemData.system})远大于仓库(${viewItemData.repo}):日耗(${dayUse}) * 2`
                        } else {
                            outSuggest = dayUse + averageMoreOut;
                            outSuggestText = `系统(${viewItemData.system})大于仓库(${viewItemData.repo}):日耗(${dayUse}) + 多出(${averageMoreOut})`
                        }
                    } else if(viewItemData.system < viewItemData.repo) {
                        if(averageMoreOut + dayUse < 0) {
                            outSuggest = 0;
                            outSuggestText = `系统(${viewItemData.system})远少于仓库(${viewItemData.repo}):建议不出`
                        } else {
                            outSuggest = dayUse + averageMoreOut;
                            outSuggestText = `系统(${viewItemData.system})少于仓库(${viewItemData.repo}):日耗${dayUse} - 少出(${Math.abs(averageMoreOut)})`
                        }
                    } else {
                        outSuggest = dayUse;
                        outSuggestText = `正常出库:日耗(${dayUse})`
                    }
                    setExtraData(_i.label,index,{
                        dayUse: dayUse,
                        weekUse:dayUse * 7,
                        outSuggest,
                        outSuggestText,
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
                                            value:'useNum',
                                        },
                                        innerText:'消耗量'
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
                    const outSuggestNodeConfig =  formDateList.length > 1 && type === 'out' ? [{
                        tagName:'div',
                        className:'view-item-out-suggest',
                        childs:viewData[item.label].toReversed().map((i,_index) => {
                            if(_index === viewData[item.label].length -1) return;
                            if(_index > 2) return; // 只显示三个，避免显示太多
                            return {
                                tagName:'div',
                                className:'view-item-out-suggest-item',
                                childs:[
                                    {
                                        tagName:'div',
                                        innerText:i.recordDate,
                                    },
                                    {
                                        tagName:'span',
                                        innerText:i.outSuggestText,
                                        style:{
                                            color:'#999'
                                        }
                                    },{
                                        tagName:'span',
                                        style:{
                                            color:'red',
                                            fontWeight:'bold',
                                            fontSize:'14px'
                                        },
                                        innerText:` = ${i.outSuggest}`
                                    }
                                ]
                            }
                        }).filter(Boolean)
                    }] : [];
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
                                tagName:'div',
                                className:'canvas-wrapper',
                                style:{
                                    width:'100vw',
                                    height:'80vw',
                                },
                                childs:[{
                                    tagName:'canvas',
                                    className:'view-item-canvas',
                                    style:{
                                        width:'100%',
                                        height:'100%'
                                    }
                                }]
                            },
                            {
                                tagName:'div',
                                className:'view-item-specs',
                                innerText:item.specs.map((i,index) => {
                                    if(i.spec) {
                                        if(index === 0) {
                                            return `1${i.unit}*${i.spec}${item.specs[index + 1].unit}` 
                                        } else {
                                            return `${i.spec}${item.specs[index + 1].unit}`
                                        } 
                                    } else {
                                        return ''
                                    }
                                }).filter(Boolean).join('*')
                            },
                            ...outSuggestNodeConfig
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
                        currentNum:['repo','system','purchase'],
                        useNum:['dayUse','weekUse'],
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
                                    formatter: (value) => {
                                        if(value > 0) {
                                            const specs = item.specs || [];
                                            const valueFormatList = [];
                                            specs.toReversed().forEach((_i,_index) => {
                                                if(_i.spec) {
                                                    value = value / _i.spec;
                                                }
                                                if(value < 0.1) return; // 数值太小就不显示了
                                                let text = `${Math.round(value * 100) / 100}${_i.unit}`;
                                                if(_index !== 0) {
                                                    text = `(${text})`
                                                }
                                                valueFormatList.push(text)
                                            })
                                            return valueFormatList.join('')
                                        } else {
                                            return value;
                                        }
                                    }
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
            }
            renderView('out');
        } else {
            createElement({
                tagName:'div',
                innerText:'无数据信息，先增加数据',
                style:{
                    lineHeight:'100px',
                    textAlign:'center',
                    fontSize:'16px',
                    color:"#666"
                }
            },node);
        }  
    })
}
// 表单：导入导出模块
const inOutDataAction = (node) => {
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

// 触发对应模块逻辑
const fireAction = (type,node) => {
    const actionMap = {
        newData:newDataAction,
        modifyData:modifyDataAction,
        viewData:viewDataAction,
        inOutData:inOutDataAction
    }
    actionMap[type](node);
}
window.fireAction = fireAction;
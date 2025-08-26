import { ComponentExport,ComponentConfigMap } from '@types'
import { createElement, createComponent ,oneByone,addScriptToGlobal, appendChildElements,getMaterialList,
    getChartData, GetPromiseAndParams, cloneData, removeChilds,
     showMessage, showDialog, updatePage,getRecordListBase,
     createUpdateElement,
     sleep,
     globalRouterManager} from '@utils'
import { chartDataTypes, recordBelongList } from '@config'

type UpdateStatusFun = ComponentConfigMap['my-charts']['exposeMethods']['updateStatus']
export const myCharts:ComponentExport<'my-charts'> = {
    componentName:'my-charts',
    content() {
        return {
            onMounted(shadowRoot, options, status) {
                const loadScriptPromise = oneByone([
                    'https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js',
                    'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0'
                ],addScriptToGlobal);
                const updateStatus:UpdateStatusFun = async (_status) => {
                    const recordBaseList = await getRecordListBase();
                    if(!recordBaseList.length) {
                        return Promise.reject(()=> {
                            showDialog({
                                title:'当前无数据',
                                content:'跳转到新增？',
                                footer:{
                                    confirm:'确认',
                                    cancel:'取消'
                                }
                            },true).then(res => {
                                globalRouterManager.pageForward({
                                    pageName:'新增',
                                    pageStatus:{
                                        date:''
                                    }
                                })
                            })
                        })
                    }
                    const wrapperNode = shadowRoot.querySelector('.wrapper');
                    if(wrapperNode) {
                        wrapperNode.remove();
                    }
                    createElement({
                        tagName:'div',
                        className:'wrapper',
                        childs:[
                            createElement({
                                tagName:'div',
                                className:'head-wrapper'
                            }),
                            createElement({
                                tagName:'div',
                                className:'body-wrapper'
                            })
                        ]
                    },shadowRoot);
                    function createHeadWrapper(resolve:Function){
                        const headWrapper = shadowRoot.querySelector('.head-wrapper')! as HTMLElement;
                        if(!headWrapper) return resolve();
                        removeChilds(headWrapper);
                        const materialList = getMaterialList();
                        const _innerStatus = cloneData(_status);
                        appendChildElements(headWrapper,[
                            createElement({
                                tagName:'div',
                                className:'head-label',
                                innerText:'请选择'
                            }),
                            createElement({
                                tagName:'select',
                                className:'chart-type-select',
                                attributes:{
                                    placeholder:'请选择图表类型'
                                },
                                hooks:{
                                    onCreated(ele) {
                                        ele.value = _status.type || ''
                                    },
                                },
                                events:{
                                    'change':(e)=> {
                                        delete _innerStatus.activeLabel;
                                        _innerStatus.type = e.currentTarget.value;
                                        globalRouterManager.pageForward({
                                            pageName:options.label,
                                            pageStatus:_innerStatus,
                                            silentByForward:true
                                        })
                                        createBodyWrapper(_innerStatus)
                                    }
                                },
                                childs:()=> {
                                    return [
                                        createElement({
                                            tagName:'option',
                                            attributes:{
                                                value:'',
                                            },
                                            innerText:'请选择图表类型'
                                        }),
                                        ...chartDataTypes.map(chartTypeItem => {
                                            return createElement({
                                                tagName:'option',
                                                attributes:{
                                                    value:chartTypeItem.label,
                                                },
                                                innerText:chartTypeItem.label
                                            })
                                        })
                                    ]
                                }
                            }),
                            createElement({
                                tagName:'select',
                                className:'chart-label-select',
                                attributes:{
                                    placeholder:'请选择物料',
                                },
                                hooks:{
                                    onCreated(ele) {
                                        ele.value = _status.label || ''
                                    },
                                },
                                events:{
                                    'change':(e)=> {
                                        delete _innerStatus.activeLabel;
                                        _innerStatus.label = e.currentTarget.value;
                                        if(!_innerStatus.type) {
                                            showMessage({
                                                text:'先选择图表类型',
                                                type:'warn',
                                                duration:2000
                                            })
                                            return;
                                        }
                                        globalRouterManager.pageForward({
                                            pageName:options.label,
                                            pageStatus:_innerStatus,
                                            silentByForward:true
                                        })
                                        createBodyWrapper(_innerStatus);
                                    }
                                },
                                childs:()=> {
                                    return [
                                        createElement({
                                            tagName:'option',
                                            attributes:{
                                                value:'',
                                            },
                                            innerText:'请选择物料'
                                        }),
                                        ...materialList.map(materialItem => {
                                            return createElement({
                                                tagName:'option',
                                                attributes:{
                                                    value:materialItem.label,
                                                },
                                                innerText:materialItem.label
                                            })
                                        })
                                    ]
                                }
                            }),
                        ])
                        resolve(createBodyWrapper(_innerStatus));
                    }
                    async function createBodyWrapper(__status:typeof _status){
                        const bodyWrapper = shadowRoot.querySelector('.body-wrapper')! as HTMLElement;
                        if(!bodyWrapper) return;
                        removeChilds(bodyWrapper);
                        if(!__status.type) return;
                        await loadScriptPromise;
                        const chartDataList = await getChartData(__status.label as any);
                        // 拿到数据后，稍微再等等chartData的数据初始化完
                        await sleep(100);
                        appendChildElements(bodyWrapper,chartDataList.map(chartDataItem => {
                            return createElement({
                                tagName:'div',
                                className:'material-wrapper',
                                childs:[
                                    // 标题
                                    createElement({
                                        tagName:'div',
                                        className:'material-label-wrapper',
                                        childs:[
                                            createElement({
                                                tagName:'div',
                                                className:'material-label',
                                                innerText:chartDataItem[0].label
                                            })
                                        ]
                                    }),
                                    // 画布
                                    createElement({
                                        tagName:'div',
                                        className:'material-canvas-wrapper',
                                        childs:()=>{
                                            let currentChart:Chart
                                            const chartDataTypesItem = chartDataTypes.find(i => i.label === __status.type);
                                            if(!chartDataTypesItem) return [];
                                            return [
                                                createUpdateElement(()=> ({
                                                    tagName:'canvas',
                                                    style:{
                                                        width:'100%',
                                                        height:'380px',
                                                    },
                                                    hooks:{
                                                        onMounted(ele) {
                                                            const canvasRenderingContext2D = ele.getContext('2d');
                                                            if(!canvasRenderingContext2D) return;
                                                            currentChart = new Chart(canvasRenderingContext2D,{
                                                                type:'line',
                                                                data:{
                                                                    labels:chartDataItem.map(_i => _i.recordDate),
                                                                    datasets:chartDataTypesItem.fields.map(i=> {
                                                                        return {
                                                                            label:i.label,
                                                                            data:chartDataItem.map(_i => i.getValue(_i))
                                                                        }
                                                                    })
                                                                },
                                                                options:{
                                                                    responsive: true,
                                                                    maintainAspectRatio: false, // 否则高度不生效
                                                                    plugins:{
                                                                        datalabels: {
                                                                            clamp: true,
                                                                            verflow: false,
                                                                            align:'start',
                                                                            display: 'auto',
                                                                            offset:function(context:any){ // align不能为center。否则此属性不生效
                                                                                // 拿到y最大刻度
                                                                                // console.log(context);
                                                                                const yMax = context.chart.scales.y.max;
                                                                                const canvasHeight = context.chart.height;
                                                                                const currentDataIndex:number = context.dataIndex;
                                                                                const currentDatasetIndex:number = context.datasetIndex;
                                                                                const currentValue = context.dataset.data[currentDataIndex];
                                                                                if(typeof currentValue !== 'number') return;
                                                                                const othersValue:any[]= [];
                                                                                // 获取当前块的高度信息
                                                                                function getBlockHeight(){
                                                                                    const currentMeta = context.chart.getDatasetMeta(currentDatasetIndex);
                                                                                    debugger
                                                                                    const pointElements = currentMeta.data;
                                                                                    const currentPoint = pointElements[currentDataIndex];
                                                                                    // 这个时候还没完成布局，还没有以下信息
                                                                                    const currentHeight = 20;//currentPoint?.$datalabels[0]?.$layout?._box?._rect?.h;
                                                                                    return currentHeight || 0
                                                                                }
                                                                                context.chart.data.datasets.forEach((i:any,index:number) => {
                                                                                    const meta = context.chart.getDatasetMeta(index);
                                                                                    if(!meta.hidden && index !== currentDatasetIndex) {
                                                                                        othersValue.push({
                                                                                            datasetIndex:index,
                                                                                            value:i.data[currentDataIndex]
                                                                                        })
                                                                                    }
                                                                                })
                                                                                // 如果上下有max/10的数据，则高的上移，低的下移，如果一样，则dataIndex高的上移
                                                                                // 如果有多个相邻数据，显示还是会有点问题
                                                                                let offset:number = 0;
                                                                                othersValue.forEach((i:any) => {
                                                                                    if(typeof i.value !== 'number') return;
                                                                                    if(Math.abs(i.value - currentValue) < yMax/10) { // 相临
                                                                                        if(currentValue > i.value) {
                                                                                            offset = -canvasHeight/30;
                                                                                        } else if(currentValue < i.value) {
                                                                                            offset = canvasHeight/30;
                                                                                        } else {
                                                                                            if(currentDatasetIndex < i.datasetIndex) {
                                                                                                offset = -canvasHeight/30;
                                                                                            } else {
                                                                                                offset = canvasHeight/30;
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                })
                                                                                // 默认是start布局，回到中间布局
                                                                                return offset - getBlockHeight()/2;
                                                                            },
                                                                            color: '#fff', // 文字颜色，白色
                                                                            backgroundColor: function(context:any) {
                                                                                return context.dataset.backgroundColor; // 使用数据集的颜色作为背景色
                                                                            },
                                                                            font: {
                                                                                size: 12,
                                                                            }
                                                                        }
                                                                    }
                                                                },
                                                                plugins: [ChartDataLabels],
                                                            })
                                                            if(__status.activeLabel === chartDataItem[0].label) {
                                                                ele.scrollIntoView({
                                                                    block:'center'
                                                                })
                                                            }
                                                        },
                                                    },
                                                    events:{
                                                        "click"(e) {
                                                            // 拿到点击点的视口位置
                                                            const {clientX,clientY} = e;
                                                            // 拿到canvas的视口位置
                                                            const canvasNode = e.currentTarget;
                                                            const rect = canvasNode.getBoundingClientRect();
                                                            // 拿到点击位置相当于canvas的位置
                                                            const relativeCanvasX = clientX - rect.left;
                                                            const relativeCanvasY = clientY - rect.top;
                                                            // 记录当前状态
                                                            function saveStatusAndNavigate(fun:Function){
                                                                globalRouterManager.pageForward({
                                                                    pageName:options.label,
                                                                    pageStatus:{
                                                                        ...__status,
                                                                        activeLabel:chartDataItem[0].label
                                                                    },
                                                                    silentByForward:true
                                                                })
                                                                fun();
                                                            }
                                                            // 通过Chart实例，解析出对应元素
                                                            if(!currentChart) return;
                                                            // 允许x轴的label点击
                                                            function allowXLabelClick(){
                                                                const xHeight = (currentChart as any).scales.x.height;
                                                                if(relativeCanvasY > (rect.height - xHeight)) {
                                                                    // 点击在x轴坐标区域
                                                                    // 拿到附近的x坐标对应的索引
                                                                    const xIndex =  (currentChart as any).scales.x.getValueForPixel(relativeCanvasX);
                                                                    // 通过索引拿到label值
                                                                    const xLabel = (currentChart as any).scales.x.getLabelForValue(xIndex);
                                                                    showDialog({
                                                                        title:`选中日期${xLabel},选择跳转目标`,
                                                                        content:{
                                                                            default:chartDataTypesItem?.navigateBelongField || '',
                                                                            validator(v) {
                                                                                if(!v.trim()) {
                                                                                    return '不能为空'
                                                                                }
                                                                                return '';
                                                                            },
                                                                            list:recordBelongList.map(i => ({
                                                                                label:i.label,
                                                                                value:i.belong
                                                                            }))
                                                                        },
                                                                        footer:{
                                                                            cancel:'取消',
                                                                            confirm:'确认'
                                                                        }
                                                                    },true).then(res => {
                                                                        saveStatusAndNavigate(()=>globalRouterManager.pageForward({
                                                                            pageName:'修改',
                                                                            pageStatus:{
                                                                                date:xLabel,
                                                                                material:{
                                                                                    belongField:res as any,
                                                                                    label:chartDataItem[0].label,
                                                                                }
                                                                            }
                                                                        }))
                                                                    })
                                                                }
                                                            }
                                                            function allowLegendClick(){
                                                                const legend =  (currentChart as any).legend;
                                                                const legendHitBoxes = legend?.legendHitBoxes;
                                                                if(legendHitBoxes && Array.isArray(legendHitBoxes)) {
                                                                    legendHitBoxes.some((legendAreaItem,legendIndex) => {
                                                                        if(legendAreaItem) {
                                                                            const {left,top,width,height} = legendAreaItem;
                                                                            if(relativeCanvasX > left && relativeCanvasX < left + width && relativeCanvasY > top && relativeCanvasY < top + height) {
                                                                                // cb(datasetIndex,pointIndex);
                                                                                const datasetItemMeta = (currentChart as any).getDatasetMeta(legendIndex);
                                                                                datasetItemMeta.hidden = !datasetItemMeta.hidden;
                                                                                (currentChart as any).update();
                                                                                return true;
                                                                            }
                                                                        }
                                                                    })
                                                                }
                                                            }
                                                            // 允许datalabels生成的area块，点击
                                                            function allowDatalabelsAreaClick(cb:(_datasetIndex:number,_pointIndex:number)=> void){
                                                                // 拿到【系统数量/总仓数量 列表】
                                                                const datasets = (currentChart as any).data.datasets;
                                                                datasets.forEach((_:any,datasetIndex:number) => {
                                                                    const datasetItemMeta = (currentChart as any).getDatasetMeta(datasetIndex);
                                                                    if(datasetItemMeta) {
                                                                        // 拿到系统数量的折线图生成的点
                                                                        const pointElements = datasetItemMeta.data;
                                                                        pointElements.forEach((pointItem:any,pointIndex:number) => {
                                                                            // 拿到这个点对应的datalabels块，有可能有多个
                                                                            if(pointItem.$datalabels) {
                                                                                pointItem.$datalabels.forEach((dataLabelItem:any) => {
                                                                                    if(dataLabelItem.$layout) {
                                                                                        const area = dataLabelItem.$layout?._box?._rect;
                                                                                        if(area) {
                                                                                            // 判断是否在这个范围
                                                                                            // x,y,w,h
                                                                                            // (x,y)是左上角，w/h是块的宽高
                                                                                            const {x,y,w,h} = area as {[key:string]:number};
                                                                                            if(relativeCanvasX > x && relativeCanvasX < x + w && relativeCanvasY > y && relativeCanvasY < y + h) {
                                                                                                cb(datasetIndex,pointIndex);
                                                                                                throw new Error('跳出')
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                })
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                                // 如果上面没找到，才会执行到这里。也就是保证了优先级
                                                                allowXLabelClick();
                                                                allowLegendClick();
                                                            }
                                                            try {
                                                                allowDatalabelsAreaClick((datasetIndex,pointIndex)=> {
                                                                    // 拿到对应的x轴label
                                                                   const xLabel = (currentChart as any).scales.x.getLabelForValue(pointIndex);
                                                                   // 拿到对应field
                                                                   const fieldItem = chartDataTypesItem.fields[datasetIndex];
                                                                   if(fieldItem.navigateTo) {
                                                                        const targetPage = fieldItem.navigateTo!(chartDataItem[0])
                                                                        saveStatusAndNavigate(()=> globalRouterManager.pageForward({
                                                                            pageName:targetPage.label,
                                                                            pageStatus:targetPage.status
                                                                        }))
                                                                   } else {
                                                                    saveStatusAndNavigate(
                                                                        ()=>globalRouterManager.pageForward({
                                                                            pageName:'修改',
                                                                            pageStatus:{
                                                                                date:xLabel,
                                                                                material:{
                                                                                    belongField:fieldItem.navigateBelongField,
                                                                                    label:chartDataItem[0].label
                                                                                }
                                                                            }
                                                                        })
                                                                    )
                                                                   }
                                                                })
                                                            } catch(err){}
                                                        },
                                                    },
                                                    getUpdateFun(updateFun, ele) {
                                                        chartDataList.forEach(chartItem => {
                                                            chartItem.forEach(chartRecordItem => {
                                                                chartRecordItem.onChartDataChange.push(updateFun);
                                                            })
                                                        })
                                                    },
                                                }))
                                            ]
                                        }
                                    }),
                                    // footer
                                    createElement({
                                        tagName:'div',
                                        className:'footer',
                                        childs:()=> {
                                            const chartDataTypesItem = chartDataTypes.find(i => i.label === __status.type)!;
                                            return chartDataTypesItem.footer(chartDataItem.slice(-3).reverse())
                                        }
                                    })
                                ]
                            })
                        }))
                    }
                    const [headPromise,resolve] = GetPromiseAndParams<void>();
                    createHeadWrapper(resolve);
                    return headPromise.then(()=> {
                        return true
                    })
                }
                updateStatus(status).then(() => {
                    options.returnUpdateStatusType(true)
                }).catch((res)=> {
                    options.returnUpdateStatusType(false);
                    if(res && typeof res === 'function') {
                        res();
                    }
                })
                return {
                    updateStatus
                }
            },
            onDestroy(shadowRoot) {
              
            },
        }
    }
}
import { CustomElementExport,CreateElementConfig,MaterialsItem} from '@types'
import { addScriptToGlobal,createChildsElement,createElement,getChartDataItem, oneByone, removeChilds, showMessage } from '@utils'
import { chartShowTypes,recordRecordBelong } from '@config'
import { getMaterialList,updateHtmlAction,saveHtmlActionStatus } from '@utils'
export const myCharts:CustomElementExport<'my-charts'> = {
    tagName:'my-charts',
    createNode(shadowRoot, options, stylePromise) {
        const { status } = options;
        const loadScriptPromise =oneByone(['https://cdn.jsdelivr.net/npm/chart.js','https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels'],addScriptToGlobal);
        let currentSelectChartType:typeof chartShowTypes[number]['label'] | undefined;
        let currentSelectMaterialItemLabel:MaterialsItem['label'] | undefined;
        // 需要等待多个select都执行完之后，才能执行updateChartContent，避免多次执行
        let currentHeadSelectNum = 2;
        let selectAttachNum = 0;
        function createSelect():Array<CreateElementConfig>{
            return [
                {
                    tagName:'span',
                    className:'select-label',
                    innerText: '请选择'
                },
                {
                    tagName:'select',
                    className:'chart-select',
                    attributes:{
                        placeholder:'请选择图表类型',
                        value:status?.defaultType || '',
                    },
                    childs:[
                        {
                            tagName:'option',
                            attributes:{
                                value:'',
                            },
                            innerText:'请选择图表类型'
                        },
                        ...(chartShowTypes.map(typeItem => {
                            return {
                                tagName:'option',
                                attributes:{
                                    value:typeItem.label,
                                },
                                innerText:typeItem.label
                            }
                        }) as Array<CreateElementConfig>)
                    ],
                    events:{
                        change(e:Event){
                            if(!e.target) return;
                            const v:any = (e.target as HTMLSelectElement).value;
                            currentSelectChartType = v;
                            updateChartContent();
                        }
                    },
                    attachedQueryNode:shadowRoot,
                    returnAttachedNode(e:any) {
                        loadScriptPromise.then(res => {
                            (e as HTMLSelectElement).value = status?.defaultType || '';
                            const v:any = (e as HTMLSelectElement).value;
                            // 手动不会触发change事件
                            currentSelectChartType = v;
                            selectAttachNum +=1;
                            // 避免canvas大量逻辑，影响select值的切换延迟
                            setTimeout(() => {
                                updateChartContent();
                            }, 100);
                        })
                    }
                },
                {
                    tagName:'select',
                    className:'chart-select',
                    attributes:{
                        placeholder:'请选择物料',
                        value:status?.defaultLabel || '',
                    },
                    childs:[
                        {
                            tagName:'option',
                            attributes:{
                                value:'',
                            },
                            innerText:'请选择物料'
                        },
                        ...(getMaterialList().map(materialItem => {
                            return {
                                tagName:'option',
                                attributes:{
                                    value:materialItem.label,
                                },
                                innerText:materialItem.label.slice(0,5)
                            }
                        }) as Array<CreateElementConfig>)
                    ],
                    events:{
                        change(e:Event){
                            if(!e.target) return;
                            const v:any = (e.target as HTMLSelectElement).value;
                            currentSelectMaterialItemLabel = v;
                            updateChartContent();
                        }
                    },
                    attachedQueryNode:shadowRoot,
                    returnAttachedNode(e:any) {
                        loadScriptPromise.then(res => {
                            (e as HTMLSelectElement).value = status?.defaultLabel || '';
                            const v:any = (e as HTMLSelectElement).value;
                            // 手动不会触发change事件
                            currentSelectMaterialItemLabel = v;
                            selectAttachNum +=1;
                            // 避免canvas大量逻辑，影响select值的切换延迟
                            setTimeout(() => {
                                updateChartContent();
                            }, 100);
                        })
                    }
                }
            ]
        }
        function updateChartContent(){
            if(selectAttachNum < currentHeadSelectNum) return;
            // 保存私有状态
            saveHtmlActionStatus<'图表'>({
                defaultType:currentSelectChartType,
                defaultLabel:currentSelectMaterialItemLabel
            })
            const node = shadowRoot.querySelector('.chart-content')!;
            removeChilds(node);
            if(!currentSelectChartType) {
               return;
            }
            if(!Chart) return;
            let selectLabels:Array<MaterialsItem['label']> = []
            if(!currentSelectMaterialItemLabel) {
                selectLabels = getMaterialList().map(materialItem => materialItem.label);
            } else {
                selectLabels = [currentSelectMaterialItemLabel]
            }
            selectLabels.forEach((_selectLabel,index) => {
                const chartDataItem = getChartDataItem(currentSelectChartType!,_selectLabel);
                const currentLabelConfigItem = chartShowTypes.find(i => i.label === currentSelectChartType)!;
                let footerNodes:Array<CreateElementConfig> = []
                if(currentLabelConfigItem) {
                    footerNodes = currentLabelConfigItem.getCanvasFooterNodes(chartDataItem.chartMaterialItems);
                }
                createChildsElement([
                    {
                        tagName:'div',
                        className:'canvas-item',
                        childs:[
                            {
                                tagName:'div',
                                className:'material-item-label',
                                childs:[
                                    {
                                        tagName:'span',
                                        innerText:_selectLabel
                                    },
                                    {
                                        tagName:'span',
                                        className:'specs',
                                        innerText:`${chartDataItem.chartMaterialItems[0].list.map(i => i.specsText)}`
                                    }
                                ]
                            },
                            {
                                tagName:'div',
                                className:'canvas-wrapper',
                                style:{
                                    width:'100%',
                                    height:'380px',
                                },
                                childs:()=> {
                                    let currentChart:Chart;
                                    return [
                                        {
                                            tagName:'canvas',
                                            style:{
                                                width:'100%',
                                                height:'380px',
                                            },
                                            attachedQueryNode:node,
                                            returnAttachedNode(e){
                                                if(e && e.parentNode) {
                                                    const canvasRenderingContext2D = (e as HTMLCanvasElement).getContext('2d');
                                                    if(!canvasRenderingContext2D) return;
                                                    currentChart = new Chart(canvasRenderingContext2D,{
                                                        type:'line',
                                                        data:{
                                                            labels:chartDataItem.labels,
                                                            datasets:chartDataItem.datasets.map(i => ({
                                                                label:i.label,
                                                                data:i.data
                                                            })),
                                                        },
                                                        options:{
                                                            responsive: true,
                                                            maintainAspectRatio: false, // 否则高度不生效
                                                            plugins:{
                                                                datalabels: {
                                                                    clamp: true,
                                                                    verflow: false,
                                                                    align:'start',
                                                                    offset:function(context:any){ // align不能为center。否则此属性不生效
                                                                        // 拿到y最大刻度
                                                                        const yMax = context.chart.scales.y.max;
                                                                        const canvasHeight = context.chart.height;
                                                                        const currentDataIndex:number = context.dataIndex;
                                                                        const currentDatasetIndex:number = context.datasetIndex;
                                                                        const currentValue = context.dataset.data[currentDataIndex];
                                                                        if(typeof currentValue !== 'number') return;
                                                                        const othersValue = context.chart.data.datasets.map((i:any,index:number) => {
                                                                            return {
                                                                                datasetIndex:index,
                                                                                value:i.data[currentDataIndex]
                                                                            }
                                                                        }).filter((i:any) => i.datasetIndex !== currentDatasetIndex)
                                                                        // 如果上下有max/10的数据，则高的上移，低的下移，如果一样，则dataIndex高的上移
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
                                                                        return offset;
                                                                    },
                                                                    // formatter: function(value:any) {
                                                                    //     console.log(value)
                                                                    //     return value > 0 ? value : ''; // 只有当值大于0时才显示标签
                                                                    // },
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
                                                        plugins: [],
                                                    })
                                                }
                                            },
                                            events:{
                                                "click"(e) {
                                                    // 拿到点击点的视口位置
                                                    const {clientX,clientY} = e;
                                                    // 拿到canvas的视口位置
                                                    const canvasNode = e.target as HTMLCanvasElement;
                                                    const rect = canvasNode.getBoundingClientRect();
                                                    // 拿到点击位置相当于canvas的位置
                                                    const relativeCanvasX = clientX - rect.left;
                                                    const relativeCanvasY = clientY - rect.top;
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
                                                            let currentSelectBelongField:typeof recordRecordBelong[number]['field'];
                                                            showMessage('选择修改的归属',{
                                                                select:{
                                                                    list:recordRecordBelong.map(i => {
                                                                        return {
                                                                            label:i.label,
                                                                            value:i.field
                                                                        }
                                                                    }),
                                                                    onChange(v:any){
                                                                        currentSelectBelongField = v;
                                                                    }
                                                                }
                                                            }).then(res => {
                                                                if(res === '确定') {
                                                                    updateHtmlAction('修改',{
                                                                        defaultDate:xLabel,
                                                                        selectMaterialItem:{
                                                                            belongField: currentSelectBelongField || currentLabelConfigItem?.navigateBelongField,
                                                                            label:chartDataItem.materialItemLabel
                                                                        }
                                                                    })
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
                                                                                const area = dataLabelItem.$layout?._box?._rect                                                                                ;
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
                                                    }
                                                    try {
                                                        allowDatalabelsAreaClick((datasetIndex,pointIndex)=> {
                                                            // 拿到对应的x轴label
                                                           const xLabel = (currentChart as any).scales.x.getLabelForValue(pointIndex);
                                                           // 拿到对应field
                                                           const pointField = chartDataItem.datasets[datasetIndex].field;
                                                           let navigateBelongField:typeof recordRecordBelong[number]['field'];
                                                           const matchItem = recordRecordBelong.find(i => `${i.field}Num` === pointField);
                                                           if(matchItem) {
                                                              navigateBelongField = matchItem.field
                                                           } else {
                                                              navigateBelongField = 'repo'
                                                           }
                                                           showMessage('进入修改?',{
                                                                confirm:true,
                                                                cancel:true
                                                            }).then(res => {
                                                                if(res === '确定') {
                                                                    updateHtmlAction('修改',{
                                                                        defaultDate:xLabel,
                                                                        selectMaterialItem:{
                                                                            belongField:navigateBelongField,
                                                                            label:chartDataItem.materialItemLabel
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        })
                                                    } catch(err){}
                                                   
                                                },
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                tagName:'div',
                                className:'canvas-footer-wrapper',
                                childs:footerNodes
                            }
                        ]
                    }  
                ],node)
            })
        }
        function createChart(){
            createElement({
                tagName:'div',
                className:'chart-wrapper',
                childs:[
                    // 头部
                    {
                        tagName:'div',
                        className:'chart-head-wrapper', // 解决strick吸附测漏问题
                        childs:[{
                            tagName:'div',
                            className:'chart-select-wrapper',
                            childs:createSelect()
                        }]
                    },
                    // 内容
                    {
                        tagName:'div',
                        className:'chart-content',
                        childs:[]
                    }
                ]
            },shadowRoot)
        }
        createChart();
    },
}
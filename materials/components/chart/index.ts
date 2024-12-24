
import { ComponentsExport, CreateElementConfig,ChartItemRenderDataItemLike,BrandItem } from '@types'
import { createElement } from '@utils'
export const myCharts:ComponentsExport<'my-charts'> = {
    tagName:'my-charts',
    createNode(shadowRoot,data,params){
        createElement({
            tagName:'link',
            attributes:{
                rel:"stylesheet",
                href:"./dist/chart.css"
            }
        },shadowRoot);
        const childsCanvasList:Array<CreateElementConfig> = [];
        const renderData = data.renderData;
        function generateCanvasElementConfig(canvasData:Array<ChartItemRenderDataItemLike>,specs?:BrandItem['specs']) {
            if(!canvasData.length) return;
            // 生成canvas
            function initChartCanvas(ele:Element){
                if(!ele) return;
                new Chart((ele as HTMLCanvasElement).getContext('2d'),{
                    type:'line',
                    data:{
                        // 横坐标
                        labels:canvasData.map(i => i.recordDate),
                        datasets:params.datasetsLabels.map(field => {
                            return {
                                /** 块 */
                                label:params.datasetsLabelsMap[field],
                                /** 这个块对应的数据 */
                                data:canvasData.map(i => i[field])
                            }
                        })
                    },
                    options: {
                        responsive: true, // 确保图表响应式
                        maintainAspectRatio: false, // 
                        plugins:{
                            legend: {
                                position: 'top', // 将 legend 放置在顶部
                                align: 'center', // 水平居中对齐
                                labels: {
                                    font: {
                                        size: 12
                                    },
                                    color: (context:any) => {
                                        
                                        return '#315efb';
                                    },
                                },
                            },
                            datalabels: {
                                color: '#333', // 文字颜色，白色
                                backgroundColor: function(context:any) {
                                    return context.dataset.backgroundColor; // 使用数据集的颜色作为背景色
                                },
                                clamp: true,
                                offset:function(context:any){
                                    // console.log(context)
                                    return 50;
                                },
                                rotation: function(context:any) {
                                    const datasetIndex = context.datasetIndex
                                    if(datasetIndex === 0) {
                                        return -45;
                                    } else if(datasetIndex === 1) {
                                        return 0;
                                    } else {
                                        return 45;
                                    }
                                },
                                font: {
                                    size: 12,
                                }
                            }    
                        }
                    }
                })
            }
            function getSpecsText(){
                if(specs) {
                    let text = ''
                    specs.forEach((i,index) => {
                        if(index === 0) {
                            text = `1${i.unit}`
                        } else {
                            text += `*${specs[index -1].spec}${i.unit}`
                        }
                    })
                    return text;
                } 
                return ''
            }
            // 生成footer内容
            function generateFooterNodes():Array<CreateElementConfig>{
                if(!params.footer.length) return [];
                const showArr = canvasData.slice(-3).reverse();
                return params.footer.map(field => ({
                    tagName:'div',
                    className:'item-type-wrapper',
                    childs:showArr.map(i => ({
                        tagName:'div',
                        className:'item',
                        style:{
                            display:i[field] ? 'block' : 'none'
                        },
                        childs:[
                            {
                                tagName:'div',
                                className:'item-record-date',
                                innerText:i.recordDate
                            },
                            {
                                tagName:'div',
                                className:'item-content',
                                innerHTML:i[field]
                            }
                        ]
                    }))
                }))
            }
            const canvasItemWrapper:CreateElementConfig = {
                tagName:'div',
                className:'canvas-item-wrapper',
                childs:[
                    {
                        tagName:'div',
                        className:'canvas-item-title',
                        childs:[
                            {
                                tagName:'div',
                                innerText:canvasData[0].label
                            },
                            {
                                tagName:'div',
                                style:{
                                    color:'var(--infoColor)',
                                    fontSize:'12px'
                                },
                                innerText:getSpecsText()
                            }
                        ]
                       
                    },
                    {
                        tagName:'div',
                        className:'canvas-body-wrapper',
                        childs:[
                            {
                                tagName:'canvas',
                                className:'canvas',
                                returnAttachedNode:initChartCanvas
                            }
                        ]
                    },
                    {
                        tagName:'div',
                        className:'canvas-footer-wrapper',
                        childs:generateFooterNodes()
                    }
                ]
            }
            childsCanvasList.push(canvasItemWrapper);
        }
        if(renderData.brandList.length > 1) {
            generateCanvasElementConfig(renderData.materialItem);
        }
        renderData.brandList.forEach((brandItemList,index) => {
            generateCanvasElementConfig(brandItemList,data.basicInof.brandList[index].specs);
        })
        createElement({
            tagName:'div',
            className:'wrapper',
            childs:childsCanvasList
        },shadowRoot);
    }
}
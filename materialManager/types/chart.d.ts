/**
 * @category General Use
 */
export interface ChartOptions {
    /** 图表类型 */
    type:string,
    data:{
        // x坐标
        labels:Array<string>,
        datasets:Array<{
            // 图表顶部的label
            label:string,
            data:Array<any>
        }>
    },
    options:{
        responsive?:boolean,
        maintainAspectRatio?:boolean,
        plugins?:Record<string,any>
    },
    plugins:Array<object>
}
declare global {
    class Chart {
        public static  registry:any;
        public static   register:Function;
        getElementsAtEventForMode:Function;
        constructor(anvas:CanvasRenderingContext2D,otions:ChartOptions)
    }
    const ChartDataLabels:any;
}
export {}
class Chart {
    static public registry:any;
    static public  register:Function;
    constructor(canvas:CanvasRenderingContext2D | null,options:object) {

    }
  }

declare const Chart:Chart
declare const ChartDataLabels:object;
declare class Sortable {
  constructor(
    el: HTMLElement,
    options?: Sortable.Options
  );

  static create(el: HTMLElement, options?: Sortable.Options): Sortable;

  destroy(): void;
  sort(): void;
}
function writeXlsxFile(data:object,options:{
    fileName:string,
    stickyColumnsCount:number,
    stickyRowsCount:number,
    columns
})
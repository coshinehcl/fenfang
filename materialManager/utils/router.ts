import { addObserve,cloneData,EventEmitter } from '@utils'
/** ts-type */
type PageBaseItem = {
    /** 页面名称 */
    pageName:string,
    /** 页面状态 */
    pageStatus:Record<string,any>,
    /** 返回时，是否跳过这个页面 */
    ignoreByBack?:boolean,
    /** 前进时，静默前进，也就是仅仅入页面栈，不触发pageChange回调 */
    silentByForward?:boolean,
}
type PageItem<T> = {
    /** 页面信息 */
    page:T,
    /** 页面路由meta信息 */
    meta:{
        /** 通过哪个页面过来的 */
        by:T | undefined,
        /** 过来的方式 */
        type:'forward' | 'back'
    }
}
/**
 * 路由管理
 * 这里只提供逻辑控制，具体页面更新需要依赖当前页面变动的勾子
 * 提供页面前进/后退逻辑
 * 提供[当前页面]变动的勾子,可用于更新页面
 * 提供[能否返回]变动的勾子,可用于控制页面返回按钮的显示
 */
export class RouterManager<T extends PageBaseItem> extends EventEmitter<{
    pageChange:PageItem<T>,
    allowBackChange:boolean
}> {
    private pageStack:Array<T>
    private _isAllowBack:boolean
    constructor(){
        super();
        this.pageStack = [];
        this._isAllowBack = false;
        // @ts-ignore
        addObserve(this,'_isAllowBack',(v)=> {this.emit('allowBackChange',v)})
    }
    get isAllowBack(){
        return this._isAllowBack;
    }
    get currentPage(){
        return this.pageStack.slice(-1)[0];
    }
    onAllowBackChange(fun:(isAllowBack:boolean) => void) {
        return this.on('allowBackChange',fun)
    }
    onPageChange(fun:(pageItem:PageItem<T>)=> void) {
        return this.on('pageChange',fun)
    }
    private getBackPage(){
        if(this.pageStack.length <= 1) return;
        // 尝试找到返回的目标页
        for(let i = this.pageStack.length -2;i >= 0; i--) {
            const targetPage = this.pageStack[i];
            if(!targetPage.ignoreByBack) {
                return targetPage;
            }
        }
    }
    /**
     * 页面前进
     * @param {object} pageItem 页面项信息
     * @param {string} pageItem.pageName 页面名称
     * @param {object} pageItem.pageStatus 页面内部状态
     * @param {boolean} [pageItem.ignoreByBack] [可选]返回时，是否跳过这个页面
     * @param {boolean} [pageItem.silentByForward] [可选]前进时，静默前进，也就是仅仅入页面栈，不触发pageChange回调
     * @returns {number} 新的页面栈长度
     */
    pageForward(pageItem:T) {
        const currentPage = this.currentPage;
        const innerPageItem = cloneData(pageItem)
        // 更新页面栈
        if(innerPageItem.silentByForward) {
            this.pageStack.push(innerPageItem);
            this._isAllowBack = !!this.getBackPage()
            return;
        };
        // pageChange失败的，不会进入页面堆栈
        this.emit('pageChange',{
            page:innerPageItem,
            meta:{
                by:currentPage,
                type:'forward'
            }
        })?.then(() => {
            this.pageStack.push(innerPageItem);
            console.log('pageStack',this.pageStack.length)
            this._isAllowBack = !!this.getBackPage()
        }).catch(err => {
            console.log(err);
        })
    }
    /**
     * 页面回退
     * @returns 回退的页面信息 | Error
     */
    pageBack(){
        const currentPage = this.currentPage;
        const targetPage = this.getBackPage();
        const targetPageIndex = this.pageStack.findIndex(i => i === targetPage);
        if(!targetPage) {
            throw new Error('返回失败,页面栈:'+JSON.stringify(this.pageStack))
        }
        // 更新页面栈
        this.pageStack = this.pageStack.splice(0,targetPageIndex+1);
        this._isAllowBack = !!this.getBackPage();
        const pageInfo = {
            page:targetPage,
            meta:{
                by:currentPage,
                type:'back'
            }
        } as const;
        this.emit('pageChange',pageInfo)
        return cloneData(pageInfo);
    }
}
export const globalRouterManager = new RouterManager();



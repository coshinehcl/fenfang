
import { ComponentsExport } from '@types'
import { createElement,getRecordMaterialItemTotalInfo,getRecordBrandItemTotalInfo } from '@utils'
export const myInputs:ComponentsExport<'my-inputs'> = {
    tagName:'my-inputs',
    createNode(shadowRoot,data,params){
        createElement({
            tagName:'link',
            attributes:{
                rel:"stylesheet",
                href:"./dist/inputs.css"
            }
        },shadowRoot);
        const wrapperNode = createElement({
            tagName:'div',
            className:'wrapper',
            attributes:{
                'data-belong':params.belongText
            },
            returnNode(ele){
                updateTotal(ele);
            },
            childs:[
                {
                    tagName:'div',
                    className:"title",
                    innerText:data.label,
                    events:{
                        click(e:Event) {
                            if(e.target !== e.currentTarget) return;
                            params.pageScrollToNextBelongSelf();
                        }
                    }
                },
                {
                    tagName:'div',
                    className:'list-wrapper',
                    childs:data.list.map(brandItem => {
                        const lastBrandItem = params.lastMaterialItem?.list.find(x => x.label === brandItem.label);
                        let lastBrandTextList = [];
                        let lastBrandItemNum = 0;
                        if(lastBrandItem) {
                            lastBrandItemNum = getRecordBrandItemTotalInfo(lastBrandItem).total;
                            lastBrandTextList.push(`${lastBrandItemNum} ${params.lastMaterialItem?.unit || ''}`)
                        }
                        let curPurchaseBrandItemNum = 0;
                        let curValueReference:string | number = '';
                        if(params.currentRecordItem && params.belong === 'repo') {
                            const curPurchaseItem = params.currentRecordItem.purchase.find(x => x.label === data.label);
                            if(curPurchaseItem) {
                                const curPurchaseBrandItem = curPurchaseItem.list.find(x => x.label === brandItem.label);
                                if(curPurchaseBrandItem) {
                                    curPurchaseBrandItemNum = getRecordBrandItemTotalInfo(curPurchaseBrandItem).total;
                                    lastBrandTextList.push(`本次购买${curPurchaseBrandItemNum} ${curPurchaseItem.unit}`);
                                    curValueReference = lastBrandItemNum + curPurchaseBrandItemNum;
                                    lastBrandTextList.push(`本次仓库应少于等于${lastBrandItemNum + curPurchaseBrandItemNum} ${curPurchaseItem.unit}`)
                                }
                            }
                        }
                        const inputList = params.onlyDisplayLastSpecInput ? brandItem.numList.slice(-1) : brandItem.numList;
                        let currentValidarNode:HTMLElement;
                        function validarValue(){
                            if(!currentValidarNode) return;
                            let flag = true;
                            if(params.belong === 'repo' && typeof curValueReference === 'number') {
                                flag = getRecordBrandItemTotalInfo(brandItem).total <= curValueReference;
                            } else {
                                flag =true
                            }
                            currentValidarNode.style.display = flag ? 'none' : 'inline';
                        }
                        return {
                            tagName:'div',
                            className:'item-wrapper',
                            childs:[
                                {
                                    tagName:'div',
                                    className:'item-title',
                                    innerText:brandItem.label
                                },
                                {
                                    tagName:'div',
                                    className:'item-inputs',
                                    childs:inputList.map(numItem => {
                                        return {
                                            tagName:'div',
                                            className:'input-wrapper',
                                            childs:[
                                                {
                                                    tagName:'input',
                                                    attributes:{
                                                        value:numItem.num || '', // 0的时候，不要显示0！避免界面不好看
                                                        type:'number'
                                                    },
                                                    events:{
                                                        input(e:Event) {
                                                            if(!e.target) return;
                                                            numItem.num = Number((e.target as HTMLInputElement).value);
                                                            updateTotal();
                                                            validarValue();
                                                        }
                                                    }
                                                },
                                                {
                                                    tagName:'span',
                                                    innerText:numItem.unit
                                                }
                                            ]
                                        }
                                    })
                                },
                                {
                                    tagName:'div',
                                    className:'item-total',
                                    childs:[
                                        {
                                            tagName:'div',
                                            style:{
                                                display:lastBrandItem ? 'block' : 'none'
                                            },
                                            innerHTML:`上次:&nbsp${lastBrandTextList.join(';')}`
                                        },
                                        {
                                            tagName:'span',
                                            innerHTML:`本次:&nbsp`
                                        },
                                        {
                                            tagName:'span',
                                            className:'item-total-placeholder',
                                            innerHTML:''
                                        },
                                        {
                                            tagName:'span',
                                            className:'item-total-validator',
                                            style:{
                                                display:'none',
                                            },
                                            innerHTML:'&nbsp❌(请检查本次或上次记录数据)',
                                            returnNode(ele) {
                                                currentValidarNode = ele;
                                                validarValue();
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    })
                },
                {
                    tagName:'div',
                    className:'list-total',
                    style:{
                        display:data.list.length > 1 ? 'block' : 'none'
                    },
                    childs:[
                        {
                            tagName:'span',
                            style:{
                                display: params.lastMaterialItem ? 'block' : 'none'
                            },
                            innerHTML:`上次:&nbsp${params.lastMaterialItem ? getRecordMaterialItemTotalInfo(params.lastMaterialItem).reduce(((total,cur)=> {total+=cur.total;return total}),0) : ''}`
                        },
                        {
                            tagName:'span',
                            innerHTML:'本次:&nbsp'
                        },
                        {
                            tagName:'span',
                            className:'list-total-placeholder',
                            innerHTML:''
                        }
                    ]
                }
            ]
        },shadowRoot)
        function updateTotal(_wrapperNode:Element = wrapperNode){
            if(!_wrapperNode) return;
            const itemTotalNodes = _wrapperNode.querySelectorAll('.item-total-placeholder') as NodeListOf<HTMLElement>;
            const listTotalNode = _wrapperNode.querySelector('.list-total-placeholder') as HTMLElement;
            const totalText:Array<{total:number,totalText:string}> = getRecordMaterialItemTotalInfo(data)
            if(itemTotalNodes) {
                Array.from(itemTotalNodes).forEach((itemTotalNode,index) => {
                    itemTotalNode.innerHTML = `${totalText[index].totalText} = <strong>${totalText[index].total}</strong>&nbsp${data.unit}`
                })
            }
            if(listTotalNode) {
                const totalNum = totalText.reduce((total,cur) => {
                    total += cur.total
                    return total;
                },0)
                listTotalNode.innerHTML = `<strong>${totalNum}</strong>&nbsp${data.unit}`
            }
        }
    }
}
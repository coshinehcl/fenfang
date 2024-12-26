import customElementConfigList from '@components'
import { createElement, getRecordList, initCustomElement,removeChilds,setRecordList,updateRecordList } from '@utils'
import { ActionTypes,ActionHandler,PageNavManager } from '@types'

const pageNavManager:PageNavManager = {
    nodesList:[],
    addPageNav(node,title){
        this.nodesList.push({node,title});
        this.renderPageNav();
    },
    updatePageNav(){
        this.nodesList = this.nodesList.filter(i => {
            return document.body.contains(i.node)
        })
        this.renderPageNav();
    },
    renderPageNav(){
        const pageNavWrapperNode = document.querySelector('.page-nav');
        if(pageNavWrapperNode) {
            removeChilds(pageNavWrapperNode);
            this.nodesList.forEach(i => {
                createElement({
                    tagName:'div',
                    className:'nav-item',
                    innerText:i.title,
                    events:{
                        click(e:Event) {
                            i.node.scrollIntoView({
                                behavior:'smooth'
                            });
                        }
                    }
                },pageNavWrapperNode)
            })
        }
    }
}
function initRecordData() {
    return fetch('./dist/defaultRecordJSON.json').then(res => {
       if(res.ok) {
            return res.json()
       }
    }).then(res => {
        const list = getRecordList();
        if(!list.length) {
            setRecordList(res.list);
        }
    })
}
function initHtmlEvent(config:Record<ActionTypes,ActionHandler>){
    const actionWrapper = document.querySelector('body > .action');
    if(!actionWrapper) return;
    const actionItemNodes = actionWrapper.querySelectorAll('.action-item');
    const actionContentNode = document.querySelector('body > .action-content');
    if(!actionItemNodes || !actionContentNode) return;
    Array.from(actionItemNodes).forEach(actionItem => {
        actionItem.addEventListener('click',(event:Event)=> {
            if(!event || !event.target) return;
            Array.from(actionItemNodes).forEach(i => i.classList.remove('active'));
            actionItem.classList.add('active');
            const actionItemType = (event.target as HTMLElement).dataset.type as ActionTypes;
            location.hash = actionItemType || '';
            removeChilds(actionContentNode);
            pageNavManager.updatePageNav();
            switch(actionItemType){
                case 'materialsManager':
                    config.materialsManager(actionContentNode,{pageNavManager});break;
                case 'newData':
                    config.newData(actionContentNode,{pageNavManager});break;
                case 'modifyData':
                    config.modifyData(actionContentNode,{pageNavManager});break;
                case 'viewData':
                    config.viewData(actionContentNode,{pageNavManager});break;
                case 'inOutData':
                    config.inOutData(actionContentNode,{pageNavManager});break;
            }
        })
    })
    // 把顶部增加到页面导航中
    pageNavManager.addPageNav(actionWrapper,'🔝');
    if(location.hash) {
        const hashValue = location.hash.slice(1);
        const actionActiveItem = actionWrapper.querySelector(`.action-item[data-type='${hashValue}']`);
        if(actionActiveItem) {
            (actionActiveItem as HTMLElement).click();
        }
    } else {
        (actionItemNodes[0] as HTMLElement).click();
    }
    
}
function initComponents(){
    customElementConfigList.forEach(customEleConfig => {
        initCustomElement(customEleConfig)
    })
}
export async function init(config:Record<ActionTypes,ActionHandler>){
    await initRecordData();
    initComponents();
    initHtmlEvent(config);
    updateRecordList();
}

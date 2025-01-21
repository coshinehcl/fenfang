import {createElement,removeChilds,getCurrentDate,parseDate,getWeekRanges,getMonthRanges,getKeyDateList,setKeyDateList} from '@utils'
const startDate = '20240905';
const endDate = '20250720';
const weekRanges = getWeekRanges(startDate,endDate);
const monthRanges = getMonthRanges(startDate,endDate);

function updateItems(){
    const RootNode = document.querySelector('.show-contain');
    if(!RootNode) return;
    const dateRanges = [
        ...weekRanges.map((i,index) => ({type:'week',date:i,index:index})),
        ...monthRanges.map((i,index) => ({type:'month',date:i,index:index})),
    ]
    dateRanges.sort((a,b) => {
        const aDate = parseDate(a.date).getTime();
        const bDate = parseDate(b.date).getTime();
        return aDate - bDate;
    })
    const keyDateList = getKeyDateList();
    // 移除老节点
    removeChilds(RootNode);
    const addDialogNode = document.querySelector('#addDialog') as HTMLDivElement;
    // 新建新的节点
    dateRanges.forEach(item => {
        if(item.type === 'week') {
            const currentWeekKeyDates = keyDateList.filter(_item => _item.belongWeek === item.date);
            createElement({
                tagName:'div',
                className:'item-wrapper',
                childs:[
                    {
                        tagName:'div',
                        className:'item-title-wrapper',
                        childs:[
                            {
                                tagName:'div',
                                innerHTML:`<span style="color:#FF3366;">第${item.index}周</span>`
                            },
                            {
                                tagName:'div',
                                style:{
                                    color:'#999'
                                },
                                innerText:item.date
                            },
                        ]
                    },
                    {
                        tagName:'img',
                        className:'item-img',
                        style:{
                            display:item.index >= 1 && item.index <= 40 ? 'block' : 'none'
                        },
                        attributes:{
                            src:`./images/${item.index}.png`,
                            loading:"lazy"
                        }
                    },
                    {
                        tagName:'div',
                        className:'item-content',
                        childs:currentWeekKeyDates.map(_item => {
                            let touchstartTime:number; 
                            return {
                                tagName:'div',
                                className:'key-date-item',
                                childs:[
                                    {
                                        tagName:'div',
                                        className:'key-date-item-title',
                                        innerText:_item.title
                                    },
                                    {
                                        tagName:'div',
                                        className:'key-date-item-content',
                                        innerText:_item.content || ''
                                    },
                                    {
                                        tagName:'div',
                                        className:'key-date-item-date',
                                        innerText:_item.date
                                    },
                                ],
                                events:{
                                    touchstart:()=> {
                                        touchstartTime = Date.now();
                                    },
                                    touchend:()=> {
                                        if(!touchstartTime) return;
                                        const touchendTime = Date.now();
                                        if(touchendTime - touchstartTime > 300) {
                                            const isDelete = confirm('是否删除该项？');
                                        if(isDelete) {
                                            setKeyDateList(keyDateList.filter(__item => __item !== _item));
                                            updateItems();
                                        }
                                        }
                                    }
                                }
                            }
                        })
                    },
                    {
                        tagName:'div',
                        className:'item-week-add-btn',
                        innerText:'本周产检记录',
                        events:{
                            click:()=> {
                                if(!addDialogNode) return;
                                addDialogNode.style.display = 'flex';
                                (addDialogNode.querySelector('.dialog-date') as HTMLInputElement).value = item.date;
                                addDialogNode.dataset.date = item.date;
                            }
                        }
                    }
                ]
            },RootNode);
        } else {
            createElement({
                tagName:'div',
                className:'item-month-split',
                innerHTML:`<span style="color:#FF3366;">第${item.index}月</span>(${item.date})`
            },RootNode);
        }
    })
    if(!addDialogNode) return;
    // @ts-ignore
    addDialogNode.addEventListener('add-finish',function(event:CustomEvent){
        debugger
        const {title,belongDate,date,content} = event.detail;
        setKeyDateList([...keyDateList,{
            belongWeek:belongDate,
            title,
            date,
            content
        }])
        updateItems();
    },{once:true})
}
function initCurrentDateNodeEvent(){
    const currentDateNode = document.querySelector('.current-date');
    if(!currentDateNode) return;
    const currentDate = getCurrentDate().full;
    const findIndex = weekRanges.findIndex(item => parseDate(item).getTime() >= parseDate(currentDate).getTime());
    currentDateNode.addEventListener('click',function(){
        if(findIndex === -1) {
            return;
        }
        const targetWeekItem = document.querySelectorAll('.item-wrapper')[findIndex];
        if(targetWeekItem) {
            targetWeekItem.scrollIntoView({
                behavior:'smooth'
            })
        }
    })
}
updateItems();
initCurrentDateNodeEvent();
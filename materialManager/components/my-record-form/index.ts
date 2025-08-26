import { recordBelongList } from '@config'
import { ComponentExport,ComponentConfigMap,RecordItemComputed } from '@types'
import { createElement, removeChilds, getRecordListBase,getCurrentDate, 
    showDialog, initRecordList, cloneData, getEmptyRecordItem,appendChildElements,
    createComponent,validateRecordItem,setRecordList,
    createUpdateElement,getDayDistance,
    showMessage,updatePage,
    GetPromiseAndParams,
    waitEleDuration,
    sleep,
    globalRouterManager} from '@utils'


type UpdateStatusFun = ComponentConfigMap['my-record-form']['exposeMethods']['updateStatus']
export const myRecordForm:ComponentExport<'my-record-form'> = {
    componentName:'my-record-form',
    content() {
        return {
            onMounted(shadowRoot, options, status) {
                const recordList:Array<RecordItemComputed> = [];
                let lastInnerStatus:typeof status;
                const innerUpdate:UpdateStatusFun = async (_status) => {
                    if(_status.date === '_inner') {
                        _status.date = lastInnerStatus.date
                    }
                    lastInnerStatus = cloneData(_status);
                    // 这里负责更新body和footer
                    async function updateFormBodyWrapper(date:string){
                        const formBodywrapper = shadowRoot.querySelector('.form-body-wrapper') as HTMLElement;
                        if(!formBodywrapper) return;
                        removeChilds(formBodywrapper);
                        const currentFormRecordIndex = recordList.findIndex(i => i.recordDate === date);
                        if(currentFormRecordIndex == -1) return; 
                        const currentFormRecordItem = recordList[currentFormRecordIndex];
                        if(!date) {
                            return;
                        }
                        const [myPromise,resolve,reject] = GetPromiseAndParams<void>();
                        appendChildElements(formBodywrapper,recordBelongList.map(belongItem => {
                            function updateBelongContentWrapper(){
                                const belongContentWrapper = belongWrapper?.querySelector('.belong-content-wrapper');
                                if(belongContentWrapper) {
                                    belongContentWrapper.remove();
                                } else {
                                    const lastRecordItem = currentFormRecordIndex === -1 ? undefined : recordList[currentFormRecordIndex -1];
                                    createElement({
                                        tagName:'div',
                                        className:'belong-content-wrapper',
                                        childs:currentFormRecordItem!.list.map(recordMaterialItem => {
                                            let lastRecordMaterialItem = undefined;
                                            if(lastRecordItem) {
                                                lastRecordMaterialItem = lastRecordItem.list.find(i => i.label === recordMaterialItem.label);
                                            }
                                            const materialInputNode = createComponent('my-material-input',{
                                                data:recordMaterialItem,
                                                lastRecordMaterialItem:lastRecordMaterialItem,
                                                dayDistance:lastRecordItem ? getDayDistance(currentFormRecordItem.recordDate,lastRecordItem.recordDate) : undefined,
                                                belong:belongItem,
                                                closeBelongContent:updateBelongContentWrapper,
                                                updateFormStatus:innerUpdate,
                                                navigateTo:(fun)=> {
                                                    if(typeof fun === 'function') {
                                                        // 静默前进
                                                        globalRouterManager.pageForward({
                                                            pageName:options.label,
                                                            pageStatus:{
                                                                date:date,
                                                                material:{
                                                                    belongField:belongItem.belong,
                                                                    label:recordMaterialItem.label
                                                                }
                                                            },
                                                            silentByForward:true
                                                        })
                                                        fun();
                                                    }
                                                }
                                            },{})
                                            if(_status.material && _status.material.belongField === belongItem.belong && recordMaterialItem.label === _status.material.label) {
                                                setTimeout(() => {
                                                    materialInputNode.scrollIntoView({
                                                        block:'center'
                                                    });
                                                    materialInputNode.classList.add('active');
                                                    sleep(2000).then(()=> {
                                                        materialInputNode.classList.remove('active');
                                                    })
                                                    resolve();
                                                }, 400);
                                            }
                                            return materialInputNode;
                                        })
                                    },belongWrapper)
                                }
                            }
                            const belongWrapper = createElement({
                                tagName:'div',
                                className:'belong-wrapper',
                                childs:[
                                    createElement({
                                        tagName:'div',
                                        className:'belong-label',
                                        innerText:belongItem.label,
                                        events:{
                                            "click"(e) {
                                                updateBelongContentWrapper();
                                            },
                                        }
                                    })
                                ]
                            })
                            if(_status.material && _status.material.belongField === belongItem.belong) {
                                updateBelongContentWrapper();
                            }
                            return belongWrapper
                        }))
                        if(!_status.material) {
                            resolve()
                        }
                        return myPromise;
                    }
                    async function updateFormFooterWrapper(date:string){
                        const formFooterWrapper = shadowRoot.querySelector('.form-footer-wrapper') as HTMLElement;
                        if(!formFooterWrapper) return;
                        removeChilds(formFooterWrapper);
                        const currentFormRecordIndex = recordList.findIndex(i => i.recordDate === date);
                        if(currentFormRecordIndex == -1) return; 
                        const currentFormRecordItem = recordList[currentFormRecordIndex];
                        if(!date) return;
                        function _validateRecordItem(){
                             // 校验
                             const errMsg = validateRecordItem(currentFormRecordItem);
                             if(typeof errMsg === 'string' && errMsg) {
                                showMessage({
                                    text:errMsg,
                                    type:'error',
                                    duration:2000
                                })
                            } else if(errMsg){
                                const [belongField,materialIndex,_errMsg] = errMsg;
                                innerUpdate({
                                    date:date,
                                    material:{
                                        belongField:belongField,
                                        label:currentFormRecordItem.list[materialIndex].label
                                    }
                                }).then(res => {
                                    showMessage({
                                        text:_errMsg,
                                        type:'error',
                                        duration:2000
                                    })
                                })
                            }
                            return errMsg;
                        }
                        function add(){
                            appendChildElements(formFooterWrapper,[
                                createElement({
                                    tagName:'div',
                                    className:'btn-item',
                                    innerText:'增加',
                                    events:{
                                        click(){
                                           let errMsg = _validateRecordItem();
                                           if(!errMsg) {
                                                try {
                                                    setRecordList(recordList);
                                                    showMessage({
                                                        text:'增加成功',
                                                        type:'success',
                                                        duration:2000
                                                    }).then(()=> {
                                                        globalRouterManager.pageForward({
                                                            pageName:'修改',
                                                            pageStatus:{
                                                                date:currentFormRecordItem.recordDate
                                                            }
                                                        })
                                                    })
                                                } catch(err:any){
                                                    showMessage({
                                                        text:err.message,
                                                        type:'error',
                                                        duration:2000
                                                    })
                                                }
                                           }
                                        }
                                    }
                                })
                            ])
                        }
                        function modify(){
                            appendChildElements(formFooterWrapper,[
                                createElement({
                                    tagName:'div',
                                    className:'btn-item',
                                    innerText:'移除',
                                    events:{
                                        "click"(e) {
                                            showDialog({
                                                title:'确定移除吗',
                                                content:'',
                                                footer:{
                                                    cancel:'取消',
                                                    confirm:'确认'
                                                }
                                            },true).then(()=> {
                                                debugger
                                                recordList.splice(currentFormRecordIndex,1);
                                                setRecordList(recordList);
                                                showMessage({
                                                    text:'移除成功',
                                                    type:'success',
                                                    duration:2000
                                                })
                                                // 清空当前
                                                updateStatus({date:''})
                                            }).catch(()=>{})
                                        },
                                    }
                                }),
                                createElement({
                                    tagName:'div',
                                    className:'btn-item',
                                    innerText:'更新',
                                    events:{
                                        "click"(e) {
                                            let errMsg = _validateRecordItem();
                                            if(!errMsg) {
                                                try {
                                                    setRecordList(recordList);
                                                    showMessage({
                                                        text:'更新成功',
                                                        type:'success',
                                                        duration:2000
                                                    }).then(()=> {
                                                        // pageBackThenOtherPageInto();
                                                    })
                                                } catch(err:any){
                                                    showMessage({
                                                        text:err.message,
                                                        type:'error',
                                                        duration:2000
                                                    })
                                                }
                                            }
                                        },
                                    }
                                }),
                            ])
                        }
                        options.type === 'add' ? add() : modify()
                    }
                    await updateFormBodyWrapper(_status.date);
                    await updateFormFooterWrapper(_status.date);
                    return Promise.resolve(true);
                }
                const updateStatus:UpdateStatusFun = async (_status) =>{
                    const wrapperNode = shadowRoot.querySelector('.wrapper');
                    if(wrapperNode) {
                        wrapperNode.remove();
                    }
                    let recordListBase = await getRecordListBase();
                    if(!recordListBase.length) {
                        await showDialog({
                            title:'本地无数据列表，是否拉取远程数据',
                            content:'',
                            footer:{
                                confirm:'确认',
                                cancel:'取消'
                            }
                        },true).then(()=> {
                            return getRecordListBase(true).then(res => {
                                recordListBase = res;
                            });
                        }).catch(()=> {
                            return Promise.reject('无数据')
                        })
                    }
                    recordList.splice(0,recordList.length);
                    recordList.push(...initRecordList(recordListBase));
                    const currentDate = getCurrentDate().full;
                    if(options.type === 'add' && recordList.find(i => i.recordDate === currentDate)) {
                        await showDialog({
                            title:'当前日期已有数据',
                            content:currentDate,
                            footer:{
                                confirm:'确认'
                            }
                        },true);
                        return Promise.reject(()=> {
                            globalRouterManager.pageForward({
                                pageName:'修改',
                                pageStatus:{
                                    date:currentDate
                                }
                            })
                        });
                    }
                    // 创建基本节点
                    createElement({
                        tagName:'div',
                        className:'wrapper',
                        childs:[
                            createElement({
                                tagName:'div',
                                className:'form-head-wrapper'
                            }),
                            createElement({
                                tagName:'div',
                                className:'form-body-wrapper'
                            }),
                            createElement({
                                tagName:'div',
                                className:'form-footer-wrapper'
                            }),
                        ]
                    },shadowRoot);
                    function createFormHeadWrapper(){
                        const formHeadWrapper = shadowRoot.querySelector('.form-head-wrapper') as HTMLElement;
                        if(!formHeadWrapper) return Promise.reject();
                        removeChilds(formHeadWrapper);
                        return new Promise((resolve) => {
                            function addType(){
                                appendChildElements(formHeadWrapper,[
                                    createElement({
                                        tagName:'span',
                                        className:'form-date-label',
                                        innerText:'当前日期'
                                    }),
                                    createElement({
                                        tagName:'input',
                                        className:'form-date',
                                        attributes:{
                                            type:'date',
                                            value:currentDate,
                                            disabled:'disabled'
                                        },
                                    })
                                ])
                                // 新增一个记录项目
                                recordListBase.push(getEmptyRecordItem(currentDate));
                                recordList.splice(0,recordList.length);
                                recordList.push(...initRecordList(recordListBase));
                                resolve(innerUpdate({
                                    ..._status,
                                    date:currentDate
                                }))
                            }
                            function modifytype(){
                                const dateList = cloneData(recordList.map(i => i.recordDate));
                                appendChildElements(formHeadWrapper,[
                                    createElement({
                                        tagName:'span',
                                        className:'form-date-label',
                                        innerText:'选择日期'
                                    }),
                                    createElement({
                                        tagName:'select',
                                        className:'form-date',
                                        attributes:{
                                            placeholder:'请选择',
                                            value:''
                                        },
                                        childs:[
                                            createElement({
                                                tagName:'option',
                                                attributes:{
                                                    value:'',
                                                },
                                                innerText:'请选择'
                                            }),
                                            ...(dateList.reverse().map(dateItem => {
                                                return createElement({
                                                    tagName:'option',
                                                    attributes:{
                                                        value:dateItem,
                                                    },
                                                    innerText:dateItem
                                                })
                                            }))
                                        ],
                                        events:{
                                           "change"(e) {
                                                 // 每次切换，要重新更新值，避免上次的修改写入到当前对象中
                                                recordList.splice(0,recordList.length);
                                                recordList.push(...initRecordList(recordListBase));
                                                // 丢弃material信息
                                                innerUpdate({
                                                    date:e.currentTarget.value
                                                })
                                                globalRouterManager.pageForward({
                                                    pageName:options.label,
                                                    pageStatus:{
                                                        date:e.currentTarget.value
                                                    },
                                                    // ignoreByBack:true,
                                                    silentByForward:true
                                                })
                                           },
                                        },
                                        hooks:{
                                            onCreated(e) {
                                                if(_status.date) {
                                                    e.value = _status.date;
                                                }
                                                resolve(innerUpdate(_status))
                                            }
                                        }
                                    })
                                ])
                            }
                            if(options.type === 'add') {
                                addType();
                            } else {
                                modifytype();
                            }
                        })
                    }
                    await createFormHeadWrapper();
                    return Promise.resolve(true)
                }
                updateStatus(status).then(() => {
                    options.returnUpdateStatusType(true);
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
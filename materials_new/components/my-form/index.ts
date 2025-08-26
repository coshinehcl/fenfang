import {CustomElementExport,CreateElementConfig, RecordItemHooks, RecordMaterialItemHooks} from '@types'
import {recordRecordBelong} from '@config'
import {createElement,createCustomElement,getCurrentDate,getRecordList,
    showMessage,createRecordItem,initRecordList,oneByone,removeChilds,setRecordList,createChildsElement,
    saveHtmlActionStatus,
    waitCondition,actionFireBack,
    cloneData} from '@utils'
export const myForm:CustomElementExport<'my-form'> = {
    tagName:'my-form',
    createNode(shadowRoot, options,stylePromise) {
        const { params,status } = options;
        const defaultDate = status?.defaultDate;
        let selectMaterialItem = status?.selectMaterialItem
        /**
         * 1、生成head
         *    - 执行 getDateNodeConfigAndUpdateFormBody
         *      - 拿到日期节点
         *      - 生成formRecordList
         *      - 自动触发/事件触发更新form-body
         * 2、body根据selectData
         *    - 拿到recordItem
         *    - 更新footer
         */
        /**
         * 点击逻辑
         * 1、点击物料，会触发form提供的当前归属移除逻辑
         * 2、点击物料的归属，会记录status，然后跳到图表
         * 3、点击品牌归属，会记录status,方便跳到其它action-item方便回来
         */
        let formRecordList:Array<RecordItemHooks> = [];
        let recordItem:RecordItemHooks | undefined;
        function updateHeadChilds(_defaultDate?:string){
            const formHeadNode = shadowRoot.querySelector('.form-head');
            if(!formHeadNode) return;
            if(formHeadNode) {
                removeChilds(formHeadNode)
            }
            function getDateNodeConfigAndUpdateFormBody():CreateElementConfig | undefined{
                const _recordList = getRecordList();
                if(params.type === 'add') {
                    // 强制为今天
                    _defaultDate = getCurrentDate().full
                } else if(params.type === 'modify'){
                    _defaultDate = _defaultDate || '';
                }
                if(params.type === 'add') { 
                    return {
                        tagName:'input',
                        className:'form-date',
                        attributes:{
                            type:'date',
                            value:_defaultDate,
                            readOnly:'readOnly'
                        },
                        attachedQueryNode:formHeadNode!,
                        returnAttachedNode(e){
                            if(_recordList.find(i => i.recordDate === _defaultDate)) {
                                showMessage('当前日期的记录已经存在了')
                                updateBodyChilds(''); // 需要重置body逻辑
                                return;
                            }
                            const newRecordList = [..._recordList,createRecordItem(_defaultDate!)];
                            formRecordList = initRecordList(newRecordList);
                            updateBodyChilds(_defaultDate!)
                        }
                    }
                } else if(params.type === 'modify') {
                    return {
                        tagName:'select',
                        className:'form-date',
                        attributes:{
                            placeholder:'请选择',
                            value:''
                        },
                        childs:[
                            {
                                tagName:'option',
                                attributes:{
                                    value:'',
                                },
                                innerText:'请选择'
                            },
                            ...(_recordList.map(recordItem => {
                                return {
                                    tagName:'option',
                                    attributes:{
                                        value:recordItem.recordDate,
                                    },
                                    innerText:recordItem.recordDate
                                }
                            }).reverse() as Array<CreateElementConfig>)
                        ],
                        events:{
                            change(e:Event){
                                if(!e.target) return;
                                const recordDate = (e.target as HTMLInputElement).value;
                                formRecordList = initRecordList(_recordList);
                                updateBodyChilds(recordDate);
                            }
                        },
                        attachedQueryNode:formHeadNode!,
                        returnAttachedNode(e) {
                            (e as HTMLSelectElement).value = _defaultDate || '';
                            formRecordList = initRecordList(_recordList);
                            updateBodyChilds(_defaultDate || '');
                        }
                    }
                } else {
                    return;
                }
            }
            createChildsElement([
                {
                    tagName:'span',
                    className:'form-date-label',
                    innerText:params.type === 'add' ? '当前日期' : '选择日期'
                },
                getDateNodeConfigAndUpdateFormBody()
            ],formHeadNode);
        }
        // form-head会调用这个函数，来更新form-body的节点
        function updateBodyChilds(selectDate:string) {
            saveHtmlActionStatus<'修改' | '新增'>({
                defaultDate:selectDate,
                // 会重置selectMaterialItem为进来值
                selectMaterialItem:selectMaterialItem
            })
            updateFormFooter(selectDate ? true : false)
            const formBodyNode = shadowRoot.querySelector('.form-body');
            if(!formBodyNode) return;
            if(formBodyNode) {
                removeChilds(formBodyNode)
            }
            if(!selectDate) return;
            recordItem = formRecordList.find(i => i.recordDate === selectDate);
            if(!recordItem) return;
            createChildsElement(recordRecordBelong.map(belongItem => {
                return {
                    tagName:'div',
                    className:'belong-item',
                    childs:[
                        {
                            tagName:'div',
                            className:'belong-item-label',
                            innerText:belongItem.label,
                            attributes:{
                                'data-belong-field':belongItem.field
                            },
                            events:{
                                "click"(e) {
                                    // 点击后，才生成belong-list
                                    const currentTarget = e.target as HTMLElement
                                    const parentNode = currentTarget?.parentNode as HTMLElement;
                                    if(!parentNode) return;
                                    const belongListNode = parentNode.querySelector('.belong-material-list');
                                    if(belongListNode) {
                                        // 有就移除：相当于关闭
                                        belongListNode.remove();
                                    } else {
                                        createElement({
                                            tagName:'div',
                                            className:'belong-material-list',
                                            attachedQueryNode:parentNode,
                                            returnAttachedNode(e) {
                                                recordItem = formRecordList.find(i => i.recordDate === selectDate);
                                                if(!recordItem) return;
                                                const allFinishPromise = oneByone(recordItem.list,(recordMaterialHooksItem:RecordMaterialItemHooks)=> {
                                                    return new Promise((resolve) => {
                                                        createElement({
                                                            tagName:'div',
                                                            className:'belong-material-item fade-in',
                                                            attributes:{
                                                                'data-material-item-label':recordMaterialHooksItem.label
                                                            },
                                                            childs:[
                                                                createCustomElement('my-inputs',{
                                                                    data:[recordMaterialHooksItem,recordItem!,formRecordList],
                                                                    params:{
                                                                        belong:belongItem,
                                                                        onlyShowLastSpecs:belongItem.field === 'system' ? true : false,
                                                                        belongHiddenFun:()=> {
                                                                            allFinishPromise.then(()=> {
                                                                                currentTarget?.click();
                                                                            })
                                                                        }
                                                                    }
                                                                })
                                                            ]
                                                        },e)
                                                        setTimeout(() => {
                                                            resolve('ok')
                                                        }, 10);
                                                    })
                                                })   
                                            }
                                        },parentNode);
                                    }
                                },
                            }
                        }
                    ]
                }
            }),formBodyNode);
            // 触发selectMaterialItem 逻辑
            if(selectMaterialItem) {
                const _selectMaterialItem = cloneData(selectMaterialItem);
                console.log('_selectMaterialItem',_selectMaterialItem)
                selectMaterialItem = undefined;// 这个逻辑只需要执行一次
                const belongLabelNode = formBodyNode.querySelector(`[data-belong-field=${_selectMaterialItem.belongField}]`) as HTMLElement;
                if(!belongLabelNode || !belongLabelNode.parentNode) return;
                // 支持只传belongField
                belongLabelNode.click();
                // 如果没穿label，则不会定位到具体物料上
                if(!_selectMaterialItem.label) return;
                const queryText = `[data-material-item-label=${_selectMaterialItem.label}]`;
                waitCondition(()=> {
                    if(belongLabelNode && belongLabelNode.parentNode) {
                        return !!belongLabelNode.parentNode.querySelector(queryText)
                    } else {
                        return false;
                    }
                }).then(()=> {
                    setTimeout(() => {
                        if(belongLabelNode && belongLabelNode.parentNode) {
                            const targetNode = belongLabelNode.parentNode.querySelector(queryText);
                            if(targetNode) {
                                targetNode.scrollIntoView({
                                    block:'center'
                                });
                                setTimeout(() => {
                                    targetNode.classList.add('active');
                                    setTimeout(() => {
                                        targetNode.classList.remove('active');
                                    }, 600);
                                }, 300);
                            }
                        }
                    }, 300);
                })
            }
        }
        // form-footer
        function updateFormFooter(showChilds:boolean){
            const footerNode = shadowRoot.querySelector('.form-footer');
            if(!footerNode) return;
            removeChilds(footerNode);
            if(!showChilds) {
               return;
            }
            if(params.type === 'add') {
                createChildsElement([
                    {
                        tagName:'div',
                        className:'form-footer-item',
                        innerText:'添加',
                        events:{
                            click(){
                                setRecordList(formRecordList);
                                showMessage('添加成功',{delay:300}).then(()=> {
                                    // 操作成功后，更新form
                                    actionFireBack(()=> {
                                        updateHeadChilds('')
                                    })
                                })
                            }
                        }
                    }
                ],footerNode)
            } else if(params.type === 'modify') {
                createChildsElement([
                    {
                        tagName:'div',
                        className:'form-footer-item',
                        innerText:'移除',
                        events:{
                            click(){
                                if(!formRecordList || !recordItem) return;
                                showMessage('确定移除吗',{confirm:true,cancel:true}).then((res)=> {
                                    if(res === '取消') return;
                                    const newRecordList = formRecordList.filter(i => i.recordDate !== recordItem?.recordDate)
                                    setRecordList(newRecordList);
                                    showMessage('移除成功',{delay:300}).then(()=> {
                                        // 操作成功后，更新form
                                        actionFireBack(()=> {
                                            updateHeadChilds('')
                                        })
                                    })
                                })
                            }
                        }
                    },
                    {
                        tagName:'div',
                        className:'form-footer-item',
                        innerText:'更新',
                        events:{
                            click() {
                                setRecordList(formRecordList);
                                showMessage('更新成功',{delay:300}).then(()=> {
                                    // 操作成功后，更新form
                                    actionFireBack(()=> {
                                        updateHeadChilds('')
                                    })
                                })
                            }
                        }
                    },
                ],footerNode)
            } else {
                // 
            }
        }
        stylePromise.then(res => {
            createElement({
                tagName:'div',
                className:'form-wrapper',
                childs:[
                    // 头部
                    {
                        tagName:'div',
                        className:'form-head-wrapper', // 解决strick吸附测漏问题
                        childs:[{
                            tagName:'div',
                            className:'form-head'
                        }]
                    },
                    // 内容
                    {
                        tagName:'div',
                        className:'form-body',
                        childs:[]
                    },
                    {
                        tagName:'div',
                        className:'form-footer',
                        childs:[]
                    }
                ]
            },shadowRoot)
            updateHeadChilds(defaultDate);
        })
    },
}
import { ComponentExport,ComponentConfigMap,MaterialItemAtEdit, BrandItemAtEdit } from '@types'
import { brandPriorityMap } from '@config'
import { createElement,getMaterialList,getEmptyMaterialItem, getBrandSpecsText,
     waitEleDuration, removeChilds, objectKeys, createComponent, getEmptyBrandItem, 
     createUpdateElement,validatorMaterialItem, setMaterials, showMessage,
      showDialog, cloneData,validatorBrandItem,validatorBrandSpecstext,getBrandSpecsByText,
      waitCondition} from '@utils'
type UpdateStatus = ComponentConfigMap['my-materials']['exposeMethods']['updateStatus'];

function createMaterialItemNode(shadowRoot:ShadowRoot,materialItem:MaterialItemAtEdit) {
    const wrapperContent = shadowRoot.querySelector('.content')! as HTMLElement;
    return createUpdateElement(()=> {
        let updateMaterialItemFun:Function;
        let updateMaterialItemLabelFun:Function;
        let currentContentIsOpen = false;
        let isUpdateFinish = true;
        async function waitupdateMaterialItemContent(wrapper:HTMLElement,isOpen:boolean){
            if(isUpdateFinish) {
                isUpdateFinish = false;
                currentContentIsOpen = isOpen;
                updateMaterialItemContent(wrapper,materialItem,currentContentIsOpen,updateMaterialItemFun).finally(()=> {
                    isUpdateFinish = true;
                })
            }
        }
        return {
            tagName:'div',
            className:`material-item-wrapper ${materialItem.isNewAdd ? 'new-material-item' : ''} ${materialItem.isDeprecated ? 'material-item-deprecated' : ''}`,
            attributes:{
                'data-label':materialItem.label
            },
            getUpdateFun(updateFun) {
                updateMaterialItemFun = updateFun;
            },
            events:{
                customClick(e){
                    waitupdateMaterialItemContent(e.target,true).then(()=>{
                        if(typeof e.detail.resolve === 'function') {
                            e.detail.resolve();
                        }
                    })
                }
            },
            childs:[
                createElement({
                    tagName:'div',
                    className:'material-label-wrapper',
                    childs:[
                        createUpdateElement(()=> ({
                            tagName:'div',
                            className:'material-label',
                            innerText:materialItem.label,
                            getUpdateFun(updateFun, ele) {
                                updateMaterialItemLabelFun = updateFun;
                            },
                        })),
                        materialItem.isNewAdd ? createElement({
                            tagName:'div',
                            className:'edit-icon',
                            innerText:'✍🏻',
                            events:{
                                "click"(e) {
                                    e.stopPropagation();
                                    const newMaterialItem = cloneData(materialItem);
                                    showDialog({
                                        title:'新的物料名称',
                                        content:{
                                            default:materialItem.label,
                                            validator(v){
                                                (newMaterialItem as any).label = v;
                                                return validatorMaterialItem(newMaterialItem,['label']);
                                            }
                                        },
                                        footer:{
                                            cancel:'取消',
                                            confirm:'确认'
                                        }
                                    },true).then(res=> {
                                        (materialItem as any).label = res;
                                        updateMaterialItemLabelFun();
                                    }).catch(()=> {})
                                },
                            }
                        }) : undefined
                    ],
                    events:{
                        click(e){
                            waitupdateMaterialItemContent(e.currentTarget.parentNode as HTMLElement,!currentContentIsOpen)
                        },
                    }
                })
            ],
            hooks:{
                onMounted(ele) {
                    waitupdateMaterialItemContent(ele,currentContentIsOpen)
                }
            },
        }
    },wrapperContent)
}
async function updateMaterialItemContent(parentNode:HTMLElement,materialItem:MaterialItemAtEdit,isShow:boolean,updateMaterialItemFun:Function){
    const wrapperName = 'material-item-content'
    const wrapperNode = parentNode.querySelector(`.${wrapperName}`) as HTMLElement;
    if(wrapperNode) {
        wrapperNode.style.height = '0px';
        await waitEleDuration(wrapperNode,'active',false).then(()=> {
            wrapperNode.remove();
        })
    }
    if(!isShow) return;
    // 设置为激活状态
    {
        parentNode.classList.add('active');
        setTimeout(() => {
            parentNode.classList.remove('active');
        }, 2000);
    }
    // 创建品牌
    function createBrandItem(brandItem:BrandItemAtEdit,newBrandItem:boolean=false){
        const wrapperNode = parentNode.querySelector(`.${wrapperName}`) as HTMLElement;
        const brandListWrapper = wrapperNode.querySelector('.brand-list-wrapper')! as HTMLElement;
        createUpdateElement(()=> {
            let updateBrandItemFun:Function;
            return {
                tagName:'div',
                className:`brand-item-wrapper ${brandItem.isNewAdd ? 'new-brand-item' : ''} ${brandItem.isDeprecated ? 'brand-item-deprecated' : ''}`,
                getUpdateFun(updateFun){
                    updateBrandItemFun = updateFun;
                },
                childs:()=> {
                    let labelUpdateFun:Function;
                    return  [
                        createElement({
                            tagName:'div',
                            className:'brand-label-wrapper',
                            childs:[
                                createUpdateElement(()=>({
                                    tagName:'div',
                                    innerText:brandItem.label,
                                    getUpdateFun(updateFun, ele) {
                                        labelUpdateFun = updateFun;
                                    },
                                })),
                                brandItem.isNewAdd ? createElement({
                                    tagName:'div',
                                    className:'edit-icon',
                                    innerText:'✍🏻',
                                    events:{
                                        "click"(e) {
                                            const newBrandItem = cloneData(brandItem);
                                            showDialog({
                                                title:'新的品牌名称',
                                                content:{
                                                    default:brandItem.label,
                                                    validator(v) {
                                                        newBrandItem.label = v;
                                                        return validatorBrandItem(newBrandItem,['label'])
                                                    }
                                                },
                                                footer:{
                                                    cancel:'取消',
                                                    confirm:'确认'
                                                }
                                            },true).then(res=> {
                                                brandItem.label = res;
                                                labelUpdateFun();
                                            }).catch(()=> {})
                                        },
                                    }
                                }) : undefined
                            ]
                        }),
                        createElement({
                            tagName:'div',
                            className:'brand-specs-text',
                            childs:()=> {
                                let updateSpecsTextFun:Function;
                                return [
                                    createUpdateElement(() =>({
                                        tagName:'span',
                                        innerText:getBrandSpecsText(brandItem),
                                        getUpdateFun(updateFun, ele) {
                                            updateSpecsTextFun = updateFun;
                                        },
                                    })),
                                    brandItem.isNewAdd ? createElement({
                                        tagName:'span',
                                        className:'edit-icon',
                                        innerText:'✍🏻',
                                        events:{
                                            "click"(e) {
                                                showDialog({
                                                    title:'新的规格',
                                                    content:{
                                                        default:getBrandSpecsText(brandItem),
                                                        validator(v) {
                                                            return validatorBrandSpecstext(v);
                                                        }
                                                    },
                                                    footer:{
                                                        cancel:'取消',
                                                        confirm:'确认'
                                                    }
                                                },true).then(res=> {
                                                    brandItem.specs = getBrandSpecsByText(res);
                                                    updateSpecsTextFun();
                                                }).catch(()=> {})
                                            },
                                        }
                                    }) : undefined
                                ]
                            }
                        }),
                        createElement({
                            tagName:'select',
                            className:'brand-priority',
                            attributes:{
                                value:brandItem.priority + ''
                            },
                            childs:objectKeys(brandPriorityMap).map(i=> {
                                return createElement({
                                    tagName:'option',
                                    attributes:{
                                        value:i,
                                    },
                                    innerText:brandPriorityMap[i]
                                })
                            })
                        }),
                        createElement({
                            tagName:'div',
                            className:'brand-deprecated',
                            innerText:brandItem.isDeprecated ? '激活' :'废弃',
                            events:{
                                "click"(e) {
                                    brandItem.isDeprecated = !brandItem.isDeprecated;
                                    updateBrandItemFun();
                                },
                            }
                        })
                    ]
                }
            }
        },brandListWrapper)
        if(newBrandItem) {
            fireTransition();
        }
    }
    async function fireTransition(){
        const wrapperNode = parentNode.querySelector(`.${wrapperName}`) as HTMLElement;
        if(!wrapperNode) return;
        // 设置高度
        wrapperNode.style.height = wrapperNode.scrollHeight + 'px';
        await waitEleDuration(wrapperNode,'active',true)
    }
    // 创建节点
    createUpdateElement(()=> {
        return {
            tagName:'div',
            className:wrapperName,
            childs:[
                // 品牌列表
                createElement({
                    tagName:'div',
                    className:'brand-list-wrapper',
                }),
                // 物料表单
                createElement({
                    tagName:'div',
                    className:'material-item-form',
                    childs:[
                        createComponent('my-input',{
                            unit:'日耗',
                            onStatusChange(status) {
                                materialItem.baseAverageDayUse = Number(status.value)
                            },
                        },{value:materialItem.baseAverageDayUse + ''}),
                        createComponent('my-input',{
                            unit:'min',
                            onStatusChange(status) {
                                materialItem.usage.min = Number(status.value)
                            },
                        },{value:materialItem.usage.min + ''}),
                        createComponent('my-input',{
                            unit:'max',
                            onStatusChange(status) {
                                materialItem.usage.max = Number(status.value)
                            },
                        },{value:materialItem.usage.max + ''}),
                        createElement({
                            tagName:'div',
                            className:'add-brand-item',
                            innerText:'增加品牌',
                            events:{
                                "click"(e) {
                                    const newBrandItem = getEmptyBrandItem()
                                    materialItem.list.push(newBrandItem);
                                    createBrandItem(newBrandItem,true);
                                },
                            }
                        })
                    ]
                })
            ]
        }
    },parentNode)!;
    materialItem.list.forEach(brandItem => createBrandItem(brandItem));
    await fireTransition();
}

export const myMaterials:ComponentExport<'my-materials'> = {
    componentName:'my-materials',
    content() {
        return {
            onMounted(shadowRoot, options, status) {
                let materialList:Array<MaterialItemAtEdit> = [];
                function createWrapper(){
                    removeChilds(shadowRoot);
                    materialList = getMaterialList();
                    createElement({
                        tagName:'div',
                        className:'wrapper',
                        childs:[
                            createElement({
                                tagName:'div',
                                className:'content',
                                hooks:{
                                    onMounted(ele) {
                                        materialList.forEach(materialItem => {
                                            createMaterialItemNode(shadowRoot,materialItem)
                                        })
                                    },
                                },
                                childs:[]
                            }),
                            createElement({
                                tagName:'div',
                                className:'footer',
                                childs:[
                                    createElement({
                                        tagName:'div',
                                        className:'footer-item',
                                        innerText:'增加物料',
                                        events:{
                                            "click"(e) {
                                                const newMaterialItem = getEmptyMaterialItem();
                                                materialList.push(newMaterialItem);
                                                const targetNode = createMaterialItemNode(shadowRoot,newMaterialItem)!;
                                                targetNode.scrollIntoView({
                                                    behavior:'smooth',
                                                    block:'center'
                                                })
                                            },
                                        }
                                    }),
                                    createElement({
                                        tagName:'div',
                                        className:'footer-item',
                                        innerText:'重置物料',
                                        events:{
                                            "click"(e) {
                                                createWrapper();
                                            },
                                        }
                                    }),
                                    createElement({
                                        tagName:'div',
                                        className:'footer-item',
                                        innerText:'更新物料',
                                        events:{
                                            "click"(e) {
                                                const errInfo = setMaterials(materialList);
                                                if(errInfo) {
                                                    const materialNodes = shadowRoot.querySelectorAll('.material-item-wrapper');
                                                    if(materialNodes) {
                                                        const targetNode = materialNodes[errInfo[1]] as HTMLElement;
                                                        if(targetNode) {
                                                            materialActive(targetNode).then(()=> {
                                                                showMessage({
                                                                    text:errInfo[0],
                                                                    type:'error',
                                                                    duration:2000
                                                                })
                                                            })
                                                        } 
                                                    }
                                                } else {
                                                    showMessage({
                                                        text:'更新成功',
                                                        type:'success',
                                                        duration:2000
                                                    }).then(()=> {
                                                        // pageBackThenOtherPageInto();
                                                    })
                                                }
                                            },
                                        }
                                    })
                                ]
                            })
                        ]
                    },shadowRoot)
                }
                createWrapper();
                function materialActive(targetNode:HTMLElement){
                    return new Promise((resolve) => {
                        targetNode.dispatchEvent(new CustomEvent('customClick',{
                            detail: {
                                target:targetNode,
                                resolve:resolve
                            },
                        }))
                    }).then(()=> {
                        targetNode.scrollIntoView({
                            behavior:'smooth',
                            block:'center'
                        })
                    })
                }
                const updateStatus:UpdateStatus = async (_status) => {
                    const targetItem = materialList.find(i => i.label === _status.activeLabel);
                    if(targetItem) {
                        function getTargetNode(){
                            return shadowRoot.querySelector(`.material-item-wrapper[data-label="${targetItem!.label}"]`) as HTMLElement;
                        }
                        console.log(targetItem.label)
                        await waitCondition(()=> !!getTargetNode(),2000)
                        await materialActive(getTargetNode());
                    }
                    return Promise.resolve(true)
                }
                updateStatus(status);
                options.returnUpdateStatusType(true);
                return {
                    updateStatus
                }
            },
            onDestroy(shadowRoot) {
                
            },
        }
    },
}
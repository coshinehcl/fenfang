import { CreateElementConfig, CustomElementExport,MaterialsItemAtEdit,MaterialsItem,BrandItem, GetArrayType } from '@types'
import { createElement,getEmptyMaterialItem ,showMessage,getMaterialList, objectKeys, createUpdateElement, getEmptyBrandItem,getSpecsText, setMaterialList, oneByone} from '@utils'
import { brandPriorityMap } from '@config'
export const myMaterials:CustomElementExport<'my-materials'> = {
    tagName:'my-materials',
    createNode(shadowRoot, options, stylePromise) {
        const materialFormList:Array<MaterialsItemAtEdit> = getMaterialList();
        function createForm(isAddMaterial?:boolean) {
            const wrapperNode = shadowRoot.querySelector('.wrapper');
            if(wrapperNode) {
                wrapperNode.remove();
            }
            createElement({
                tagName:'div',
                className:'wrapper',
                childs:[
                    {
                        tagName:'div',
                        className:'materials-wrapper',
                        attachedQueryNode:shadowRoot,
                        returnAttachedNode(ele){
                            const allFinishPromise = oneByone(materialFormList,async (materialItem) => {
                                await new Promise((resolve)=> {
                                    setTimeout(() => {
                                        resolve('')
                                    }, 50);
                                })
                                return createUpdateElement(()=> {
                                    let updateMaterialItemFun:Function;
                                    return {
                                        tagName:'div',
                                        className:`material-item ${materialItem.newAdd ? 'material-item-newAdd' : ''}`,
                                        returnUpdateFun(_updateFun) {
                                            updateMaterialItemFun = _updateFun;
                                        },
                                        childs:[
                                            {
                                                tagName:'div',
                                                className:'material-item-label-wrapper',
                                                childs:[
                                                    {
                                                        tagName:'div', 
                                                        className:'material-item-label',
                                                        innerHTML:`${materialItem.label}${materialItem.newAdd ? '&nbsp;✍🏻' :''}`,
                                                        events:{
                                                            "click"(e) {
                                                                if(materialItem.newAdd) {
                                                                    let newV:MaterialsItem['label'];
                                                                    showMessage('物料名称是什么',{
                                                                        input:{
                                                                            default:'',
                                                                            validate(v) {
                                                                                newV = v.toString().trim() as MaterialsItem['label'];
                                                                                if(!newV) {
                                                                                    return '不能为空'
                                                                                } else if(newV.length > 10) {
                                                                                    return '名称过长'
                                                                                } else if(materialFormList.map(i => i.label).includes(newV)) {
                                                                                    return '和已有物料名称重复'
                                                                                }
                                                                                return ''
                                                                            },
                                                                        }
                                                                    }).then(res => {
                                                                        if(res === '确定') {
                                                                            materialItem.label = newV;
                                                                            updateMaterialItemFun();
                                                                        }
                                                                    })
                                                                }
                                                            },
                                                        }
                                                    },
                                                    {
                                                        tagName:'div',
                                                        className:`material-item-isDeprecated ${materialItem.isDeprecated === true ? 'material-item-isDeprecated-true' : ''} `,
                                                        innerText:materialItem.isDeprecated === true ? '激活' : '废弃',
                                                        events:{
                                                            "click"(e) {
                                                                if(materialItem.isDeprecated) {
                                                                   delete materialItem.isDeprecated;
                                                                } else {
                                                                    materialItem.isDeprecated = true;
                                                                }
                                                                // 更新物料item
                                                                if(updateMaterialItemFun) {
                                                                    updateMaterialItemFun();
                                                                }
                                                            },
                                                        }
                                                    }
                                                ],
                                       
                                            },
                                            {
                                                tagName:'div',
                                                className:'brand-list-wrapper',
                                                childs:()=> {
                                                    if(materialItem.isDeprecated) return [];
                                                    return [
                                                        {
                                                            tagName:'div',
                                                            className:'brand-list',
                                                            childs:materialItem.list.map(brandItem => {
                                                                const selectOPtions = objectKeys(brandPriorityMap).map(i => {
                                                                    return {
                                                                        tagName:'option',
                                                                        attributes:{
                                                                            value:i,
                                                                        },
                                                                        innerText:brandPriorityMap[i]
                                                                    }
                                                                }) as Array<CreateElementConfig>
                                                                return {
                                                                    tagName:'div',
                                                                    className:`brand-item ${brandItem.newAdd ? 'brand-item-newAdd' : ''}`,
                                                                    childs:[
                                                                        createUpdateElement(()=> {
                                                                            let updateBrandLabelFun:Function; 
                                                                            return {
                                                                                tagName:'div',
                                                                                className:'brand-item-label',
                                                                                innerHTML:`${brandItem.label}${brandItem.newAdd ? '&nbsp;✍🏻' :''}`,
                                                                                returnUpdateFun(_updateFun) {
                                                                                    updateBrandLabelFun = _updateFun;
                                                                                },
                                                                                events:{
                                                                                    "click"(e) {
                                                                                        if(brandItem.newAdd) {
                                                                                            let newV:BrandItem['label'];
                                                                                            showMessage('品牌名称是什么',{
                                                                                                input:{
                                                                                                    default:'',
                                                                                                    validate(v) {
                                                                                                        newV = v.toString().trim() as BrandItem['label'];
                                                                                                        if(!newV) {
                                                                                                            return '不能为空'
                                                                                                        } else if(newV.length > 10) {
                                                                                                            return '名称过长'
                                                                                                        } else if(materialItem.list.map(i => i.label).includes(newV)) {
                                                                                                            return '和已有品牌名称重复'
                                                                                                        }
                                                                                                        return ''
                                                                                                    },
                                                                                                }
                                                                                            }).then(res => {
                                                                                                if(res === '确定') {
                                                                                                    brandItem.label = newV;
                                                                                                    updateBrandLabelFun();
                                                                                                }
                                                                                            })
                                                                                        }
                                                                                    },
                                                                                }
                                                                            }
                                                                        }),
                                                                        createUpdateElement(()=> {
                                                                            const specsText = getSpecsText(brandItem.specs);
                                                                            let updateSpecsTextFun:Function;
                                                                            return {
                                                                                tagName:'div',
                                                                                className:'brand-item-specs-text',
                                                                                innerHTML:`${specsText}${brandItem.newAdd ? '&nbsp;✍🏻' : ''}`,
                                                                                returnUpdateFun(updateFun) {
                                                                                    updateSpecsTextFun = updateFun;
                                                                                },
                                                                                events:{
                                                                                    "click"(e) {
                                                                                        if(brandItem.newAdd) {
                                                                                            let newSpecs:Array<GetArrayType<BrandItem['specs']>> = [];
                                                                                            showMessage('修改规格',{
                                                                                                input:{
                                                                                                    default:specsText !== '-' ? specsText : '',
                                                                                                    validate(v) {
                                                                                                        if(!v.trim()) {
                                                                                                             return '规格不能为空'
                                                                                                        }
                                                                                                        const _newSpecs = v.toString().trim().split('*').map(i => i.trim()).filter(Boolean);
                                                                                                        newSpecs = new Array(_newSpecs.length).fill('').map(i => ({
                                                                                                            unit:'',
                                                                                                            spec:0
                                                                                                        }))
                                                                                                        if(!newSpecs.length) {
                                                                                                            return '不能转换为有效规格'
                                                                                                        }
                                                                                                        let errorMsg = ''
                                                                                                        _newSpecs.some((str,index) => {
                                                                                                            const regex = /^(\d+)(.*)$/;
                                                                                                            const match = str.trim().match(regex);
                                                                                                            if(!match) {
                                                                                                                errorMsg = '格式不正确';
                                                                                                                return true;
                                                                                                            }
                                                                                                            // unit不能为空
                                                                                                            if(!match[2].trim()) {
                                                                                                                errorMsg = '单位不能为空';
                                                                                                                return true;
                                                                                                            }
                                                                                                            if(index > 0) {
                                                                                                                newSpecs[index -1].spec = Number(match[1])
                                                                                                            }
                                                                                                            if(index === _newSpecs.length -1) {
                                                                                                                newSpecs[index].spec = 1;
                                                                                                            }
                                                                                                            newSpecs[index].unit = match[2].trim();
                                                                                                        });
                                                                                                        return errorMsg;
                                                                                                    },
                                                                                                }
                                                                                            }).then(res => {
                                                                                                if(res === '确定') {
                                                                                                    brandItem.specs = newSpecs;
                                                                                                    updateSpecsTextFun();
                                                                                                }
                                                                                            })
                                                                                        }
                                                                                    },
                                                                                }
                                                                            }
                                                                        }),
                                                                        {
                                                                            tagName:'select',
                                                                            className:'brand-item-priority',
                                                                            attributes:{
                                                                                placeholder:'选择出库优先级',
                                                                                value:''
                                                                            },
                                                                            childs:[
                                                                                {
                                                                                    tagName:'option',
                                                                                    attributes:{
                                                                                        value:'',
                                                                                    },
                                                                                    innerText:'请选择出库优先级'
                                                                                },
                                                                                ...selectOPtions
                                                                            ]
                                                                        },
                                                                        createUpdateElement(()=> {
                                                                            let updateFun:Function;
                                                                            return {
                                                                                tagName:'div',
                                                                                className:`brand-item-isDeprecated ${brandItem.isDeprecated === true ? 'brand-item-isDeprecated-true' : ''} `,
                                                                                innerText:brandItem.isDeprecated === true ? '激活' : '废弃',
                                                                                returnUpdateFun(_updateFun) {
                                                                                    updateFun = _updateFun;
                                                                                },
                                                                                events:{
                                                                                    "click"(e) {
                                                                                        if(brandItem.isDeprecated) {
                                                                                           delete brandItem.isDeprecated;
                                                                                        } else {
                                                                                            brandItem.isDeprecated = true;
                                                                                        }
                                                                                        // 更新本节点
                                                                                        if(updateFun) {
                                                                                            updateFun();
                                                                                        }
                                                                                    },
                                                                                }
                                                                            }
                                                                        })
                                                                    ]
                                                                }
                                                            })
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                tagName:'div',
                                                className:'material-item-form',
                                                childs:()=> {
                                                    if(materialItem.isDeprecated) return [];
                                                    return [
                                                        {
                                                            tagName:'div',
                                                            className:'material-item-inputs',
                                                            childs:[
                                                                {
                                                                    tagName:'div',
                                                                    className:'material-item-input-wrapper',
                                                                    childs:[
                                                                        {
                                                                            tagName:'span',
                                                                            className:'material-item-input-label',
                                                                            innerText:'日耗',
                                                                        },
                                                                        {
                                                                            tagName:'input',
                                                                            attributes:{
                                                                                value:materialItem.baseAverageDayUse + '',
                                                                                type:'number',
                                                                                placeholder:'日耗基准',
                                                                                'data-label':'日耗'
                                                                            },
                                                                            events:{
                                                                                "input"(e) {
                                                                                    const eleTarget = (e.target as HTMLInputElement)
                                                                                    const v = eleTarget.value;
                                                                                    if(!v.trim()) {
                                                                                        eleTarget.value = '';
                                                                                        return;
                                                                                    }
                                                                                    let numberV = Number(v);// '' => 0
                                                                                    if(!isNaN(numberV)) {
                                                                                        eleTarget.value = numberV + '';
                                                                                        materialItem.baseAverageDayUse = numberV;
                                                                                    } else {
                                                                                        eleTarget.value = '';
                                                                                    }
                                                                                },
                                                                            }
                                                                        }
                                                                    ]
                                                                },
                                                                {
                                                                    tagName:'div',
                                                                    className:'material-item-input-wrapper',
                                                                    childs:[
                                                                        {
                                                                            tagName:'span',
                                                                            className:'material-item-input-label',
                                                                            innerText:'min',
                                                                        },
                                                                        {
                                                                            tagName:'input',
                                                                            className:'material-item-input',
                                                                            attributes:{
                                                                                value:materialItem.uasge.min + '',
                                                                                type:'number',
                                                                                placeholder:'最小出库量',
                                                                                'data-label':'min'
                                                                            },
                                                                            events:{
                                                                                "input"(e) {
                                                                                    const eleTarget = (e.target as HTMLInputElement)
                                                                                    const v = eleTarget.value;
                                                                                    if(!v.trim()) {
                                                                                        eleTarget.value = '';
                                                                                        return;
                                                                                    }
                                                                                    let numberV = Number(v);// '' => 0
                                                                                    if(!isNaN(numberV)) {
                                                                                        eleTarget.value = numberV + '';
                                                                                        materialItem.uasge.min = numberV;
                                                                                    } else {
                                                                                        eleTarget.value = '';
                                                                                    }
                                                                                },
                                                                            }
                                                                        },
                                                                    ]
                                                                },
                                                                {
                                                                    tagName:'div',
                                                                    className:'material-item-input-wrapper',
                                                                    childs:[
                                                                        {
                                                                            tagName:'span',
                                                                            className:'material-item-input-label',
                                                                            innerText:'max',
                                                                        },
                                                                        {
                                                                            tagName:'input',
                                                                            className:'material-item-input',
                                                                            attributes:{
                                                                                value:materialItem.uasge.max + '',
                                                                                type:'number',
                                                                                placeholder:'最大出库量',
                                                                                'data-label':'max'
                                                                            },
                                                                            events:{
                                                                                "input"(e) {
                                                                                    const eleTarget = (e.target as HTMLInputElement)
                                                                                    const v = eleTarget.value;
                                                                                    if(!v.trim()) {
                                                                                        eleTarget.value = '';
                                                                                        return;
                                                                                    }
                                                                                    let numberV = Number(v);// '' => 0
                                                                                    if(!isNaN(numberV)) {
                                                                                        eleTarget.value = numberV + '';
                                                                                        materialItem.uasge.max = numberV;
                                                                                    } else {
                                                                                        eleTarget.value = '';
                                                                                    }
                                                                                },
                                                                            }
                                                                        },
                                                                    ]
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            tagName:'div',
                                                            className:'material-item-btns',
                                                            childs:[
                                                                {
                                                                    tagName:'span',
                                                                    className:'material-item-btn',
                                                                    innerText:'新增品牌',
                                                                    events:{
                                                                        "click"(e) {
                                                                            materialItem.list.push(getEmptyBrandItem());
                                                                            updateMaterialItemFun();
                                                                        },
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                },ele)
                            })
                            if(isAddMaterial) {
                                allFinishPromise.then(res => {
                                    console.log('finish')
                                    const allItems = ele.querySelectorAll('.material-item') as NodeListOf<HTMLElement>;
                                    const lastItem = Array.from(allItems).slice(-1)[0];
                                    if(lastItem) {
                                        lastItem.scrollIntoView({
                                            behavior:'smooth'
                                        })
                                    }
                                })
                            }
                        }
                    },
                    {
                        tagName:'div',
                        className:'materials-submit',
                        childs:[
                            {
                                tagName:'div',
                                className:'materials-submit-item',
                                innerText:'新增物料',
                                events:{
                                    "click"(e) {
                                        const newBrandItem = getEmptyBrandItem();
                                        const newMaterialItem = getEmptyMaterialItem();
                                        newMaterialItem.list.push(newBrandItem);
                                        materialFormList.push(newMaterialItem);
                                        createForm(true);
                                    },
                                }
                            },
                            {
                                tagName:'div',
                                className:'materials-submit-item',
                                innerText:'更新',
                                events:{
                                    "click"(e) {
                                        // 本组件内的逻辑处理好
                                        const saveList:Array<MaterialsItem> = []
                                        materialFormList.forEach(materialItem => {
                                            const newMaterialItem:MaterialsItemAtEdit = JSON.parse(JSON.stringify(materialItem));
                                            delete newMaterialItem.newAdd;
                                            newMaterialItem.list.forEach(brandItem => {
                                                delete brandItem.newAdd
                                            })
                                            saveList.push(newMaterialItem);
                                        })
                                        const saveMsg = setMaterialList(saveList);
                                        if(saveMsg) {
                                            showMessage(saveMsg)
                                        } else {
                                            showMessage('更新成功').then(res => {
                                                createForm();
                                            });
                                        }
                                    },
                                }
                            },
                            {
                                tagName:'div',
                                className:'materials-submit-item',
                                innerText:'重置',
                                events:{
                                    "click"(e) {
                                        materialFormList.splice(0,materialFormList.length,...getMaterialList());
                                        createForm();
                                    },
                                }
                            }
                        ]
                    }
                ]
               
            },shadowRoot)
        }
        stylePromise.then(res => createForm());
    },
}
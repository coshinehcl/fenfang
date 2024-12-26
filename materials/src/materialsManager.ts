import {ActionHandler,MaterialsItem} from '@types'
import { materialsList,getNewMaterialsList,setNewMaterialsList } from '@config/materialsList'
import { createElement,createCustomElement,cloneData, removeChilds } from '@utils'
export const materialsManager:ActionHandler = async (parentNode,params) => {
    const sys_materialsList = cloneData(materialsList);
    const new_materialsList = cloneData(getNewMaterialsList());
    function render(){
        removeChilds(parentNode);
        createElement({
            tagName:'div',
            className:'matetials-manager-wrapper',
            childs:[
                {
                    tagName:'div',
                    className:'matetials-list-wrapper',
                    childs:new_materialsList.map(materialItem => {
                        return {
                            tagName:'div',
                            className:'matetial-item',
                            returnNode(ele){
                                params.pageNavManager.addPageNav(ele,materialItem.label)
                            },
                            childs:[
                                createCustomElement('my-material-item',{
                                    data:materialItem,
                                    params:{}
                                })
                            ]
                        }
                    })
                },
                {
                    tagName:'div',
                    className:'form-submit-wrapper',
                    returnNode(ele){
                        params.pageNavManager.addPageNav(ele,'提交区')
                    },
                    childs:[
                        {
                            tagName:'div',
                            className:'form-submit-item',
                            innerText:'新增物料',
                            events:{
                                click(e) {
                                    const label = window.prompt('物料名称') || '';
                                    if(!label.trim()) return;
                                    new_materialsList.push({
                                        label:label as MaterialsItem['label'],
                                        list:[],
                                        unit:'个',
                                        uasge:{min:0,max:1000}
                                    })
                                    render();
                                }
                            }
                        },
                        {
                            tagName:'div',
                            className:'form-submit-item',
                            innerText:'更新',
                            events:{
                                click(e){
                                    setNewMaterialsList(new_materialsList);
                                    location.reload(); // 需要更新记录列表
                                }
                            }
                        },
                        {
                            tagName:'div',
                            className:'form-submit-item',
                            innerText:'恢复系统',
                            events:{
                                click(){
                                    setNewMaterialsList(sys_materialsList);
                                    location.reload(); // 需要更新记录列表
                                }
                            }
                        }
                    ]
                }
            ]
        },parentNode)
    }
    render();
}

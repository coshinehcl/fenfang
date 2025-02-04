import { ComponentsExport,BrandItem,GetArrayType } from '@types'
import { createElement } from '@utils'
export const myMaterialItem:ComponentsExport<'my-material-item'> = {
    tagName:'my-material-item',
    cssName:'materialItem',
    createNode(shadowRoot,data,params){
        while(shadowRoot.firstChild) {
            shadowRoot.removeChild(shadowRoot.firstChild);
        }
        let wrapperNode:Element;
        function render(){
            if(wrapperNode) {
                shadowRoot.removeChild(wrapperNode)
            }
            wrapperNode = createElement({
                tagName:'div',
                className:'wrapper',
                childs:[
                    {
                        tagName:'div',
                        className:'material-label',
                        innerText:data.label
                    },
                    {
                        tagName:'div',
                        className:'usage-wrapper',
                        childs:[
                            {
                                tagName:'div',
                                style:{
                                    paddingRight:'10px'
                                },
                                innerText:'出库范围'
                            },
                            {
                                tagName:'input',
                                attributes:{
                                    value:data.uasge.min,
                                    placeHolder:'min',
                                    type:'number'
                                },
                                events:{
                                    change(e:Event) {
                                        data.uasge.min = Number((e.target as HTMLInputElement).value)
                                    }
                                }
                            },
                            {
                                tagName:'input',
                                attributes:{
                                    value:data.uasge.max,
                                    placeHolder:'max',
                                    type:'number'
                                },
                                events:{
                                    change(e:Event) {
                                        data.uasge.max = Number((e.target as HTMLInputElement).value)
                                    }
                                }
                            },
                        ]
                    },
                    {
                        tagName:'div',
                        className:'material-brands-wrapper',
                        childs:data.list.map((brandItem,brandIndex) => {
                            return {
                                tagName:'div',
                                className:'brand-item',
                                childs:[
                                    {
                                        tagName:'div',
                                        className:'brand-label-wrapper',
                                        childs:[
                                            {
                                                tagName:'div',
                                                className:`brand-label ${brandItem.isDeprecated ? 'deprecated' : ''}`,
                                                innerText:brandItem.label
                                            },
                                            {
                                                tagName:'div',
                                                className:'brand-remove',
                                                innerText:brandItem.isDeprecated ? '废弃' : '激活',
                                                events:{
                                                    click(e){
                                                        brandItem.isDeprecated = !brandItem.isDeprecated;
                                                        render();
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        tagName:'div',
                                        className:'brand-specs-wrapper',
                                        style:{
                                            display:brandItem.isDeprecated ? 'none' : 'block'
                                        },
                                        childs:brandItem.specs.map((specItem,specIndex) => {
                                            return {
                                                tagName:'div',
                                                className:'spec-wrapper',
                                                childs:[
                                                    {
                                                        tagName:'input',
                                                        attributes:{
                                                            value:specItem.unit
                                                        },
                                                        events:{
                                                            change(e:Event) {
                                                                specItem.unit = (e.target as HTMLInputElement).value as typeof specItem['unit']
                                                            }
                                                        }
                                                    },
                                                    {
                                                        tagName:'input',
                                                        style:{
                                                            marginRight:'auto'
                                                        },
                                                        attributes:{
                                                            value:specItem.spec,
                                                            type:'number'
                                                        },
                                                        events:{
                                                            change(e:Event) {
                                                                specItem.spec = Number((e.target as HTMLInputElement).value || 1) as typeof specItem['spec']
                                                            }
                                                        }
                                                    },
                                                    {
                                                        tagName:'div',
                                                        className:'btn',
                                                        innerText:'移除',
                                                        events:{
                                                            click(e:Event){
                                                                if(brandItem.specs.length === 1) {
                                                                    alert('最后一项不允许移除');
                                                                    return;
                                                                }
                                                                const confirm = window.confirm('确定移除吗');
                                                                if(!confirm) return;
                                                                brandItem.specs.splice(specIndex,1);
                                                                render();
                                                            }
                                                        }
                                                    },
                                                    {
                                                        tagName:'div',
                                                        className:'btn',
                                                        innerText:'新增',
                                                        events:{
                                                            click(e:Event){
                                                                brandItem.specs.splice(specIndex + 1,0,{
                                                                    unit:'' as GetArrayType<BrandItem['specs']>['unit'],
                                                                    spec:1
                                                                });
                                                                render();
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        })
                                    }
                                ]
                               
                            }
                        })
                    },
                    {
                        tagName:'div',
                        className:'material-brand-add-wrapper',
                        childs:[
                            {
                                tagName:'div',
                                className:'btn',
                                style:{
                                    width:'140px'
                                },
                                innerText:'新增品牌',
                                events:{
                                    click(e:Event){
                                        const label = window.prompt('新的品牌名称') || '';
                                        if(!label.trim()) return;
                                        data.list.push({
                                            label,
                                            specs:[{
                                                unit:'' as GetArrayType<BrandItem['specs']>['unit'],
                                                spec:1
                                            }],
                                            priority:1
                                        })
                                        render();
                                    }
                                }
                            }
                        ]
                    }
                ]
            },shadowRoot)
        }
        render();
    }
}
import { ComponentExport,ComponentConfigMap } from '@types'
import { createElement, createUpdateElement, globalRouterManager } from '@utils'
import { pageHeadBtns } from '@config'

type updateHeadFun = ComponentConfigMap['my-page-head']['exposeMethods']['updateStatus'];
export const myPageHead:ComponentExport<'my-page-head'> = {
    componentName:'my-page-head',
    content() {
        const headItemCss = 'head-item';
        return {
            onMounted(shadowRoot, options, status) {
                const updateHead:updateHeadFun =(_status) => {
                    const wrapper = shadowRoot.querySelector('.wrapper');
                    if(wrapper) {
                        wrapper.remove();
                    }
                    createElement({
                        tagName:'div',
                        className:'wrapper',
                        childs:[...pageHeadBtns.map(i => {
                            return createElement({
                                tagName:'div',
                                className:`${headItemCss} ${i.label === _status.label ? 'active' : ''}`,
                                innerText:i.label,
                                attributes:{
                                    'data-label':i.label
                                },
                                events:{
                                    "click"(e) {
                                        const findItemConfig = pageHeadBtns.find(_i => _i.label === i.label)!;
                                        globalRouterManager.pageForward({
                                            pageName:i.label,
                                            pageStatus:findItemConfig?.status || {}
                                        })
                                    },
                                }
                            })
                        }),globalRouterManager.isAllowBack ? createElement({
                            tagName:'div',
                            className:headItemCss,
                            innerText:'返回',
                            events:{
                                "click"(e) {
                                    globalRouterManager.pageBack();
                                },
                            }
                        }) : undefined],
                    },shadowRoot)
                    return Promise.resolve(true);
                }
                updateHead(status);
                globalRouterManager.onAllowBackChange(()=> {
                    updateHead({label:globalRouterManager.currentPage.pageName as any});
                });
                globalRouterManager.onPageChange((pageItem)=> {
                    updateHead({label:pageItem.page.pageName as any});
                })
                return {
                    updateStatus:updateHead,
                }
            },
            onDestroy(shadowRoot) {
                console.log('destroy')
            },
        }
    },
}
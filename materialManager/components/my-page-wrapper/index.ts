import { ComponentExport,PageHeadLabelMap,ComponentConfigMap, CreateElementConfig} from '@types'
import { createElement, createComponent, createUpdateElement,objectPick, cloneData,globalRouterManager } from '@utils'
import { pageHeadBtns } from '@config'
type updatePageFun = ComponentConfigMap['my-page-wrapper']['exposeMethods']['updateStatus'];
export const myPageWrapper:ComponentExport<'my-page-wrapper'> = {
    componentName:'my-page-wrapper',
    content() {
        return {
            onMounted(shadowRoot, options, status) {
                const updateStatus:updatePageFun = (_status) => {
                    globalRouterManager.pageForward({
                        pageName:_status.label,
                        pageStatus:_status.status
                    })
                    const wrapper = shadowRoot.querySelector('.wrapper');
                    if(wrapper) {
                        wrapper.remove();
                    }
                    createElement({
                        tagName:'div',
                        className:'wrapper',
                        childs:[
                            createComponent('my-page-head',{},{label:status.label}),
                            createComponent('my-page-body',{},status)
                        ]
                    },shadowRoot)
                    return Promise.resolve(true);
                }
                updateStatus(status);
                return {
                    updateStatus
                }
            },
            onDestroy(shadowRoot) {
                
            },
        }
    }
}
import components from '@components'
import { initComponent,appendChildElements,createComponent,objectPick,showDialog,showMessage } from '@utils'
import { getDefaultHeadItem } from '@config'
import { RouterManager,TaskManager } from '@utils'
function main(){
    // 初始化组件
    components.forEach(item => {
        initComponent(item)
    })
    // 创建组件
    const defaultHeadItem = getDefaultHeadItem();
    appendChildElements(document.body,[
        createComponent('my-page-wrapper',{},objectPick(defaultHeadItem,['label','status']))
    ])
}
main();

const taskManager = new TaskManager();

import { ComponentExport,PageHeadBtns,ComponentConfigMap, MyComponent } from '@types'
import { createElement, createComponent ,waitEleDuration, cloneData,TaskManager, globalRouterManager, appendChildElements, getRecordListBase, getCurrentDate, showMessage, setRecordList, setRecordListBase, showDialog } from '@utils'
import { storageKeys } from '@config'
type updateFun = ComponentConfigMap['my-others']['exposeMethods']['updateStatus'];
const taskManager = new TaskManager();
export const myOthers:ComponentExport<'my-others'> = {
    componentName:'my-others',
    content() {
        return {
            onMounted(shadowRoot, options, status) {
                const updateStatus:updateFun = (_status) => {
                    createElement({
                        tagName:'div',
                        className:'wrapper',
                        childs:[
                            createElement({
                                tagName:'div',
                                className:'item',
                                innerText:'导入',
                                events:{
                                    "click"(e) {
                                        // 导入
                                        const input = createElement({
                                            tagName:'input',
                                            attributes:{
                                                type:'file',
                                                id:'inOutInput',
                                                accept:'.json'
                                            },
                                            events:{
                                                "input"(e) {
                                                    const target = e.currentTarget;
                                                    if(!target || !target.files) return;
                                                    const file = target.files[0];
                                                    if (file.type !== 'application/json') {
                                                        showMessage({
                                                            text:'请选择json文件',
                                                            type:'warn',
                                                            duration:2000
                                                        })
                                                        return;
                                                    }
                                                    const reader = new FileReader();
                                                    reader.onload = function(e) {
                                                        let jsonData:any;
                                                        if(!e.target) {
                                                            return;
                                                        }
                                                        try {
                                                            jsonData = JSON.parse(e.target.result as string);
                                                        } catch (error) {
                                                            showMessage({
                                                                text:'json格式不正确',
                                                                type:'warn',
                                                                duration:2000
                                                            })
                                                            return;
                                                        }
                                                        const err = setRecordListBase(jsonData.list);
                                                        if(err) {
                                                            showMessage({
                                                                text:err,
                                                                type:'warn',
                                                                duration:2000
                                                            })
                                                        } else {
                                                            showMessage({
                                                                text:'导入成功',
                                                                type:'success',
                                                                duration:2000
                                                            })
                                                        }
                                                    };
                                                    reader.readAsText(file);
                                                },
                                            }
                                        })!
                                        input.click();

                                    },
                                }
                            }),
                            createElement({
                                tagName:'div',
                                className:'item',
                                innerText:'导出',
                                events:{
                                    "click"(e) {
                                        async function downloadJSON() {
                                            const list = await getRecordListBase();
                                            // 将数据转换为JSON字符串
                                            const jsonString = JSON.stringify({
                                                list
                                            }, null, 2); // 格式化JSON字符串，增加可读性
                                            // 创建一个Blob对象
                                            const blob = new Blob([jsonString], { type: 'application/json' });
                                            // 创建一个链接元素
                                            const link = document.createElement('a');
                                            // 设置链接的href为Blob对象的URL
                                            link.href = URL.createObjectURL(blob);
                                            // 设置下载的文件名
                                            link.download = `仓库${getCurrentDate().fullStr}`;
                                            // 触发点击事件以下载文件
                                            link.click();
                                            // 释放Blob URL
                                            URL.revokeObjectURL(link.href);
                                        }
                                        downloadJSON().then(res => {
                                            showMessage({
                                                text:'导出成功',
                                                type:'success',
                                                duration:2000
                                            })
                                        })
                                    },
                                }
                            }),
                            createElement({
                                tagName:'div',
                                className:'item',
                                innerText:'清除缓存',
                                events:{
                                    "click"(e) {
                                        showDialog({
                                            title:'请选择',
                                            content:{
                                                default:'',
                                                validator:(v) => {
                                                    return ''
                                                },
                                                list:storageKeys.map(i => ({
                                                    label:i,
                                                    value:i
                                                }))
                                            },
                                            footer:{
                                                cancel:'取消',
                                                confirm:'确认'
                                            }
                                        },true).then(res => {
                                            if(res) {
                                                console.log(res);
                                                localStorage.removeItem(res);
                                                showMessage({
                                                    text:'清除成功',
                                                    type:'success',
                                                    duration:2000
                                                })
                                            }
                                        })
                                    },
                                }
                            }),
                        ]
                    },shadowRoot)
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
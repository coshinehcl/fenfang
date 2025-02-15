import { ActionHandler } from '@types'
import { createElement,getRecordList, setRecordList,removeRecordList,getCurrentDate } from '@utils'
export const inOutData:ActionHandler = (parentNode,params) => {
    const jsonId = '仓库物料'
    function downloadJSON() {
        // 将数据转换为JSON字符串
        const jsonString = JSON.stringify({
            jsonId, // 作为鉴别是不是本json
            list:getRecordList()
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
    createElement({
        tagName:'div',
        className:'in-out-block',
        childs:[{
            tagName:'input',
            attributes:{
                type:'file',
                id:'inOutInput',
                accept:'.json'
            },
            style:{
                display:'none'
            },
            events:{
                input(event:Event){
                    const target = event.target as HTMLInputElement;
                    if(!target || !target.files) return;
                    const file = target.files[0];
                    if (file.type !== 'application/json') {
                        alert('请选择 JSON 文件！')
                        target.value = ''; // 清空选择
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        let jsonData;
                        if(!e.target) {
                            return;
                        }
                        try {
                            jsonData = JSON.parse(e.target.result as string);
                        } catch (error) {
                            alert('文件内容不是有效的 JSON 格式！');
                            return;
                        }
                        if(jsonData && jsonData.jsonId === jsonId) {
                            // 进一步校验数据格式
                            setRecordList(jsonData.list);
                            alert('导入成功')
                        } else {
                            alert('JSON 格式不对，请检查！');
                        }
                        target.value = ''; // 清空
                    };
                    reader.readAsText(file);
                }
            }
        },{
            tagName:'label',
            className:'in-out-btn',
            innerText:'导入',
            attributes:{
                for:'inOutInput'
            }
        },{
            tagName:'div',
            className:'in-out-btn',
            innerText:'导出',
            events:{
                click(){
                    downloadJSON();
                }
            }
        },{
            tagName:'div',
            className:'in-out-btn',
            innerText:'清空本地缓存',
            events:{
                click(){
                    const confirm = window.confirm('确认清空吗？')
                    if(confirm) {
                        removeRecordList();
                        alert('已清空，恢复默认数据');
                        location.reload()
                    }
                }
            }
        }]
    },parentNode)
}
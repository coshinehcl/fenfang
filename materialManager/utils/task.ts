import { GetPromiseAndParams } from "./tsHelper"

// ts-type
type TaskReturn<T = any> = Promise<T> | T
type TaskFirstParams = [
    setNextTaskId:(nextTaskId:string) => void,
    stop:()=>void,
]
type TaskMiddleParams = [
    preStatus:'success' | 'fail',
    preResult:any,
    preTaskId:string | undefined,
    ...TaskFirstParams
]
type TaskGhost<T extends Function> = T | {
    task:T,
    rollback?:()=>TaskReturn,
    taskId?:string,
    nextTaskId?:string
}
type TaskFirst = TaskGhost<(...args:TaskFirstParams)=>TaskReturn>
type TaskMiddle<T = any> = TaskGhost<(...args:TaskMiddleParams)=>TaskReturn<T>>
type Tasks<T> = [TaskFirst,...Array<TaskMiddle>,TaskMiddle<T>]
type TaskFailStrategy = 'continue' | 'rollback' | 'stop'
type TasksConfig = {
    tasks:Tasks<any>,
    failStrategy:TaskFailStrategy,
    controller:AbortController,
    resolve:(value?: any) => void,
    reject:(reason?: any) => void
}
/**
 * 任务队列
 *  - 支持外部中断，被中断会执行回滚
 *  - 支持内部中断
 *  - 支持顺序执行和跳转执行任务
 * 多个任务队列
 *  - 多个任务队列串行
 *  - 支持中断之前的任务队列
 * 任务队列取消
 *  - 调用cancel会对多个任务队列执行取消
 */
export class TaskManager {
    private tasksList:Array<TasksConfig>
    private isProcessing = false;
    constructor(){
        this.tasksList = []
    }
    /**
     * 任务添加器
     * @param tasks 
     * @param failStrategy 
     * @param abortPreTasks 
     * @returns 
     */
    execute<T>(tasks:Tasks<T>,failStrategy:TaskFailStrategy,abortPreTasks=true):Promise<T> {
        if(abortPreTasks) {
            this.cancel('有新的任务队列要执行，中断之前任务队列');
        }
        const [promise,resolve,reject] = GetPromiseAndParams<T>();
        const controller = new AbortController();
        this.tasksList.push({tasks,failStrategy,controller,resolve,reject});
        this.processQueue();
        return promise
    }
    /**
     * 任务触发器
     */
    async processQueue(){
       if(this.isProcessing) return;
       this.isProcessing = true;
       while (this.tasksList.length > 0) {
            const tasksConfig = this.tasksList[0]!;
            try {
                await this.fireTasks(tasksConfig)
            } catch(err){
                console.error('执行器执行出错',err)
            }
            // 执行完后，再移除列表，避免cancel拿不到这个任务列表
            this.tasksList.shift();
       }
       this.isProcessing = false;
    }
    /**
     * 任务执行器
     * @param tasksConfig 
     */
    fireTasks(tasksConfig:TasksConfig){
        const {tasks,failStrategy,controller,resolve:taskResolve,reject:taskReject} = tasksConfig;
        // 本身逻辑确保不能出现异常
        return new Promise<void>((resolve,reject) => {
            // 如果任务执行时，以及告知中断，则不再执行
            if(controller.signal.aborted) {
                reject(new Error(controller.signal.reason));
                return;
            }
            // 格式化taskItem
            const taskList = tasks.map(item => {
                return typeof item === 'function' ? {
                    task:item,
                    rollback:()=>{},
                    taskId:undefined,
                    nextTaskId:undefined
                } : item
            })
            const fireTaskIndexList:number[] = [];
            let isStop = false;
            let preStatus!:TaskMiddleParams[0],preResult!:TaskMiddleParams[1];
            let nextTaskIndex:number | undefined = 0;
            function stop(){
                isStop = true;
            }
            function setNextTaskId(taskId:string){
                const findIndex = taskList.findIndex(item => item.taskId === taskId && taskId);
                if(findIndex !== -1) {
                    nextTaskIndex = findIndex;
                } else {
                    console.error(`不存在taskId为${taskId}的任务，当前任务队列不再继续执行`);
                    stop();
                }
            }
            function getPreTaskId(index:number){
                if(taskList.length && index <= taskList.length -1) {
                    return taskList[index].taskId
                }
                return undefined;
            }
            async function rollback(){
                while(fireTaskIndexList.length) {
                    const fireIndex = fireTaskIndexList.pop();
                    if(fireIndex !== undefined) {
                        try {
                            await taskList[fireIndex].rollback?.();
                        } catch(err){
                            console.error('rollback执行失败',taskList[fireIndex])
                        }
                    }
                }
            }
            const abortPromise = new Promise<void>((_resolve) => {
                controller.signal.addEventListener('abort',()=> {
                    _resolve();
                },{once:true})
            });
            // 执行任务队列中的任务
            (async ()=>{
                while(nextTaskIndex !== undefined && taskList[nextTaskIndex]) {
                    const currentTaskIndex:number = nextTaskIndex;
                    nextTaskIndex = undefined; // 重置
                    // 执行当前task
                    fireTaskIndexList.push(currentTaskIndex);
                    let taskParams:TaskFirstParams | TaskMiddleParams;
                    if(currentTaskIndex === 0) {
                        taskParams = [setNextTaskId,stop]
                    } else {
                        taskParams = [preStatus,preResult,getPreTaskId(currentTaskIndex -1),setNextTaskId,stop]
                    }
                    const taskPromise = Promise.resolve((taskList[currentTaskIndex].task as any)(...taskParams)).then((res:any) => {
                        preStatus = 'success';
                        preResult = res;
                    }).catch((err:any) => {
                        preStatus = 'fail';
                        preResult = err;
                    })
                    // 加快速度
                    await Promise.race([taskPromise,abortPromise]);
                    // 检查是否内部中断
                    if(isStop) {
                        console.log('当前任务队列被中断',tasks,currentTaskIndex);
                        preStatus === 'success' ? resolve(preResult) : reject(preResult);
                        break;
                    }
                    // 检查是否外部中断
                    if(controller.signal.aborted) {
                        await rollback();
                        reject(new Error(controller.signal.reason))
                        break;
                    }
                    // 是否执行下一个任务
                    if(preStatus === 'fail') {
                        if(failStrategy === 'rollback') {
                            console.log('当前任务失败,执行回滚',tasks,currentTaskIndex);
                            await rollback();
                            reject(preResult);
                            break;
                        }
                        if(failStrategy === 'stop') {
                            console.log('当前任务失败,中断执行',tasks,currentTaskIndex);
                            reject(preResult);
                            break;
                        }
                    }
                    // 设置下一个任务
                    if(nextTaskIndex === undefined){
                        nextTaskIndex = currentTaskIndex + 1;
                    }
                }
                // 任务执行完成
                preStatus === 'success' ? resolve(preResult) : reject(preResult);
            })();
        }).then(res => {
            taskResolve(res);
        }).catch(err => {
            taskReject(err);
        })
    }
    // 取消
    cancel(reason:any){
        this.tasksList.forEach(tasksConfig => {
            if(!tasksConfig.controller.signal.aborted) {
                // 只通知一次
                tasksConfig.controller.abort(reason);
            }
        })
    }
}
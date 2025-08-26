import { cloneData } from "./tsHelper";

export class EventEmitter<T extends Record<string,any>> {
    private events = new Map<string,any[]>();
    /**
     * 注册事件
     * @param eventName 事件名称
     * @param handler 事件句柄
     * @returns 清理函数
     */
    on<K extends Extract<keyof T,string>>(eventName:K,handler:(data:T[K])=>void) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        const handlers = this.events.get(eventName)!;
        handlers.push(handler);
        return () => {
            this.off(eventName, handler);
        };
    }
    /**
     * 事件移除
     * @param eventName 事件名称
     * @param handler 事件句柄
     */
    off<K extends Extract<keyof T,string>>(eventName:K,handler:(data:T[K])=>void) {
        let handlers = this.events.get(eventName);
        if (!handlers || !handlers.length) return;
        handlers = handlers.filter(i => i!== handler);
        if(!handlers.length) {
            this.events.delete(eventName);
        } else {
            this.events.set(eventName,handlers)
        }
    }
    /**
     * 事件清空
     */
    clear(){
        this.events.clear();
    }
    /**
     * 事件触发
     * @param eventName 事件名称
     * @param data 传递给事件处理函数的数据
     * @returns 
     */
    emit<K extends Extract<keyof T,string>>(eventName:K,data:T[K]) {
        let handlers = this.events.get(eventName);
        if(!handlers) return Promise.resolve();
        const handlersPromise = handlers.map(handler => {
            return Promise.resolve(handler(cloneData(data)))
        })
        return Promise.all(handlersPromise);
    }
}
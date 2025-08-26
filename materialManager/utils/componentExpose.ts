// 这边提供一些供全局消费的组件的api
import { ComponentConfigMap,MyComponent } from '@types'
import { createComponent, createReuseComponent } from './components'

function componentUpdateStatus<T extends keyof ComponentConfigMap>(componentName:T,
    status:ComponentConfigMap[T]['status'],
    options:ComponentConfigMap[T]['options'],
    methodName:keyof ComponentConfigMap[T]['exposeMethods'] = 'updateStatus'
) {
    let component = document.querySelector(componentName) as MyComponent<typeof componentName>;
    if(!component) {
        component = createComponent(componentName,options || {},status);
        document.body.appendChild(component);
    }
    return component.$getExposeMethods().then(res => {
        return (res[methodName] as any)(status as any)
    })
}
type ShowMessage = ComponentConfigMap['my-message']['exposeMethods']['updateStatus'];
export const showMessage:ShowMessage = (status) => {
    return componentUpdateStatus('my-message',status,{})
}
type ShowDialog = ComponentConfigMap['my-dialog']['exposeMethods']['showDialog'];
export const showDialog:ShowDialog = (status,waitClosed) => {
    // return componentUpdateStatus('my-dialog',status,{},'showDialog')
    let component = document.querySelector('my-dialog') as MyComponent<'my-dialog'>;
    if(!component) {
        component = createComponent('my-dialog', {
            zIndex:10
        },{display:false});
        document.body.appendChild(component);
    }
    return component.$getExposeMethods().then(res => {
        return res.showDialog(status,waitClosed);
    })
}
export const showReuseDialog:ShowDialog = (status,waitClosed) => {
    let component = document.querySelector('my-dialog-again') as MyComponent<'my-dialog'>;
    if(!component) {
        component = createReuseComponent('my-dialog-again','my-dialog', {
            zIndex:20
        },{display:false});
        document.body.appendChild(component);
    }
    return component.$getExposeMethods().then(res => {
        return res.showDialog(status,waitClosed);
    })
}
type updatePageFun = ComponentConfigMap['my-page-wrapper']['exposeMethods']['updateStatus'];
export const updatePage:updatePageFun = (status)=> {
    let component = document.querySelector('my-page-wrapper') as MyComponent<'my-page-wrapper'>;
    if(!component) {
       return Promise.reject(new Error('page组件不存在'))
    }
    return component.$getExposeMethods().then(res => {
        return res.updateStatus(status);
    })
}
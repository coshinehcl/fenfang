import { ComponentConfigMap } from '@types'
export type PageHeadBtn<L extends string,C extends keyof ComponentConfigMap> = {
    /** 按钮label */
    label:L,
    /** 点击按钮后需要的组件名 */
    componentName:C,
    options:Omit<ComponentConfigMap[C]['options'],'onStatusChange' | 'returnUpdateStatusType' | 'label'>,
    status:ComponentConfigMap[C]['status']
}
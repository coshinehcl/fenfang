import { CustomTag,CustomEleOptionsMap } from '@types'
type ActionItem<T extends CustomTag = CustomTag,L extends string> = {
    label:L,
    component:T,
    options:CustomEleOptionsMap[T]
}
export type HtmlActions = [
    ActionItem<'my-materials','物料'>,
    ActionItem<'my-form','新增'>,
    ActionItem<'my-form','修改'>,
    ActionItem<'my-charts','图表'>,
    ActionItem<'my-others','其它'>
]

export type HtmlActionLabelMap = {
    [key in HtmlActions[number] as key['label']]:key['options']['status']
}
export type HtmlActionUpdate<T extends keyof HtmlActionLabelMap = keyof HtmlActionLabelMap> = (label: T,status:HtmlActionLabelMap[T]) => void
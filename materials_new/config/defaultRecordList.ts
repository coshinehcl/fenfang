import { RecordItemBase } from '@types'
import { _defaultRecordList } from './_default'

const newList = _defaultRecordList.map(recordItem => {
    // 初步结构
    const _materialList = recordItem.system.map(i => {
        const _brandList = i.list.map(_i => {
            return {
                label:_i.label,
                system:[] as Array<{
                    unit:string,
                    spec:number,
                    num:number
                }>,
                repo:[] as Array<{
                    unit:string,
                    spec:number,
                    num:number
                }>,
                purchase:[] as Array<{
                    unit:string,
                    spec:number,
                    num:number
                }>,
                repoExtra:_i.numList.map(__i => {
                    return {
                        ...__i,
                        num:0
                    }
                }) as Array<{
                    unit:string,
                    spec:number,
                    num:number
                }>
            }
        })
        return {
            label: i.label,
            list:_brandList
        }
    })
    // 拿到值
    const fields = ['system','repo','purchase'] as const;
    fields.forEach(field => {
        recordItem[field].map(i => {
            const findMaterial = _materialList.find(_i => _i.label === i.label);
            i.list.forEach(_i => {
                const findBrand = findMaterial?.list.find(__i => __i.label === _i.label)!;
                let h = findBrand[field]
                findBrand[field] = _i.numList;
            })
        })
    })
    // 修改物料名字
    _materialList.forEach(i => {
        const _materialLabelMap:any = {
            '抽纸':'面巾纸',
            '成人拖鞋':'拖鞋',
            '儿童牙具套餐':'牙具套餐',
            '成人牙刷':'牙刷'
        }
        if(_materialLabelMap[i.label]) {
            i.label = _materialLabelMap[i.label] as string
        }
    })
    return {
        recordDate:recordItem.recordDate,
        list:_materialList
    }
})
export const defaultRecordList:Array<RecordItemBase> = newList as Array<RecordItemBase>;
console.log(defaultRecordList)


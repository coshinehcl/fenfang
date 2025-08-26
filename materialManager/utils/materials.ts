import { materialList,MaterialsStorageKey } from '@config'
import { MaterialItem,BrandItem,MaterialItemAtEdit,BrandItemAtEdit, GetArrayItemType } from '@types'
import { cloneData } from './tsHelper'
import { getFormatNum } from './common'

export function getMaterialList():Array<MaterialItem>{
    const cache = localStorage.getItem(MaterialsStorageKey);
    if(cache) {
        try {
            return JSON.parse(cache);
        } catch(err) {
            return cloneData(materialList);
        }
    } else {
        return cloneData(materialList);
    }
}
export function validatorBrandItem(item:BrandItem,fields:(keyof BrandItem)[],list?:Array<BrandItem>){
    let errorMsg:string | undefined = '';
    function validatorBody(field:keyof BrandItem){
        if(field === 'label') {
            if(item.label.length === 0) {
                return '品牌名称不能为空'
            }
            if(item.label.length > 10) {
                return '品牌名称过长'
            }
            if(list && list.filter(_i => _i !== item).find(_i => _i.label === item.label)) {
                return '品牌名称重复'
            }
        } else if(field === 'specs') {
            if(list) {
                const units = list.map(i => i.specs[i.specs.length -1].unit);
                if(Array.from(new Set(units)).length > 1) {
                    return '品牌最后规格单位不一致'
                }
            }
            let _errMsg = ''
            item.specs.some(i=> {
                if(i.unit.length < 0) {
                    _errMsg = '规格单位名称不能为空'
                    return true;
                } else if(i.unit.length > 4) {
                    _errMsg = '规格单位名称过长'
                    return true;
                } else if(typeof i.spec !== 'number') {
                    _errMsg = '规格数量需要为数字'
                    return true;
                } else if(i.spec < 0) {
                    _errMsg = '规格数量需要为正数'
                    return true;
                }
            })
            return _errMsg;
        }
    }
    fields.some(field => {
        errorMsg = validatorBody(field);
        return errorMsg ? true : false;
    })
    return errorMsg || ''
}
export function validatorMaterialItem(item:MaterialItem,fields:(keyof MaterialItem)[],list?:Array<MaterialItem>){
    function validatorBody(field:keyof MaterialItem){
        if(field === 'baseAverageDayUse') {
            if(typeof item.baseAverageDayUse !== 'number') {
                return 'baseAverageDayUse需要为数字'
            }
            if(item.baseAverageDayUse < 0) {
                 return 'baseAverageDayUse不能为负数'
            }
            return;
        }
        if(field === 'label') {
            if(item.label.length === 0) {
                return '物料名称不能为空'
            }
            if(item.label.length > 10) {
                return '物料名称长度过长'
            }
            if(list && list.filter(i => i!== item).find(i => i.label === item.label)) {
                return `物料名称重复`
            }
            return
        }
        if(field === 'list') {
            if(item.list.length === 0) {
                return '品牌列表不能为空'
            }
            // 校验品牌的名称
            let errMsg = '';
            item.list.some(i => {
                errMsg = validatorBrandItem(i,['label','specs'],item.list);
                if(errMsg) {
                    return true
                }
            })
            if(errMsg) {
                return errMsg;
            }
            return;
        }
        if(field === 'usage') {
            if(typeof item.usage.max !== 'number') {
                return '物料最大出库值需要为数字'
            }
            if(typeof item.usage.min !== 'number') {
                return '物料最小出库值需要为数字'
            }
            if(item.usage.max < item.usage.min) {
                return '物料最大出库值需不能小于最小出库值'
            }
        }
    }
    let errorMsg:string | undefined = '';
    fields.some(field => {
        errorMsg = validatorBody(field);
        return errorMsg ? true : false;
    })
    return errorMsg || ''
}
export function setMaterials(list:Array<MaterialItemAtEdit>) {
    // 先校验
    let errorMsg:string | undefined = '';
    let errorItemIndex:number = 0;
    list.some((item,index) => {
        errorItemIndex = index;
        errorMsg = validatorMaterialItem(item,['label','list','usage','baseAverageDayUse'],list)
        return errorMsg ? true : false;
    })
    if(errorMsg) {
        return [errorMsg,errorItemIndex] as const;
    }
    // 移除newAdd字段
    const newList = cloneData(list);
    newList.forEach(materialItem => {
        if('isNewAdd' in materialItem) {
            delete materialItem.isNewAdd
        }
        materialItem.list.forEach(brandItem => {
            if('isNewAdd' in brandItem) {
                delete brandItem.isNewAdd
            }
        })
        materialItem.baseAverageDayUse = getFormatNum(materialItem.baseAverageDayUse)
    })
    // 更新到缓冲
    localStorage.setItem(MaterialsStorageKey,JSON.stringify(newList));
}


/**
 * 得到空的数据
 */
const defaultBrandLabel = '品牌名称'
const defaultMaterialLabel = '物料名称'
export function getEmptyBrandItem():BrandItemAtEdit {
    return {
        label:defaultBrandLabel,
        specs:[{
            unit:'个',
            spec:1
        }],
        priority:1,
        isNewAdd:true,
    }
}
export function getEmptyMaterialItem():MaterialItemAtEdit {
    return {
        label:defaultMaterialLabel as MaterialItem['label'],
        list:[getEmptyBrandItem()],
        usage:{
            min:0,
            max:100
        },
        baseAverageDayUse:1,
        isNewAdd:true
    }
}

export function getBrandSpecsText(brandItem:BrandItem):string {
    const textList:string[] = [];
    brandItem.specs.forEach((i,index) => {
        if(index === 0) {
            textList.push(`1${i.unit}`)
            return;
        }
        textList.push(`${brandItem.specs[index -1].spec}${i.unit}`)
    })
    return textList.join('*');
}
export function validatorBrandSpecstext(text:string):string {
    if(!text || !text.trim()) {
        return '不能为空'
    }
    const itemList = text.trim().split('*');
    let errMsg = '';
    itemList.some((i,index) => {
        const regex = /^(\d+)(.*)$/;
        const match = i.trim().match(regex);
        if(!match) {
            errMsg = '格式不正确'
            return true
        }
        if(!match[2]) {
            errMsg = '单位不能为空'
            return true
        }
    })
    return errMsg;
}
export function getBrandSpecsByText(text:string):BrandItem['specs'] {
    const specsList:BrandItem['specs'] = []
    const errMsg = validatorBrandSpecstext(text);
    if(errMsg) {
        return specsList
    }
    const itemList = text.trim().split('*');
    itemList.forEach((i,index) => {
        const regex = /^(\d+)(.*)$/;
        const match = i.trim().match(regex)!;
        if(index === 0) {
            specsList.push({
                unit:match[2] as GetArrayItemType<BrandItem['specs']>['unit'],
                spec:1
            })
        } else {
            specsList[index -1].spec = Number(match[1]);
            specsList.push({
                unit:match[2] as GetArrayItemType<BrandItem['specs']>['unit'],
                spec:1
            })
        }
    })
    return specsList;
}
export function getBrandValueText(item:BrandItem,v:number) {
    const textItem = {
        num:v,
        unit:item.specs.slice(-1)[0].unit
    }
    let rate = 1;
    cloneData(item.specs).reverse().some(specItem => {
        rate = rate * specItem.spec;
        // 取一个较有意义的单位值，如果较小，则不要取这么大规格单位的
        if(v / rate < 0.2) {
            return true;
        }
        textItem.num = getFormatNum(v / rate);
        textItem.unit = specItem.unit
    })
    return `${textItem.num}${textItem.unit}`
}
export function getMaterialValueText(item:MaterialItem,v:number) {
    const textList:Array<string> = [];
    item.list.filter(i => !i.isDeprecated).forEach(brandItem => {
        textList.push(getBrandValueText(brandItem,v));
    })
    // 如果一致的，则清除重复项
    return Array.from(new Set(textList)).join(',');
}

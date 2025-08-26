import { BrandItem, GetArrayType, MaterialsItem,MaterialsItemAtEdit, RecordBrandItemHooks } from '@types'
import { cloneData, getFormatNum } from './common'
import { materialList } from '@config'
const matetialsListStorageKey = 'materials_new'
const emptyMaterialLabel = '物料名称' as MaterialsItem['label'];
const emptyBrandLabel = '品牌名称' as BrandItem['label']
function getMaterialsListByStorage():Array<MaterialsItem>{
    const listStr = localStorage.getItem(matetialsListStorageKey);
    if(listStr) {
        try {
            return JSON.parse(listStr)
        } catch(err){
            return []
        }
    } else {
        return []
    }
}

/**
 * 存储物料列表
 * @param list 
 */
export function setMaterialList(list:Array<MaterialsItem>):string {
    // TODO 需要校验min/max
    // TODO 需要校验/更新 unit
    // TODO 需要移除newAdd字段。校验label名字不能是'物料名称'|
    if(!list || !list.length) {
        localStorage.removeItem(matetialsListStorageKey);
        return '';
    }
    let errMsg = '';
    list.some(materialItem => {
        // 这里不能修改materialItem
        const {uasge:{min,max},baseAverageDayUse} = materialItem;
        if(typeof baseAverageDayUse!== 'number') {
            errMsg = materialItem.label +':baseAverageDayUse需要为数字'
            return true;
        } else if(baseAverageDayUse < 0) {
            errMsg = materialItem.label +':baseAverageDayUse不能为负'
            return true;
        }
        if(typeof min !== 'number') {
            errMsg = materialItem.label +':min需要为数字'
            return true;
        } else if(min < 0) {
            errMsg = materialItem.label +':min不能为负'
            return true;
        }
        if(typeof max !== 'number') {
            errMsg =materialItem.label +':max需要为数字'
            return true;
        } else if(max < 0) {
            errMsg = materialItem.label +':max不能为负'
            return true;
        }
        if(min > max) {
            errMsg = materialItem.label +':max需要大于min'
            return true;
        }
        if(!materialItem.list.length) {
            errMsg = materialItem.label +':品牌列表不能为空'
            return true;
        }
        const brandListUnit = materialItem.list.map(i => i.specs[i.specs.length -1].unit);
        const brandListUnits:string[] = Array.from(new Set(brandListUnit));
        if(brandListUnits.length > 1) {
            errMsg = materialItem.label +':品牌列表的规格最后单位不一致'
            return true;
        } else if(!brandListUnits[0].trim()) {
            errMsg = materialItem.label +':品牌列表最后规格的单位不能为空'
            return
        }
    })
    if(errMsg) {
        return errMsg;
    }
    // 更新unit
    const newList:Array<MaterialsItem> = [];
    list.forEach(_materialItem => {
        const newMaterialItem:MaterialsItem = JSON.parse(JSON.stringify(_materialItem));
        newMaterialItem.unit = newMaterialItem.list[0].specs.slice(-1)[0].unit;
        newList.push(newMaterialItem);
    });
    try {
       localStorage.setItem(matetialsListStorageKey,JSON.stringify(newList));
       return '';
    } catch(err){
        return '存储异常'
    }
}
/**
 * 从缓存中读取materialList
 */
export function getMaterialList():Array<MaterialsItem>{
    const storageMaterialsList = getMaterialsListByStorage();
    if(storageMaterialsList.length) {
        return JSON.parse(JSON.stringify(storageMaterialsList))
    } else {
        // 避免影响这个数据
        return JSON.parse(JSON.stringify(materialList));
    }
}
export function getEmptyBrandItem():GetArrayType<MaterialsItemAtEdit['list']>{
    return {
        label:emptyBrandLabel,
        isDeprecated:false,
        specs:[],
        priority:1,
        newAdd:true
    }
}
export function getSpecsText(specs:BrandItem['specs']):string{
    let specsText = '1'
    specs.forEach((specsItem,index) => {
        if(index === 0) {
            specsText = `1${specsItem.unit}`
        } else {
            const lastSpecItem = specs[index -1];
            specsText += `*${lastSpecItem.spec}${specsItem.unit}`
        }
    })
    return specs.length ? specsText : '-';
}
export function getEmptyMaterialItem():MaterialsItemAtEdit {
    return {
        label:emptyMaterialLabel,
        isDeprecated:false,
        list:[],
        uasge:{
            min:0,
            max:0
        },
        unit:'' as MaterialsItem['unit'],
        baseAverageDayUse:50,
        newAdd:true
    }
}
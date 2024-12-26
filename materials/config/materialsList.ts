import { MaterialsItem } from '../types/index'
/** 入驻量 */
const SettlementNum = 120;
export const materialsList:Array<MaterialsItem> = [
    {
        label:'沐浴露',
        list:[
            {
                label:'柠檬过江沐浴露',
                specs:[
                    {
                        unit:'箱',
                        spec:24
                    },
                    {
                        unit:'瓶',
                        spec:1
                    }
                ],
                priority:1
            }
        ],
        uasge:{
            min:0,
            max:SettlementNum
        },
        unit:'瓶'
    },
    {
        label:'洗发水',
        list:[
            {
                label:'柠檬过江洗发水',
                specs:[
                    {
                        unit:'箱',
                        spec:24
                    },
                    {
                        unit:'瓶',
                        spec:1
                    }
                ],
                priority:1
            }
        ],
        uasge:{
            min:0,
            max:SettlementNum
        },
        unit:'瓶'
    },
    {
        label:'洗手液',
        list:[
            {
                label:'柠檬过江洗手液',
                specs:[
                    {
                        unit:'箱',
                        spec:24
                    },
                    {
                        unit:'瓶',
                        spec:1
                    }
                ],
                priority:1
            }
        ],
        uasge:{
            min:0,
            max:SettlementNum
        },
        unit:'瓶'
    },
    {
        label:'矿泉水',
        list:[
            {
                label:'乐百氏矿泉水',
                specs:[
                    {
                        unit:'箱',
                        spec:24
                    },
                    {
                        unit:'瓶',
                        spec:1
                    }
                ],
                priority:1
            }
        ],
        uasge:{
            min:0,
            max:SettlementNum * 5
        },
        unit:'瓶'
    },
    {
        label:'牙膏',
        list:[
            {
                label:'美加净牙膏',
                specs:[
                    {
                        unit:'箱',
                        spec:500
                    },
                    {
                        unit:'支',
                        spec:1
                    }
                ],
                priority:1
            }
        ],
        uasge:{
            min:0,
            max:SettlementNum * 2
        },
        unit:'支'
    },
    {
        label:'抽纸',
        list:[
            {
                label:'纤纯面巾纸',
                specs:[
                    {
                        unit:'箱',
                        spec:60
                    },
                    {
                        unit:'包',
                        spec:1
                    }
                ],
                priority:1
            },
            {
                label:'凤生面巾纸',
                specs:[
                    {
                        unit:'箱',
                        spec:60
                    },
                    {
                        unit:'包',
                        spec:1
                    }
                ],
                priority:2
            }
        ],
        uasge:{
            min:0,
            max:SettlementNum
        },
        unit:'包'
    },
    {
        label:'小垃圾袋',
        list:[
            {
                label:'白色垃圾袋',
                specs:[
                    {
                        unit:'扎',
                        spec:1000
                    },
                    {
                        unit:'个',
                        spec:1
                    }
                ],
                priority:1
            }
        ],
        uasge:{
            min:0,
            max:SettlementNum * 3
        },
        unit:'个'
    },
    {
        label:'卷纸',
        list:[
            {
                label:'纤纯卷纸',
                specs:[
                    {
                        unit:'包',
                        spec:10
                    },
                    {
                        unit:'提',
                        spec:12
                    },
                    {
                        unit:'卷',
                        spec:1
                    },
                ],
                priority:1
            },
            {
                label:'凤生卷纸',
                specs:[
                    {
                        unit:'包',
                        spec:10
                    },
                    {
                        unit:'提',
                        spec:12
                    },
                    {
                        unit:'卷',
                        spec:1
                    }
                ],
                priority:2
            }
        ],
        uasge:{
            min:0,
            max:SettlementNum * 2
        },
        unit:'卷'
    },
    {
        label:'成人拖鞋',
        list:[
            {
                label:'QZD无纺布拖鞋',
                specs:[
                    {
                        unit:'包',
                        spec:700
                    },
                    {
                        unit:'双',
                        spec:1
                    }
                ],
                priority:3
            },
            {
                label:'真美布拖鞋',
                specs:[
                    {
                        unit:'包',
                        spec:500
                    },
                    {
                        unit:'双',
                        spec:1
                    }
                ],
                priority:1
            }
        ],
        uasge:{
            min:0,
            max:SettlementNum * 2
        },
        unit:'双'
    },
    {
        label:'大垃圾袋',
        list:[
            {
                label:'黑色垃圾袋',
                specs:[
                    {
                        unit:'包',
                        spec:20
                    },
                    {
                        unit:'扎',
                        spec:50
                    },
                    {
                        unit:'个',
                        spec:1
                    }
                ],
                priority:1
            }
        ],
        uasge:{
            min:0,
            max:SettlementNum * 2
        },
        unit:'个'
    },
    {
        label:'茶叶',
        list:[
            {
                label:'神叶红茶',
                specs:[
                    {
                        unit:'箱',
                        spec:50
                    },
                    {
                        unit:'盒',
                        spec:50
                    },
                    {
                        unit:'袋',
                        spec:1
                    }
                ],
                priority:1
            }
        ],
        uasge:{
            min:0,
            max:SettlementNum
        },
        unit:'袋'
    },
    {
        label:'儿童拖鞋',
        list:[
            {
                label:'真美布儿童拖鞋',
                specs:[
                    {
                        unit:'包',
                        spec:300
                    },
                    {
                        unit:'双',
                        spec:1
                    }
                ],
                priority:1
            }
        ],
        uasge:{
            min:0,
            max:SettlementNum * 2
        },
        unit:'双'
    },
    {
        label:'儿童牙具套餐',
        list:[
            {
                label:'两面针牙具套餐',
                specs:[
                    {
                        unit:'箱',
                        spec:250
                    },
                    {
                        unit:'套',
                        spec:1
                    }
                ],
                priority:1
            }
        ],
        uasge:{
            min:0,
            max:SettlementNum * 2
        },
        unit:'套'
    },
    {
        label:'梳子',
        list:[
            {
                label:'秸秆香蕉梳',
                specs:[
                    {
                        unit:'箱',
                        spec:500
                    },
                    {
                        unit:'支',
                        spec:1
                    }
                ],
                priority:1
            }
        ],
        uasge:{
            min:0,
            max:SettlementNum * 2
        },
        unit:'支'
    },
    {
        label:'成人牙刷',
        list:[
            {
                label:'秸秆米白牙刷',
                specs:[
                    {
                        unit:'箱',
                        spec:500
                    },
                    {
                        unit:'支',
                        spec:1
                    }
                ],
                priority:1
            },
            {
                label:'秸秆浅灰牙刷',
                specs:[
                    {
                        unit:'箱',
                        spec:500
                    },
                    {
                        unit:'支',
                        spec:1
                    }
                ],
                priority:1
            }
        ],
        uasge:{
            min:0,
            max:SettlementNum * 2
        },
        unit:'支'
    },
    {
        label:'咖啡',
        list:[
            {
                label:'隅田川咖啡',
                specs:[
                    {
                        unit:'箱',
                        spec:250
                    },
                    {
                        unit:'包',
                        spec:1
                    }
                ],
                priority:1
            }
        ],
        uasge:{
            min:0,
            max:SettlementNum
        },
        unit:'袋'
    }
]
const MaterialsListStorageKey = 'materials_list'
export const getNewMaterialsList = ()=> {
    let list = localStorage.getItem(MaterialsListStorageKey);
    if(list) {
        try {
           return JSON.parse(list) as Array<MaterialsItem>;  
        } catch(err) {
            return materialsList
        }
    } else {
        return materialsList;
    }
}
export const setNewMaterialsList = (list:Array<MaterialsItem>) => {
    localStorage.setItem(MaterialsListStorageKey,JSON.stringify(list));
}
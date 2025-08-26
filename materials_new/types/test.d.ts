type CustomTag = 'my-others' | 'my-actions' | 'my-message' | 'my-inputs' | 'my-form' | 'my-charts' | 'my-materials'
type CustomEleOptionsMap1 = {
    /** 物料的输入框 */
    'my-inputs':{
        /** 当前物料，当前记录项，所有记录项 */
   
    },
    'my-charts':{
       
    },
    'my-form':{
        
    },
    'my-materials':{
        
    },
    'my-others':{
        
    },
    'my-message':{},
    'my-actions':{}
}
type EnsureComplete<T extends string, K extends { [key in T]: number }> = 1;
type j = EnsureComplete<CustomTag, CustomEleOptionsMap1>

export {}
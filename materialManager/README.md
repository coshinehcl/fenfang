# 类型
    - config中，有自己的类型
        - 为了给config中消费
        - 通过config中得到更有意义的新类型
        - 新类型会导出到@typeConfig中，给其它消费
    - {} | {} 联合类型的值，如果const a = {x:a.x,y:a.y} 又会破坏他们的关联关系,具体解决看objectPick
    - 元祖，还可以定义命名元组
        - 更有语义
        - 这样定义函数的参数的时候，可以(name,...args:MyList) 这样不回丢失参数名称
       

/** 拿到数组项的类型 */
export type GetArrayItemType<T extends any[]> = T extends (infer U)[] ? U : never;
/** 数字转字符串,支持联合类型 */
export type NumberToString<T extends number> = `${T}` extends infer U ? U : never;
/** 字符串转数字，支持联合类型 */
export type StringToNumber<T extends string> = T extends `${infer U extends number}` ? U : never;
/** 约束数组尾项是特殊类型 */
export type ArrayPushItem<T extends any[], I> = [...T, I];
/** 约束数组头部是特殊类型 */
export type ArrayUnshiftItem<T extends any[], I> = [I,...T];

/** 判断类型是否一致 */
export type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B;
/** omit或pick 一些不需要的类型key */
export type OmitReadOnly<T> = {
    [key in keyof T as IfEquals<Pick<T,key>,{-readonly [key1 in key]:T[key1]},key,never>]:T[key]
}
export type OmitIndexSignature<T> = {
    [key in keyof T as {} extends Record<key,any> ? never : key]:T[key]
}
export type PickByType<T,U> = {
    [key in keyof T as IfEquals<T[key],U,key,never>]:T[key]
}

/** JSON */
type JsonPrimitive = string | number | boolean | null
type JsonObject = {[Key in string]?: JsonValue};
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
type JsonArray = JsonValue[] | readonly JsonValue[]

/** 从联合对象中，得到一个新的联合对象,确保得到的新类型，保持了之前的联合关系 */
export type ObjectPick<T extends object,K extends keyof T> ={
    [key in T as string]:{
        [key1 in K]:key[key1]
    }
}[string]

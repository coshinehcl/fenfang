export type GetArrayType<T> = T extends (infer U)[] ? U : never;
export type OmitIndexSignature<T> = {
    [key in keyof T as {} extends Record<key,any> ? never : key]:T[key]
}
export type PickByChildTypes<T extends object,U extends T[keyof T]> = {
    [key in keyof T as ([U] extends [T[key]] ? key : never)] : T[key]
}
export interface FunctionObject {
    [key: string]: (...args: any[]) => any;
}
export type NumberToString<T extends number> = `${T}` extends infer U ? U : never;
export type NumbersToStrings<T extends keyof any> = {
    [key in T]:key extends number ? NumberToString<key> : never
}[T]
export type PickKeysByType<T extends object,K extends T[keyof T]> = {
    [p in keyof T as (K extends T[p] ? p : never)]:T[p]
}

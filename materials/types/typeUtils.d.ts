export type GetArrayType<T> = T extends (infer U)[] ? U : never;

export type GetKeysByType<T extends {},U> = {
    [K in keyof T]: T[K] extends U ? K : never;
}[keyof T]

/** 拿到数组对象中指定key的联合类型 */
export type GetArrayKeyTypes<T extends readonly any [],U extends string> = T extends readonly [infer Head, ...infer Tail] ?
Head extends Record<U,any> ? Head[U] | GetArrayKeyTypes<Tail,U> : GetArrayKeyTypes<Tail,U>
:never
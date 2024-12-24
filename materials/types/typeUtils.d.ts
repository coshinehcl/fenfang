export type GetArrayType<T> = T extends (infer U)[] ? U : never;

export type GetKeysByType<T extends {},U> = {
    [K in keyof T]: T[K] extends U ? K : never;
}[keyof T]
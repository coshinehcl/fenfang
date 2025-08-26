/** 通过B来约束A */
export type CheckAByB<A extends B,B> = unknown;

/** 技巧 */
// 定义元祖
// 定义map :注意不适合提供工具在这里，不然不会有直接的ts提示
// 如 type CustomEleTagOptionsMap = {[key in CustomEleTag]:CustomEleTagOptions[key]}
// 这样就会约束CustomEleTagOptions包含了所有CustomEleTag的key
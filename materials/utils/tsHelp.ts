/** Object.keys方法，这里后续key确保类型不丢失 */
export function objectKeys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
}
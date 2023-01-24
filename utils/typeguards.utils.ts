export const isNumber = (value: unknown): value is number => {
    return typeof value === 'number'
}

export const isString = (value: unknown): value is string => {
    return typeof value === 'string'
}

export const isBoolean = (value: unknown): value is boolean => {
    return typeof value === 'boolean'
}

export const isStringOfNumber = (value: unknown): value is string => {
    return isString(value) && !isNaN(Number(value))
}

export const isArrayOf = (arr: unknown, typeguard: (value: unknown) => boolean): boolean => {
    return Array.isArray(arr) && arr.every(typeguard)
}
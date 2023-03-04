export const createRangeArray = (start: number, end: number, step: number) =>
    Array.from({ length: (end - start) / step + 1 }, (_, i) => start + i * step);
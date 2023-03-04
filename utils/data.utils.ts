import { IProgressEntry, ITimeGroup } from '../types/types'

export const getBinLowerBound = (n: number, binWidth: number) => Math.floor(n / binWidth) * binWidth;

export const getBinUpperBound = (n: number, binWidth: number) => {
    const bound = Math.ceil(n / binWidth) * binWidth;
    if (bound === getBinLowerBound(n, binWidth)) return bound + binWidth;
    return bound;
};

const groupDataByPeriod = (data: IProgressEntry[], period: number): Map<number, IProgressEntry[]> => {
	const groups = new Map<number, IProgressEntry[]>();

	data.forEach((dataPoint) => {
		const key = Math.floor(dataPoint.time / period) * period;

		if (!groups.get(key)) {
			groups.set(key, []);
		}

		let group = groups.get(key);

		if (!group) return;

		group.push(dataPoint);
	});

	return groups;
};

export const groupDataByMetric = (
	data: IProgressEntry[],
    timeResolution: number,
	chunkSize: number,
	metric: string,
    allKeys: string[],
	isAbsolute: boolean
): ITimeGroup[] => {
    const groupedByPeriod = groupDataByPeriod(data, timeResolution);
	const result: ITimeGroup[] = [];

	[...groupedByPeriod.entries()].reverse().forEach(([period, dataGroup]) => {
		const groups: Record<number, number> = result.length ? result[result.length - 1] : {};

		dataGroup.forEach((dataPoint) => {
			let rawKey: number;

			switch (metric) {
				case 'ttc':
					let ttc = dataPoint.ttc / 1000;
					ttc = ttc > 64.999 ? 64.999 : ttc;
					rawKey = Math.ceil(ttc / chunkSize) * chunkSize;
					break;
				case 'wpm':
					let wpm = (60000 / dataPoint.ttc) * dataPoint.words;
					wpm = wpm > 64.999 ? 64.999 : wpm;
					rawKey = Math.ceil(wpm / chunkSize) * chunkSize;
					break;
				case 'accuracy':
					let accuracy = dataPoint.acc * 100;
					accuracy = accuracy < 40 ? 40 : accuracy;
					rawKey = Math.ceil(accuracy / chunkSize) * chunkSize;
					break;
				default:
					rawKey = -1;
			}
			const key = rawKey === 0 ? chunkSize : rawKey;

			if (!groups[key]) {
				groups[key] = 1;
				return;
			}

			groups[key] += 1;
		});

		allKeys.forEach((keyString: string) => {
			const key = Number(keyString);
			if (!groups[key]) {
				groups[key] = 0;
			}
		});

		result.push({ ...groups, time: new Date(Number(period) * 1000) });
	});

	if (!isAbsolute) {
		result.forEach((entry) => {
			const total = Object.entries(entry).reduce((acc, [_, v]) => {
				if (typeof v === 'number') {
					return acc + v;
				}
				return acc;
			}, 0);

			Object.entries(entry).forEach(([k, v]) => {
				if (k !== 'time') {
					const key = Number(k);
					const value = Number(v);
					entry[key] = value / total;
				}
			});
		});
	}

	return result;
}

export const constructMetricArray = (
    data: IProgressEntry[],
    metric: 'ttc' | 'wpm' | 'accuracy',
    cutoff: number
) => {
    switch (metric) {
        case 'ttc':
            return data.map((entry) => entry.ttc / 1000).map((ttc) => ttc >= cutoff ? cutoff - 1 : ttc);
        case 'wpm':
            return data.map((entry) => (60000 / entry.ttc) * entry.words).map((wpm) => wpm >= cutoff ? cutoff - 1 : wpm);
        case 'accuracy':
            return data.map((entry) => entry.acc * 100).map((acc) => acc <= cutoff ? cutoff + 1 : acc).map((acc) => Number(acc.toFixed(1)));
        default:
            return [];
    }
};

export const createBinArray = (metricArray: number[], binWidth: number) => {
    const bins = metricArray.reduce((bins: Record<number, number[]>, curr) => {
        const lowerBound = getBinLowerBound(curr, binWidth);

        if (!bins[lowerBound]) {
            bins[lowerBound] = [];
        }

        bins[lowerBound].push(curr);
    
        return bins;
    }, {});

    return Object.entries(bins).map(([lowerBound, bin]) =>
        Object.assign({
            d0: Number(lowerBound),
            d1: Number(lowerBound) + binWidth,
            length: bin.length,
        }, bins)
    );
}
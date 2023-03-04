import { Progress, IProgressEntry } from "../types/types";
import { getDayFromTimestamp } from "../utils/date.utils";

export const useUserProgress = () => {
    const getProgress = () => {
        if (typeof window === 'undefined') return [];
        const progressString = localStorage.getItem('progress') || '[]';
        const progress: Progress = JSON.parse(progressString);
        return progress;
    }

    const updateProgress = (update:
        {
            sentenceId: string,
            direction: string,
            words: number,
            accuracy: number,
            timeToComplete: number
        }
    ) => {
        const progressString = localStorage.getItem('progress') || '[]';
        const progress: Progress = JSON.parse(progressString)
            .filter((entry: IProgressEntry) => entry.id !== update.sentenceId);

        progress.unshift({
            id: update.sentenceId,
            dir: update.direction,
            acc: update.accuracy,
            words: update.words,
            time: Math.floor(Date.now() / 1000),
            ttc: update.timeToComplete
        });

        localStorage.setItem('progress', JSON.stringify(progress));
    }

    const getDueSentences = () => {
        if (window === undefined) return;

        const progressString = localStorage.getItem('progress') || '[]';
        const progress: Progress = JSON.parse(progressString);

        const dueSentences = progress.filter((entry: IProgressEntry) => {
            if (entry.acc > 0.95) return false;

            const minInterval = 5 * 60;
            const maxInterval = 30 * 24 * 60 * 60;
            const diffInterval = maxInterval - minInterval;

            const interval = minInterval + diffInterval * (Math.pow(entry.acc, 5));

            if (entry.time + interval < Math.floor(Date.now() / 1000)) return true;

            return false;
        });

        return dueSentences.map((entry: IProgressEntry) => entry.id);
    };

    const updateStreak = () => {
        const dateStreak = localStorage.getItem('dateStreak') || '[]';
        const streak: number[] = JSON.parse(dateStreak);

        const today = new Date().setHours(0, 0, 0, 0) / 1000

        if (streak[0] === today) return streak.length

        streak.unshift(today);
        localStorage.setItem('dateStreak', JSON.stringify(streak));
        return streak.length;
    }

    const getStreakLength = () => {
        if (typeof localStorage === 'undefined') return -1;

        const dateStreak = localStorage.getItem('dateStreak') || '[]';
        const streak: number[] = JSON.parse(dateStreak);

        const today = new Date().setHours(0, 0, 0, 0) / 1000
        const yesterady = today - 24 * 60 * 60;

        if (streak[0] === today || streak[0] === yesterady) return streak.length

        localStorage.setItem('dateStreak', JSON.stringify([]));
        return 0;
    }

    const get7DayTrend = () => {
        const defaultValues = {
            ttc: 0,
            wpm: 0,
            accuracy: 0
        };

        if (typeof localStorage === 'undefined') return defaultValues

        const progressString = localStorage.getItem('progress') || '[]';
        const progress: Progress = JSON.parse(progressString);

        if (progress.length === 0) return defaultValues;

        const week = 7 * 24 * 60 * 60;

        const last7Days = progress.filter((entry: IProgressEntry) =>
            entry.time > Math.floor(Date.now() / 1000) - week
        ).reverse();

        const n = last7Days.length;
        const metrics = ['ttc', 'wpm', 'accuracy'] as const
        const output: Record<typeof metrics[number], number> = {
            ttc: 0,
            wpm: 0,
            accuracy: 0
        }

        const selectedData = last7Days.map((entry) => ({
            time: entry.time,
            ttc: entry.ttc,
            wpm: (60000 / entry.ttc) * entry.words,
            accuracy: entry.acc
        }))
        
        metrics.forEach((key) => {
            const sum = selectedData.reduce((sum: {
                X: number,
                Y: number,
                XY: number,
                XX: number
            }, entry: typeof selectedData[number]) => {
                sum.X += entry.time;
                sum.Y += entry[key];
                sum.XY += entry.time * entry[key];
                sum.XX += entry.time * entry.time;

                return sum;
            }, { X: 0, Y: 0, XY: 0, XX: 0 })

            const slope = (n * sum.XY - sum.X * sum.Y) / (n * sum.XX - sum.X * sum.X);
            const intercept = (sum.Y - slope * sum.X) / n;

            const now = slope * selectedData[selectedData.length - 1].time + intercept;
            const then = slope * selectedData[0].time + intercept;

            output[key] = Math.round(100 * (now - then) / then) || 0;
        })

        return output
    }

    const getActiveDays = () => {
        if (typeof localStorage === 'undefined') return [];

        let days: Set<number> = new Set();

        const progressString = localStorage.getItem('progress') || '[]';
        const progress: Progress = JSON.parse(progressString);

        progress.forEach((entry: IProgressEntry) => {
            const day = getDayFromTimestamp(entry.time);
            days.add(day);
        })

        return [...days];
    }

    const exportData = () => {
        const data = JSON.stringify(localStorage);
        const blob = new Blob([data], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `SYNTILLA_EXPORT_${new Date().toISOString()}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    const importData = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.readAsText(file);
                reader.onload = () => {
                    try {
                        const data = JSON.parse(reader.result as string);
                        Object.keys(data).forEach((key) => {
                            localStorage.setItem(key, data[key]);
                        });
                        alert("Data loaded successfully!");
                    } catch (error) {
                        alert("An error occured whilst loading data from file.");
                    }
                };
                reader.onerror = () => {
                    alert("An error occured whilst loading data from file.");
                };
            }
        };
        input.click();
    };

    return {
        getProgress,
        updateProgress,
        getDueSentences,
        updateStreak,
        getStreakLength,
        get7DayTrend,
        getActiveDays,
        exportData,
        importData
    }
}
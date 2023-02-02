import { useState } from "react";
import { Progress, IProgressEntry } from "../types/types";

export const useUserProgress = () => {
    const [streakLength, setStreakLength] = useState(0);
    
    const updateProgress = (update: 
        {
            sentenceId: string,
            direction: string,
            accuracy: number,
            startTime: number
        }
    ) => {
        const progressString = localStorage.getItem('progress') || '[]';
        const progress: Progress = JSON.parse(progressString)
            .filter((entry: IProgressEntry) => entry.id !== update.sentenceId);

        progress.unshift({
            id: update.sentenceId,
            dir: update.direction,
            acc: update.accuracy,
            time: Math.floor(Date.now() / 1000),
            ttc: Date.now() - update.startTime
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
        const yesterady = today - 24 * 60 * 60;

        if (streak[0] === today) return streak.length

        if (streak[0] === yesterady) {
            streak.unshift(today);
            localStorage.setItem('dateStreak', JSON.stringify(streak));
            return streak.length;
        }

        localStorage.setItem('dateStreak', JSON.stringify([today]));
        return 1
    }

    const getStreakLength = () => {
        if (typeof localStorage === 'undefined') return -1;

        const dateStreak = localStorage.getItem('dateStreak') || '[]';
        const streak: number[] = JSON.parse(dateStreak);
        return streak.length;
    }

    return { updateProgress, getDueSentences, updateStreak, getStreakLength }
}
export const getDayFromTimestamp = (timestamp: number | Date) => {
    if (timestamp instanceof Date) {
        timestamp = timestamp.getTime() / 1000;
    }
    const date = new Date(timestamp * 1000);
    return date.setHours(0, 0, 0, 0) / 1000;
}
export const measureText = (text: string, threshold: number, font: string) => {
    if (text.length > threshold) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
            return 0
        }

        context.font = font;

        return context.measureText(text).width;
    }

    return 0
}
import { measureText } from "./measure-text.utils";
import { Sentence } from "../types/types";

export const balanceText = (text: Sentence, numLines: number): Sentence[] => {
    const sortedCandidates = splitText(text, numLines).sort((a, b) => {
        const font = "400 1em Montserrat";
        const aLengths = a.map((line) =>
            measureText(line.map(({ word }) => word).join(" "), 0, font)
        );
        const bLengths = b.map((line) =>
            measureText(line.map(({ word }) => word).join(" "), 0, font)
        );
        const aDifference = Math.max(...aLengths) - Math.min(...aLengths);
        const bDifference = Math.max(...bLengths) - Math.min(...bLengths);

        return aDifference - bDifference;
    });

    return sortedCandidates[0];
}

function product(...arrays: number[][]): number[][] {
    const result: number[][] = [];
    const recurse = (arr: number[], index: number): void => {
        if (index === arrays.length) {
            result.push(arr);
            return;
        }
        for (const value of arrays[index]) {
            recurse([...arr, value], index + 1);
        }
    };
    recurse([], 0);
    return result;
}

function permuteIndicies(numbers: number[]): number[][] {
    const variations = numbers.slice(1, -1).map((n) => [n - 1, n, n + 1]);
    const permutations = product(...variations).map((p) => [
        numbers[0],
        ...p,
        numbers[numbers.length - 1]
    ]);
    return permutations.filter((permutation) =>
        permutation.every((number, index) => index === 0 || number > permutation[index - 1])
    );
}

function splitText(words: Sentence, lines: number): Sentence[][] {
    const sentence = words.reduce(
        (string, { word, whitespace }) => (string += word + (whitespace ? " " : "")),
        ""
    );

    const optimalIndex = Math.round(sentence.length / lines);

    const splitIndices = [0];

    for (let i = 1; i < lines; i++) {
        splitIndices.push(sentence.slice(0, optimalIndex * i).split(" ").length);
    }

    splitIndices.push(words.length + 1);
    const permutedIndices = permuteIndicies(splitIndices);

    const candidates: Sentence[][] = [];

    for (const indices of permutedIndices) {
        const candidate: Sentence[] = [];
        for (let i = 0; i < indices.length - 1; i++) {
            // if (words[indices[i] - 1] && words[indices[i] - 1][2] === false) {
            if (words[indices[i] - 1] && !words[indices[i] - 1].whitespace) {
                if (words[indices[i]].word.length > words[indices[i] - 1].word.length) {
                    candidate.push(words.slice(indices[i] - 1, indices[i + 1]));
                } else {
                    candidate.push(words.slice(indices[i] + 1, indices[i + 1]));
                }
                continue;
            }
            candidate.push(words.slice(indices[i], indices[i + 1]));
        }

        candidates.push(candidate);
    }

    return candidates;
}
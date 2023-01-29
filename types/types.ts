import { type } from "os";

export type Language = "es" | "en";

export type Sentence = IWord[];

export interface IWord {
	word: string;
	start: number;
	end: number;
	entity: string;
    whitespace: boolean;
	tokens: IToken[];
}

export interface IToken {
	id: number;
	text: string;
	lemma: string;
	pos: string;
	tb_pos: string;
	dep: string;
	head: number;
	tags: Record<string, string>;
}

export interface ISentence {
    _id: string;
	es: Sentence;
	en: Sentence;
    translations: {
        es: Dictionary;
        en: Dictionary;
    }
}

export type Dictionary = (IDictionaryEntry | null)[];

export interface IDictionaryEntry {
    lemma: string;
    principal: string[];
    posChunks: IPosChunk[];
}

interface IPosChunk {
    pos: string;
    senseChunks: ISenseChunk[];
}

interface ISenseChunk {
    sense: string;
    translations: string[];
}

export interface IProgressEntry {
    id: string;
    dir: string;
    acc: number;
    time: number;
    ttc: number;
}

export type Progress = IProgressEntry[];
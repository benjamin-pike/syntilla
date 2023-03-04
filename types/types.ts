export interface ModalProps {
    children: React.ReactNode;
    title: string;
    modalStatus: 'open' | 'closing' | 'closed';
    setModalStatus: React.Dispatch<React.SetStateAction<'open' | 'closing' | 'closed'>>
}

export type ModalStatusProps = Pick<ModalProps, 'modalStatus' | 'setModalStatus'>

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
    words: number;
}

export type Progress = IProgressEntry[];

interface ICoreChartProps {
    data: Progress;
    metric: string;
    chartWidth: number;
	chartHeight: number;
	margin: { top: number; right: number; bottom: number; left: number };
	xLabel: string;
	yLabel: string;
    yIsAbsolute: boolean;
}

export interface IHistogramProps extends ICoreChartProps {
	min: number;
	max: number;
	binWidth: number;
    barGap: number;
    xTickSpacing: number;
    xCutoff: 'high' | 'low' | 'both' | 'none';
    lowerIsBetter: boolean;
	yTicks: number;
}

export interface IStackedAreaProps extends ICoreChartProps {
    xResolution: number;
}

export interface ITimeGroup {
	time: Date;
	[key: number]: number;
}[];
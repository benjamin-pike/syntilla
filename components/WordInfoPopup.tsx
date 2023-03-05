import { useState, useRef } from "react";
import { IDictionaryEntry, IWord } from "../types/types";
import styles from "../styles/content.module.css";

const POS_TAGS: Record<string, string> = {
	ADJ: "Adjective",
	ADP: "Adposition",
	ADV: "Adverb",
	AUX: "Auxiliary",
	CCONJ: "Conjunction",
	DET: "Determiner",
	INTJ: "Interjection",
	NOUN: "Noun",
	NUM: "Numeral",
	PART: "Particle",
	PRON: "Pronoun",
	PROPN: "Proper Noun",
	PUNCT: "Punctuation",
	SCONJ: "Conjunction",
	VERB: "Verb"
};

const SD_POS_MAP: Record<string, string[]> = {
    ADJ: ['adjective'],
    ADP: ['preposition'],
    ADV: ['adverb'],
    AUX: ['auxiliary verb'],
    CCONJ: ['conjunction'],
    DET: ['definite article', 'pronoun', 'adjective'],
    INTJ: ['interjection'],
    NOUN: ['feminine noun', 'masculine noun', 'masculine or feminine noun', 'noun', 'plural noun'],
    PRON: ['pronoun'],
    PROPN: ['proper noun'],
    SCONJ: ['conjunction'],
    VERB: ['copular verb', 'impersonal verb', 'intransitive verb', 'pronominal verb', 'reciprocal verb', 'reflexive verb', 'transitive verb']
}

interface IWordInfoPopupProps {
    wordInfoFunctions: any;
    highlightedWord: [number, number];
    setHighlightedWord: (highlightedWord: [number, number]) => void;
    highlightedWordData: IWord;
    translations: IDictionaryEntry | null;
}

export const WordInfoPopup = (props: IWordInfoPopupProps) => {
    const wordInfoRef = useRef<HTMLElement>(null);
    const [wordInfoIsOpen, setWordInfoIsOpen] = useState<boolean>(false);

    const handlePromptClick = (
        e: React.MouseEvent<HTMLSpanElement>,
        lineIndex: number,
        wordIndex: number,
    ) => {
		if (!wordInfoRef.current) return;
        
        const spanElement = e.currentTarget as HTMLSpanElement;

        const changeAndOpenWordInfo = () => {
            if (!wordInfoRef.current) return;

            props.setHighlightedWord([lineIndex, wordIndex]);

            const openWordInfo = () => {
                if (!wordInfoRef.current) {
                    return;
                }
     
                const wordInfoContentElement = wordInfoRef.current.querySelector<HTMLDivElement>(`#${styles.wordInfoContent}`)
                if (!wordInfoContentElement) return;
    
    
                const { left, right, top, bottom } = spanElement.getBoundingClientRect();
                const midY = (top + bottom) / 2;
                const vh = window.innerHeight / 100;
    
                const translationOffset = (wordInfoContentElement.offsetHeight / 2) + (15 * vh) - midY;
    
                if (window.innerWidth > 768) {
                    wordInfoRef.current.style.translate = `unset`;

                    let side: 'left' | 'right' = 'right';
    
                    if (left > window.innerWidth - right) {
                        side = 'left';
                    }
        
                    if (side === 'left') {
                        wordInfoRef.current.style.right = `calc(${window.innerWidth - left}px + 1em)`;
                        wordInfoRef.current.style.left = 'unset';
                    } else {
                        wordInfoRef.current.style.left = `calc(${right}px + 1em)`;
                        wordInfoRef.current.style.right = 'unset';
                    }
                } else {
                    wordInfoRef.current.style.left = '50%';
                    wordInfoRef.current.style.right = 'unset';
                    wordInfoRef.current.style.translate = `-50%`;
                }
    
                wordInfoRef.current.style.top = `${midY}px`;
    
                wordInfoRef.current.style.transform = `translateY(calc(-50% + ${translationOffset > 0 ? translationOffset : 0}px))`;
                wordInfoRef.current.style.height = `${wordInfoContentElement.offsetHeight}px`;
                wordInfoRef.current.style.width = `${wordInfoContentElement.offsetWidth}px`;
    
                setWordInfoIsOpen(true);
            }
    
            if (lineIndex === props.highlightedWord[0] && wordIndex === props.highlightedWord[1]) {
                openWordInfo();
                return;
            }
    
            const observer = new MutationObserver(() => {
                openWordInfo();
                observer.disconnect();
            });
    
            observer.observe(wordInfoRef.current, { childList: true, subtree: true });
        }

        if (wordInfoIsOpen) {
            closeWordInfo()

            if (lineIndex === props.highlightedWord[0] && wordIndex === props.highlightedWord[1]) {
                return;
            }

            setTimeout(
                changeAndOpenWordInfo, 
                getComputedStyle(wordInfoRef.current).transition !== 'none 0s ease 0s' 
                    ? 300 
                    : 0
            );
            return
        }

        changeAndOpenWordInfo();
    }

    const closeWordInfo = () => {
        if (!wordInfoRef.current) return;

        wordInfoRef.current.style.height = '0px';
        wordInfoRef.current.style.width = '0px';
        wordInfoRef.current.style.transform = `translateY(-50%)`;

        setWordInfoIsOpen(false);
    }

    props.wordInfoFunctions.current = {
        closeWordInfo,
        handlePromptClick,
        setWordInfoIsOpen
    }

    return(
        <section 
            ref={wordInfoRef} 
            id={styles.wordInfo}
            data-state = {wordInfoIsOpen ? 'open' : 'closed'}
        >
            <div 
                id = {styles.wordInfoContent}
            >
                <h1>
                    <span id={styles.wordInfoWord}>
                        {props.highlightedWordData.tokens[0].pos !== "PROPN"
                            ? props.highlightedWordData.word.toLowerCase()
                            : props.highlightedWordData.word}
                    </span>
                    <span
                        className={styles.wordInfoPos}
                        data-pos={props.highlightedWordData.tokens[0].pos}
                    >
                        {POS_TAGS[props.highlightedWordData.tokens[0].pos].toLowerCase()}
                    </span>
                </h1>
                {props.highlightedWordData.tokens[0].lemma !== props.highlightedWordData.word && (
                    <>
                        <div className={styles.wordInfoSeparator} />
                        <p>
                            <span id={styles.wordInfoLemmaLabel}>Derived from</span>
                            <span id={styles.wordInfoLemma}>
                                {props.highlightedWordData.tokens[0].lemma}
                            </span>
                        </p>
                    </>
                )}
                {props.translations && <>
                    <div className={styles.wordInfoSeparator} />
                    <section id={styles.wordInfoTranslations}>
                        <h2>Translations</h2>
                        <p id={styles.translationsCopyright}>
                            <a
                                href={`https://spanishdict.com/translate/${props.highlightedWordData.tokens[0].lemma}`}
                                target="_blank"
                            >
                                © Curiosity Media Inc.
                            </a>
                        </p>
                        <ul id={styles.wordInfoPrimaryTranslations}>
                            {props.translations && props.translations.principal.map((translation: string) => (
                                <li>{translation}</li>
                            ))}
                        </ul>
                        <ul id={styles.wordInfoDetailedTranslations}>
                            {props.translations && props.translations.posChunks.map(
                                (posChunk) =>
                                    SD_POS_MAP[props.highlightedWordData.tokens[0].pos] &&
                                    SD_POS_MAP[props.highlightedWordData.tokens[0].pos].includes(
                                        posChunk.pos
                                    ) && (
                                        <li>
                                            <h3
                                                className={styles.translationPos}
                                                data-pos={props.highlightedWordData.tokens[0].pos}
                                            >
                                                {posChunk.pos}
                                            </h3>
                                            <ul className = {styles.translationPosChunk}>
                                                {posChunk.senseChunks.map(
                                                    ({ sense, translations }) => (
                                                        translations.length > 0 && <li
                                                            className={styles.translationSenseChunk}
                                                            data-direction={
                                                                translations.length > 1
                                                                    ? "column"
                                                                    : "row"
                                                            }
                                                        >
                                                            <h4>({sense})</h4>
                                                            {translations.length > 1 ? (
                                                                <ul>
                                                                    {translations.map(
                                                                        (translation: string) => (
                                                                            <li className = {styles.translation}>
                                                                                {translation}
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            ) : (
                                                                <p className = {styles.translation}>
                                                                    {translations[0]}
                                                                </p>
                                                            )}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </li>
                                    )
                            )}
                        </ul>
                    </section>
                </>}
            </div>
        </section>
    )
}

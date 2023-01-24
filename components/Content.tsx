import stringSimilarity from "string-similarity";
import { useState, useRef, useEffect } from "react";
import { useDelayedState } from "../hooks/useDelayedState";
import { useSettings } from "../store/settings.context";
import { Language, Sentence, ISentence } from "../types/types";
import { measureText } from "../utils/measure-text.utils";
import { balanceText } from "../utils/balance-text.utils";
import { WordInfoPopup } from "./WordInfoPopup";
import styles from "../styles/content.module.css";

const Content = () => {
	const { dynamicGrading, direction } = useSettings();

	const [sentences, setSentences] = useState<ISentence[]>([]);
	const [sentenceIndex, setSentenceIndex, delayedSentenceIndex] = useDelayedState<number>(0, 500);

	const [promptTextLines, setPromptTextLines] = useState<number>(0);
	const [translationTextLines, setTranslationTextLines] = useState<number>(0);

	const [inputText, setInputText] = useState<string>("");
	const [isChecked, setIsChecked, delayedIsChecked] = useDelayedState<boolean>(false, 500);
	const [percentage, setPercentage, delayedPercentage] = useDelayedState<number>(0, 500);

	const [promptTextStatus, setPromptTextStatus] = useState<string>("static");
	const [randomLanguageSelections] = useState<number[]>(
		[...Array(30)].map(() => Math.round(Math.random()))
	);
	const [highlightedWord, setHighlightedWord] = useState<[number, number]>([0, 0]);

	const promptTextRef = useRef<HTMLParagraphElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const correctTranslationRef = useRef<HTMLDivElement>(null);
	const percentageRef = useRef<HTMLParagraphElement>(null);

	const wordInfoFunctions = useRef({
		handlePromptClick: (
			_e: React.MouseEvent<HTMLSpanElement>,
			_lineIndex: number,
			_wordIndex: number
		) => {},
		closeWordInfo: () => {},
		setWordInfoIsOpen: (_isOpen: boolean) => {}
	});

	const getLanguages = (): [Language, Language] => {
		if (direction.spanishToEnglish && !direction.englishToSpanish) {
			return ["es", "en"];
		}

		if (direction.englishToSpanish && !direction.spanishToEnglish) {
			return ["en", "es"];
		}

		if (randomLanguageSelections[sentenceIndex]) {
			return ["es", "en"];
		} else {
			return ["en", "es"];
		}
	};

	const [promptLanguage, translationLanguage] = getLanguages();

	const promptWordArray: Sentence =
		sentences[sentenceIndex] && sentences[sentenceIndex][promptLanguage]
			? sentences[sentenceIndex][promptLanguage]
			: [];
	const answerWordArray: Sentence =
		sentences[delayedSentenceIndex] && sentences[delayedSentenceIndex][translationLanguage]
			? sentences[delayedSentenceIndex][translationLanguage]
			: [];

	const promptString = promptWordArray.reduce(
		(string, { word, whitespace }) => (string += word + (whitespace ? " " : "")),
		""
	);

	const answerString = answerWordArray.reduce(
		(string, { word, whitespace }) => (string += word + (whitespace ? " " : "")),
		""
	);

	let balancedPromptText: Sentence[] = balanceText(promptWordArray, promptTextLines) ?? [""];
	let balancedAnswerText: Sentence[] = balanceText(answerWordArray, translationTextLines) ?? [""];

	const highlightedWordData = balancedPromptText[highlightedWord[0]][highlightedWord[1]];

	const translations = sentences[sentenceIndex] && sentences[sentenceIndex].translations[promptLanguage]
		? sentences[sentenceIndex].translations[promptLanguage].find(
				(translation: any) =>
					translation && translation.lemma === highlightedWordData.tokens[0].lemma
		  )
		: null;

	// Reset isChecked, inputText, percentage, highlightedWord, and wordInfoIsOpen and set the text area height to auto
	const resetSettings = () => {
        setIsChecked(false);
		setInputText("");
		setPercentage(0);
		setHighlightedWord([0, 0]);

		wordInfoFunctions.current.setWordInfoIsOpen(false);

		if (inputRef.current) {
			inputRef.current.style.height = "auto";
		}
	};

	// Upon button click, if the answer is not checked, grade the answer, else move to the next sentence
	const handleButtonClick = async () => {
		if (!inputText) {
			return;
		}

		if (!correctTranslationRef.current) {
			return;
		}

		const paragraphElement = correctTranslationRef.current.querySelector("p");

		if (!paragraphElement) {
			return;
		}

		if (!isChecked) {
			let percentage;

			let normalized: {
				input: string;
				answer: string;
				translatedInput?: string;
				promptText?: string;
			} = {
				input: inputText.endsWith(".")
					? inputText.slice(0, -1).toLowerCase()
					: inputText.toLowerCase(),
				answer: answerString.endsWith(".")
					? answerString.slice(0, -1).toLowerCase()
					: answerString.toLowerCase()
			};

			const staticComparision = stringSimilarity.compareTwoStrings(
				normalized.input,
				normalized.answer
			);

			if (dynamicGrading) {
				const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_URL}/api/translate`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						sentence: inputText,
						language: {
							from: translationLanguage,
							to: promptLanguage
						}
					})
				});

				const data = await response.json();
				const translatedInput = data.translation;

				(normalized.translatedInput = translatedInput.endsWith(".")
					? translatedInput.slice(0, -1).toLowerCase()
					: translatedInput.toLowerCase()),
					(normalized.promptText = promptString.endsWith(".")
						? promptString.slice(0, -1).toLowerCase()
						: promptString.toLowerCase());

				if (!normalized.translatedInput || !normalized.promptText) {
					return;
				}

				const dynamicComparison = stringSimilarity.compareTwoStrings(
					normalized.translatedInput,
					normalized.promptText
				);

				percentage = Math.round(Math.max(staticComparision, dynamicComparison) * 1000) / 10;
			}

			if (!percentage) {
				percentage = Math.round(staticComparision * 1000) / 10;
			}

			setPercentage(percentage);

			correctTranslationRef.current.style.height = paragraphElement.offsetHeight + "px";
			setIsChecked(true);
			return;
		}

		if (sentenceIndex < sentences.length - 1) {
			if (!promptTextRef.current) {
				return;
			}

			setPromptTextStatus("fade-out");

			resetSettings();
			correctTranslationRef.current.style.height = 0 + "px";

			setTimeout(() => {
				if (!promptTextRef.current) {
					return;
				}
				setPromptTextStatus("transitioning");
				setSentenceIndex((prevIndex) => prevIndex + 1);

				setTimeout(() => {
					setPromptTextStatus("fade-in");

					setTimeout(() => {
						setPromptTextStatus("static");
					}, 500);
				}, 100);
			}, 500);
		}
	};

	// Scales text area to fit text
	const scaleInput = () => {
		if (!inputRef.current) {
			return;
		}

		inputRef.current.style.height = "auto";
		inputRef.current.style.height = inputRef.current.scrollHeight + "px";
	};

	const scaleAnswerContainer = () => {
		const paragraphElement = correctTranslationRef.current?.querySelector("p");

		if (!correctTranslationRef.current || !paragraphElement || !isChecked) {
			return;
		}
		const transition = getComputedStyle(correctTranslationRef.current).transition;
		correctTranslationRef.current.style.transition = "none";

		correctTranslationRef.current.style.height = paragraphElement.offsetHeight + "px";

		correctTranslationRef.current.style.transition = transition;
	};

	// Handles input changes and scales text area (if 'enter' is pressed, it will submit the answer)
	const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const textArea = e.target;

		if (textArea.value.includes("\n")) {
			handleButtonClick();
			return;
		}

		scaleInput();
		setInputText(textArea.value);
	};

	// When the prompt sentence changes, set the height of the prompt text container based on the number of lines
	const setPromptTextHeight = (lines: number) => {
		if (!promptTextRef.current) {
			return;
		}

		if (promptTextStatus === "static") {
			promptTextRef.current.style.height = "auto";
			return;
		}

		const firstSpan = promptTextRef.current.querySelector("span");

		if (!firstSpan) {
			return;
		}

		promptTextRef.current.style.height = `${firstSpan.offsetHeight * lines}px`;
	};

	// Calculate the number of lines the prompt text should be split into based on the width of the container
	const calculateTextLines = () => {
		if (!promptTextRef.current || !correctTranslationRef.current) {
			return;
		}

		const promptContainerWidth = promptTextRef.current.offsetWidth;
		const promptSpanElements: HTMLSpanElement[] = Array.from(
			promptTextRef.current.querySelectorAll(`span.${styles.promptTextLine}`)
		);
		const promptSentenceLength = measureText(
			promptString,
			0,
			getComputedStyle(promptTextRef.current).font
		);

		const translationContainerWidth = correctTranslationRef.current.offsetWidth;
		const translationSpanElements = Array.from(
			correctTranslationRef.current.querySelectorAll("span")
		);
		const translationSentenceLength = measureText(
			answerString,
			0,
			getComputedStyle(correctTranslationRef.current).font
		);

		if (promptSentenceLength === 0 || translationSentenceLength === 0) {
			return;
		}

		let promptLines = Math.ceil(promptSentenceLength / promptContainerWidth);
		let translationLines = Math.ceil(translationSentenceLength / translationContainerWidth);

		const promptIncrease = promptSpanElements.reduce((increase, span) => {
			if (span.offsetWidth > promptContainerWidth && promptTextLines !== 0) {
				increase = 1;
			}
			return increase;
		}, 0);

		const translationIncrease = translationSpanElements.reduce((increase, span) => {
			if (span.offsetWidth > translationContainerWidth && promptTextLines !== 0) {
				increase = 1;
			}
			return increase;
		}, 0);

		setPromptTextLines(promptLines + promptIncrease);
		setTranslationTextLines(translationLines + translationIncrease);
		setPromptTextHeight(promptLines + promptIncrease);
	};

    // Load sentences from API
	useEffect(() => {
		(async () => {
			const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_URL}/api/sentences`);
			const data = await response.json();
			if (data.error) {
				return;
			}

			for (let s in data) {
				const sentence = data[s];
				for (let language of Object.keys(sentence)) {
					if (["es", "en"].includes(language)) {
						for (let i in sentence[language]) {
							const nextElement = sentence[language][Number(i) + 1];
							const addWhiteSpace =
								nextElement && nextElement.tokens[0].pos !== "PUNCT";

							data[s][language][i].whitespace = addWhiteSpace;
						}
					}
				}
			}

            setSentences(data);
			calculateTextLines();
		})();
	}, []);

	// Recalculate text lines when the prompt text changes
	useEffect(() => {
		let shouldRecalculate = true;
		let observer = new MutationObserver(() => {
			if (shouldRecalculate) {
				calculateTextLines();
			}
		});

		if (promptTextRef.current && promptTextLines !== 0) {
			observer.observe(promptTextRef.current, { characterData: true, subtree: true });
		} else {
			let interval: ReturnType<typeof setInterval>;

			const checkForPromptText = () => {
				if (promptTextRef.current?.textContent) {
					calculateTextLines();
					observer.observe(promptTextRef.current, { characterData: true, subtree: true });
					clearInterval(interval);
				}
			};

			interval = setInterval(checkForPromptText, 10);
			return;
		}

		return () => observer.disconnect();
	}, [promptTextLines, promptTextRef.current]);

	// Calculate text lines on resize
	if (typeof window !== "undefined") {
		window.onresize = () => {
			let timeout: ReturnType<typeof setTimeout>;

			const debouncescaleInput = () => {
				clearInterval(timeout);

				if (!promptTextRef.current) {
					return;
				}

				const fontSize = parseInt(promptTextRef.current.style.fontSize);

				timeout = setTimeout(() => {
					if (
						promptTextRef.current &&
						parseInt(promptTextRef.current.style.fontSize) !== fontSize
					) {
						scaleInput();
					}
				}, 200);
			};

			scaleInput();
			scaleAnswerContainer();

			calculateTextLines();
			debouncescaleInput();

			wordInfoFunctions.current.closeWordInfo();
			setHighlightedWord([0, 0]);
        }

		window.onclick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (
				!target.classList.contains(styles.promptTextWord) &&
				!target.closest(`#${styles.wordInfoContent}`)
			) {
				wordInfoFunctions.current.closeWordInfo();
			}
		};
	}

	return (
		<>
			{highlightedWordData && (
				<WordInfoPopup
					wordInfoFunctions={wordInfoFunctions}
					highlightedWordData={highlightedWordData}
					setHighlightedWord={setHighlightedWord}
					highlightedWord={highlightedWord}
					translations={translations ?? null}
				/>
			)}
			<p
				ref={promptTextRef}
				className={styles.promptText}
				data-transition-status={promptTextStatus}
			>
				{balancedPromptText.length &&
					balancedPromptText.map((line, lineIndex) => (
						<>
							<span className={styles.promptTextLine}>
								{line.map(({ word, tokens, whitespace }, wordIndex) => (
									<span
										className={styles.promptTextWord}
										data-word={word}
										data-pos={tokens[0].pos}
										data-space={`${whitespace}`}
										onClick={(e) =>
											wordInfoFunctions.current.handlePromptClick(
												e,
												lineIndex,
												wordIndex
											)
										}
									>
										{word}
									</span>
								))}
							</span>
							<br />
						</>
					))}
			</p>
			<textarea
				ref={inputRef}
				className={styles.input}
				rows={1}
				spellCheck={false}
				onChange={handleInput}
				readOnly={isChecked}
				value={inputText}
			/>
			<div
				ref={correctTranslationRef}
				className={styles.correctTranslation}
				data-ischecked={isChecked.toString()}
			>
				<p>
					{balancedAnswerText.length &&
						balancedAnswerText.map((line) => (
							<>
								<span>{line.map((word) => word.word).join(" ")}</span>
								<br />
							</>
						))}
				</p>
			</div>
			<section className={styles.buttonAndPercentage} data-ischecked={isChecked.toString()}>
				<p
					ref={percentageRef}
					className={styles.percentage}
					data-color={
						percentage > 95
							? "green"
							: percentage > 80
							? "yellow"
							: percentage > 50
							? "orange"
							: "red"
					}
				>
					{`${delayedIsChecked ? delayedPercentage : percentage}%`}
				</p>
				<button className={styles.checkButton} onClick={handleButtonClick}>
					<p>{isChecked ? "Next Sentence" : "Check Answer"}</p>
				</button>
			</section>
		</>
	);
};

export default Content;

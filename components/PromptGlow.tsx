import styles from "../styles/content.module.css";

interface PromptGlowProps {
	hoveredWordPos: string | null;
}

const GRADIENTS_MAP: Record<string, number> = {
	NOUN: 1,
	PROPN: 1,
	DET: 2,
	PRON: 2,
	ADJ: 3,
	NUM: 3,
	ADV: 4,
	AUX: 5,
	VERB: 5,
	CCONJ: 6,
	SCONJ: 6,
	ADP: 7
};

export const PromptGlow = (props: PromptGlowProps) => {
	return (
		<>
			<div id={styles.promptGlowGradientRotation}>
				<span className={styles.promptGlow} data-gradient="1" />
				<span className={styles.promptGlow} data-gradient="2" />
				<span className={styles.promptGlow} data-gradient="3" />
				<span className={styles.promptGlow} data-gradient="4" />
				<span className={styles.promptGlow} data-gradient="5" />
				<span className={styles.promptGlow} data-gradient="6" />
				<span className={styles.promptGlow} data-gradient="7" />
			</div>
			<div id={styles.promptGlowGradientHover}>
				<span
					className={styles.promptGlow + " " + styles.promptGlowHover}
					data-gradient="1"
					data-active={`${
						props.hoveredWordPos && GRADIENTS_MAP[props.hoveredWordPos] === 1
					}`}
				/>
				<span
					className={styles.promptGlow + " " + styles.promptGlowHover}
					data-gradient="2"
					data-active={`${
						props.hoveredWordPos && GRADIENTS_MAP[props.hoveredWordPos] === 2
					}`}
				/>
				<span
					className={styles.promptGlow + " " + styles.promptGlowHover}
					data-gradient="3"
					data-active={`${
						props.hoveredWordPos && GRADIENTS_MAP[props.hoveredWordPos] === 3
					}`}
				/>
				<span
					className={styles.promptGlow + " " + styles.promptGlowHover}
					data-gradient="4"
					data-active={`${
						props.hoveredWordPos && GRADIENTS_MAP[props.hoveredWordPos] === 4
					}`}
				/>
				<span
					className={styles.promptGlow + " " + styles.promptGlowHover}
					data-gradient="5"
					data-active={`${
						props.hoveredWordPos && GRADIENTS_MAP[props.hoveredWordPos] === 5
					}`}
				/>
				<span
					className={styles.promptGlow + " " + styles.promptGlowHover}
					data-gradient="6"
					data-active={`${
						props.hoveredWordPos && GRADIENTS_MAP[props.hoveredWordPos] === 6
					}`}
				/>
				<span
					className={styles.promptGlow + " " + styles.promptGlowHover}
					data-gradient="7"
					data-active={`${
						props.hoveredWordPos && GRADIENTS_MAP[props.hoveredWordPos] === 7
					}`}
				/>
			</div>
		</>
	);
};

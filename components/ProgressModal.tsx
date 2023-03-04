import { useState, useMemo } from "react";
import { useUserProgress } from "../hooks/useUserProgress";
import { IHistogramProps, ModalStatusProps } from "../types/types";
import Modal from "./Modal";
import styles from "../styles/progress-modal.module.css";
import { Histogram } from "./d3/Histogram";
import { StackedArea } from "./d3/StackedArea";
import { HiChartBar } from "react-icons/hi";
import { FaFileImport } from "react-icons/fa";
import { AiOutlineUpload, AiOutlineDownload } from "react-icons/ai";

const parameters: Record<string, Omit<IHistogramProps, "data" | "metric">> = {
	ttc: {
		min: 0,
		max: 65,
		binWidth: 5,
		barGap: 15,
		chartWidth: 700,
		chartHeight: 600,
		margin: { top: 10, right: 15, bottom: 110, left: 100 },
		xLabel: "Time to complete (seconds)",
		yLabel: "Frequency",
		xTickSpacing: 1,
		xCutoff: "high",
		lowerIsBetter: true,
		yTicks: 10,
		yIsAbsolute: true
	},
	accuracy: {
		min: 35,
		max: 100,
		binWidth: 5,
		barGap: 15,
		chartWidth: 700,
		chartHeight: 600,
		margin: { top: 10, right: 10, bottom: 110, left: 100 },
		xLabel: "Accuracy (%)",
		yLabel: "Frequency",
		xTickSpacing: 1,
		xCutoff: "low",
		lowerIsBetter: false,
		yTicks: 10,
		yIsAbsolute: false
	},
	wpm: {
		min: 0,
		max: 65,
		binWidth: 5,
		barGap: 15,
		chartWidth: 700,
		chartHeight: 600,
		margin: { top: 10, right: 10, bottom: 110, left: 100 },
		xLabel: "Words per minute",
		yLabel: "Frequency",
		xTickSpacing: 1,
		xCutoff: "high",
		lowerIsBetter: false,
		yTicks: 10,
		yIsAbsolute: true
	}
};

interface IProgressModalProps extends ModalStatusProps {
    activeDays: number;
}

export const ProgressModal: React.FC<IProgressModalProps> = ({ modalStatus, setModalStatus, activeDays }) => {
	const { getProgress, get7DayTrend, importData, exportData } = useUserProgress();
	const [selectedMetric, setSelectedMetric] = useState<keyof typeof parameters>("ttc");
	const [selectedView, setSelectedView] = useState<"chart" | "data">("chart");
	const [selectedScale, setSelectedScale] = useState<"absolute" | "relative">("absolute");
	const [selectedTime, setSelectedTime] = useState<"now" | "trend">("now");

	const data = useMemo(() => getProgress(), [getProgress]);
	const trend = useMemo(() => get7DayTrend(), [get7DayTrend]);

	return (
		<Modal title="Progress" modalStatus={modalStatus} setModalStatus={setModalStatus}>
			<div id={styles.content} data-view={selectedView}>
				<div id={styles.summary}>
					<h1>
						<span id={styles.summaryTitle}>Seven Day Summary</span>
						<span id={styles.summaryLine}>{`Trending ${
							(trend.ttc + trend.wpm) / 2 > 0 ? "faster" : "slower"
						} ${
							(trend.ttc + trend.wpm) / 2 > 0 === trend.accuracy > 0 ? "and" : "but"
						} ${trend.accuracy > 0 ? "more" : "less"} accurate`}</span>
					</h1>
					<div id={styles.summaryChips}>
						<p
							className={styles.summaryChip}
							data-color={
								trend.ttc <= -10
									? "blue"
									: trend.ttc < 0
									? "green"
									: trend.ttc < 10
									? "yellow"
									: "red"
							}
						>
							<span className={styles.chipLabel}>Completion Time</span>
							<span className={styles.chipValue}>{`${
								trend.ttc < 0 ? "⭣" : "⭡"
							}${Math.abs(trend.ttc)}%`}</span>
						</p>
						<p
							className={styles.summaryChip}
							data-color={
								trend.wpm >= 10
									? "blue"
									: trend.wpm > 0
									? "green"
									: trend.wpm > -10
									? "yellow"
									: "red"
							}
						>
							<span className={styles.chipLabel}>WPM</span>
							<span className={styles.chipValue}>{`${
								trend.wpm < 0 ? "⭣" : "⭡"
							}${Math.abs(trend.wpm)}%`}</span>
						</p>
						<p
							className={styles.summaryChip}
							data-color={
								trend.accuracy >= 10
									? "blue"
									: trend.accuracy > 0
									? "green"
									: trend.accuracy > -10
									? "yellow"
									: "red"
							}
						>
							<span className={styles.chipLabel}>Accuracy</span>
							<span className={styles.chipValue}>{`${
								trend.accuracy < 0 ? "⭣" : "⭡"
							}${Math.abs(trend.accuracy)}%`}</span>
						</p>
					</div>
				</div>
				<div id={styles.topTabs}>
					<div className={styles.tabs} id={styles.metricTabs}>
						<button
							className={styles.tab}
							data-selected={`${selectedMetric === "ttc"}`}
							onClick={() => setSelectedMetric("ttc")}
						>
							Completion Time
						</button>
						<button
							className={styles.tab}
							data-selected={`${selectedMetric === "wpm"}`}
							onClick={() => setSelectedMetric("wpm")}
						>
							WPM
						</button>
						<button
							className={styles.tab}
							data-selected={`${selectedMetric === "accuracy"}`}
							onClick={() => setSelectedMetric("accuracy")}
						>
							Accuracy
						</button>
					</div>
					<div className={styles.tabs} id={styles.viewTabs}>
						<button
							className={styles.tab}
							data-selected={`${selectedView === "chart"}`}
							onClick={() => setSelectedView("chart")}
						>
							<HiChartBar />
						</button>
						<button
							className={styles.tab}
							data-selected={`${selectedView === "data"}`}
							onClick={() => setSelectedView("data")}
						>
							<FaFileImport />
						</button>
					</div>
				</div>
				<div className={styles.chart}>
					{selectedView === "chart" && selectedTime === "now" && (
						<Histogram
							key={`${selectedMetric}-${selectedScale}`}
							data={data}
							metric={selectedMetric}
							min={parameters[selectedMetric].min}
							max={parameters[selectedMetric].max}
							binWidth={parameters[selectedMetric].binWidth}
							barGap={parameters[selectedMetric].barGap}
							chartWidth={parameters[selectedMetric].chartWidth}
							chartHeight={parameters[selectedMetric].chartHeight}
							margin={parameters[selectedMetric].margin}
							xLabel={parameters[selectedMetric].xLabel}
							yLabel={
								selectedScale === "absolute"
									? "Completed Sentences (n)"
									: "Completed Sentences (%)"
							}
							xTickSpacing={parameters[selectedMetric].xTickSpacing}
							xCutoff={parameters[selectedMetric].xCutoff}
							lowerIsBetter={parameters[selectedMetric].lowerIsBetter}
							yTicks={parameters[selectedMetric].yTicks}
							yIsAbsolute={selectedScale === "absolute"}
						/>
					)}
					{selectedView === "chart" && selectedTime === "trend" && (
						<StackedArea
							key={`${selectedMetric}-${selectedScale}`}
							data={data}
							metric={selectedMetric}
							chartWidth={700}
							chartHeight={600}
							margin={{ top: 10, right: 10, bottom: 110, left: 100 }}
							xLabel="Date"
							yLabel={
								selectedScale === "absolute"
									? "Completed Sentences (n)"
									: "Completed Sentences (%)"
							}
							xResolution={3600}
							yIsAbsolute={selectedScale === "absolute"}
						/>
					)}
					{selectedView === "data" && (
						<div id={styles.dataHandling}>
							<div id={styles.dataHandlingButtonWrapper}>
								<button onClick={importData}>
									Upload and Import Data
									<AiOutlineUpload />
								</button>
								<p className={styles.dataWarning}>
									This will overwrite your current progress
								</p>
								<p id={styles.dataOr}>or</p>
								<button onClick={exportData}>
									Export and Download Data
									<AiOutlineDownload />
								</button>
								<p className={styles.dataWarning}>
									Do this before you clear your browser history
								</p>
							</div>
						</div>
					)}
				</div>
				<div id={styles.bottomTabs}>
					<div className={styles.tabs} id={styles.scaleTabs}>
						<button
							className={styles.tab}
							data-selected={selectedScale === "absolute"}
							onClick={() => setSelectedScale("absolute")}
						>
							Absolute
						</button>
						<button
							className={styles.tab}
							data-selected={selectedScale === "relative"}
							onClick={() => setSelectedScale("relative")}
						>
							Relative
						</button>
					</div>
					<div className={styles.tabs} id={styles.timeTabs}>
						<button
							className={styles.tab}
							data-selected={selectedTime === "now"}
							onClick={() => setSelectedTime("now")}
						>
							Now
						</button>
						<button
							className={styles.tab}
                            disabled={activeDays < 2}
							data-selected={selectedTime === "trend"}
							onClick={() => setSelectedTime("trend")}
						>
							Trend
						</button>
					</div>
				</div>
			</div>
		</Modal>
	);
};

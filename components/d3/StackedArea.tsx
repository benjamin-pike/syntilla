import { useRef, useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import { IStackedAreaProps, ITimeGroup } from "../../types/types";
import styles from "../../styles/stacked-area.module.css";
import { getDayFromTimestamp } from "../../utils/date.utils";
import { Tooltip } from "react-tooltip";
import { groupDataByMetric } from "../../utils/data.utils";
import { createRangeArray } from "../../utils/math.utils";

const CHUNK_SIZES: Record<string, number> = {
	ttc: 5,
	wpm: 5,
	accuracy: 5
};

const KEYS: Record<string, string[]> = {
	ttc: createRangeArray(5, 65, CHUNK_SIZES.ttc).map((n) => n.toString()),
	wpm: createRangeArray(5, 65, CHUNK_SIZES.wpm).map((n) => n.toString()),
	accuracy: createRangeArray(40, 100, CHUNK_SIZES.accuracy).map((n) => n.toString())
};

const baseColorArray = [
    "red", "red", "red",
    "yellow", "yellow", "yellow",
    "green", "green", "green",
    "blue", "blue", "blue"
]

const COLORS: Record<string, string[]> = {
    ttc: [...[...baseColorArray].reverse(), 'red'],
    wpm: [...baseColorArray, 'blue'],
    accuracy: ['red', ...baseColorArray]
};

console.log(COLORS)

export const StackedArea = (props: IStackedAreaProps) => {
	const svgRef = useRef(null);
	const [tooltipContent, setTooltipContent] = useState<string>("");

	const data: ITimeGroup[] = useMemo(() => {
		let groupedData = groupDataByMetric(
            props.data,
			props.xResolution,
			CHUNK_SIZES[props.metric],
			props.metric,
			KEYS[props.metric],
			props.yIsAbsolute
		);
		const mostRecentTime = groupedData[groupedData.length - 1].time;
		const mostRecentDay = getDayFromTimestamp(mostRecentTime);
		const monthAgo = mostRecentDay - 31 * 24 * 60 * 60;
		return groupedData.filter((d: ITimeGroup) => d.time >= new Date(monthAgo * 1000));
	}, []);

	useEffect(() => {
		const svg = d3.select(svgRef.current);

		// @ts-ignore
		const stackedData = d3.stack().keys(KEYS[props.metric])(data);
		const timeValues = data.map((d) => d.time);

		const yMin = 0;
		const yMax = props.yIsAbsolute ? props.data.length : 1;

		const height = props.chartHeight - props.margin.top - props.margin.bottom;
		const yScale = d3.scaleLinear().range([height, 0]).domain([yMin, yMax]);

		const adjustedLeftMargin =
			props.margin.left +
			(props.yIsAbsolute ? 12 * Math.floor(Math.log10(Math.max(...yScale.ticks()))) : 24);

		const width = props.chartWidth - adjustedLeftMargin - props.margin.right;
		const xScale = d3
			.scaleTime()
			.range([0, width])
			.domain([d3.min(timeValues) ?? 0, d3.max(timeValues) ?? Infinity]);

		interface D {
			[key: number]: number;
			data: {
				time: number;
				[key: number]: number;
			};
		}

		const xAxis = d3.axisBottom(xScale);
		const yAxis = d3.axisLeft(yScale);

		const area = d3
			.area<D>()
			.x((d) => xScale(d.data.time))
			.y0((d) => yScale(d[0]) + 0.5)
			.y1((d) => yScale(!Number.isNaN(d[1]) ? d[1] : yMax));

		const g = svg.append("g");

		g.append("g")
			.attr("transform", `translate(${adjustedLeftMargin}, ${height + props.margin.top})`)
			.call(
				xAxis
					.tickValues(xScale.ticks(30).filter((_, i, arr) => i % 3 === 0))
					// @ts-ignore
					.tickFormat(d3.timeFormat("%b %d"))
			)
			.selectAll(".tick")
			.style("color", "white")
			.selectAll("text")
			.style("color", "white")
			.attr("transform", "rotate(-45) translate(-65, 5)");

		g.append("g")
			.attr("class", styles.yAxis)
			.attr("transform", `translate(${adjustedLeftMargin}, ${props.margin.top})`)
			.call(
				yAxis
					.tickSize(-width)
					.tickFormat(
						props.yIsAbsolute
							? d3.format(".0f")
							: (d) => `${Math.round(Number(d) * 100)}%`
					)
			)
			.style("color", "rgb(255, 255, 255, 0.35)")
			.style("stroke-dasharray", "5,5")
			.selectAll("text")
			.style("transform", "translateX(-15px)")
			.style("color", "white");

		svg.append("text")
			.text(props.yLabel)
			.attr("class", "yAxisLabel")
			.attr("x", -height / 2)
			.attr("y", 25)
			.attr("transform", "rotate(-90)")
			.attr("text-anchor", "middle")
			.attr("color", "white")
			.attr("fill", "white")
			.style("white-space", "pre")
			.attr("font-size", "1.5rem");

		const segments = g
			.selectAll("segment")
			.data(stackedData.reverse())
			.enter()
			.append("path")
			// @ts-ignore
			.attr("d", (d) => area(d))
			.attr("class", styles.segment)
			.attr("transform", `translate(${adjustedLeftMargin}, ${props.margin.top})`)
			.attr("data-color", (_, i) => {
				const color = COLORS[props.metric][COLORS[props.metric].length - (i + 1)];
                console.log(COLORS[props.metric].length - (i + 1), color)
				return color;
			})
			.attr("data-tooltip-id", styles.tooltip)
			.attr("data-tooltip-float", true)
			.attr("data-tooltip-place", "top")
			.attr("data-tooltip-offset", (_, i, arr) => (i >= arr.length / 2 ? 10 : 20))
			.on("mouseenter", (_e, d) => {
				const upperBound = Number(d.key);
				const headers: Record<string, string> = {
					ttc: `${upperBound - CHUNK_SIZES.ttc}${
						d.index === COLORS[props.metric].length - 1 ? `+` : ` – ${upperBound}`
					}<span class = ${styles.unit}>  seconds</span>`,
					wpm: `${upperBound - CHUNK_SIZES.wpm}${
						d.index === COLORS[props.metric].length - 1 ? `+` : ` – ${upperBound}`
					}<span class = ${styles.unit}>  wpm</span>`,
					accuracy: `${
						d.index === 0 ? 0 : upperBound - CHUNK_SIZES.accuracy
					}% – ${upperBound}<span class = ${styles.unit}> %</span>`
				};
				const content = `
                    <div id = ${styles.tooltipContent}>
                        <span id = ${styles.tooltipHead}>
                            ${headers[props.metric]}
                        </span>
                        <section id = ${styles.tooltipBody}>
                            <div id = ${styles.tooltipBodyLabels}>
                                <p>${d3.timeFormat("%b %d")(data[data.length - 1].time)}</p>
                                <p>${d3.timeFormat("%b %d")(data[0].time)}</p>
                                <p>Delta</p>
                            </div>
                            <div id = ${styles.tooltipBodyValues}>
                                <p>
                                    ${
										props.yIsAbsolute
											? data[data.length - 1][upperBound]
											: (data[data.length - 1][upperBound] * 100).toFixed(1) +
											  "%"
									}
                                </p>
                                <p>
                                    ${
										props.yIsAbsolute
											? data[0][upperBound]
											: (data[0][upperBound] * 100).toFixed(1) + "%"
									}
                                </p>
                                <p>
                                    ${
										props.yIsAbsolute
											? data[data.length - 1][upperBound] -
											  data[0][upperBound]
											: ((data[data.length - 1][upperBound] -
													data[0][upperBound]) *
													100 >
											  0
													? "+"
													: "") +
											  (
													(data[data.length - 1][upperBound] -
														data[0][upperBound]) *
													100
											  ).toFixed(1) +
											  "%"
									}
                                </p>
                            </div>
                        </section>
                    </div>
                `;
				setTooltipContent(content);
			});

		[...Array(segments.size()).keys()].forEach((_, i) =>
			g
				.append("clipPath")
				.attr("id", `clip-${i}`)
				.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", 0)
				.attr("height", height)
		);

		segments.attr("clip-path", (_, i) => `url(#clip-${i})`);

		g.selectAll("clipPath")
			.select("rect")
			.transition()
			.duration(800)
			.attr("width", width)
			.delay((_, i, arr) => (arr.length - (i + 1)) / 3 * 100);
	}, [data]);

	return (
		<>
			<svg
				ref={svgRef}
				id={styles.container}
				viewBox={`0 0 ${props.chartWidth} ${props.chartHeight}`}
				data-tooltip-id={styles.tooltip}
				data-tooltip-content=""
				data-tooltip-place="top"
			/>
			<Tooltip id={styles.tooltip} html={tooltipContent} />
		</>
	);
};

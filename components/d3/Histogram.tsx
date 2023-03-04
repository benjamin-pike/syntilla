import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { Tooltip } from "react-tooltip";
import styles from "../../styles/histogram.module.css";
import { IHistogramProps } from "../../types/types";
import { constructMetricArray, getBinLowerBound, getBinUpperBound } from "../../utils/data.utils";

export const Histogram = (props: IHistogramProps) => {
	const svgRef = useRef(null);
    const [tooltipContent, setTooltipContent] = useState<string>("");

    const metricArrays: Record<string, number[]> = useMemo(() => ({
        ttc: constructMetricArray(props.data, "ttc", 65),
        wpm: constructMetricArray(props.data, "wpm", 65),
        accuracy: constructMetricArray(props.data, "accuracy", 35)
    }), [props.data])

    const data = metricArrays[props.metric]

	const binCount = (props.max - props.min) / props.binWidth;

	useEffect(() => {
		const svg = d3.select(svgRef.current);

		const bins = d3
			.bin()
			.thresholds(d3.ticks(props.min, props.max, binCount))
			.value((d) => d)(data);

		const height = props.chartHeight - props.margin.top - props.margin.bottom;
		const yScale = d3
			.scaleLinear()
			.domain(
				props.yIsAbsolute
					? [0, Math.max(...bins.map((d) => d.length))]
					: [0, Math.max(...bins.map((d) => d.length)) / props.data.length]
			)
			.range([height, 0]);

		const adjustedLeftMargin =
			props.margin.left +
			(props.yIsAbsolute ? 12 * Math.floor(Math.log10(Math.max(...yScale.ticks()))) : 24);
		const width = props.chartWidth - adjustedLeftMargin - props.margin.right;
		const xScale = d3.scaleLinear().domain([props.min, props.max]).range([0, width]);

		svg.append("g")
			.attr("class", "xAxis")
			.attr("transform", `translate(${adjustedLeftMargin}, ${height + props.margin.top})`)
			.call(
				d3
					.axisBottom(xScale)
					.ticks(binCount / props.xTickSpacing)
					// @ts-ignore - cannot get rid of type error
					.tickFormat((d, i, arr) => {
						if (
							(props.xCutoff === "high" && i === arr.length - 1) ||
							(props.xCutoff === "low" && i === 0) ||
							(props.xCutoff === "both" && (i === 0 || i === arr.length - 1))
						)
							return ". . .";
						return d.toString();
					})
			)
			.style("color", "white")
			.selectAll("text")
			.attr("transform", "rotate(-45) translate(-30, 5)");

        const yTicks = [...Array(props.yTicks * 1.5).keys()].map((n) => yScale.ticks(n).length).reduce((closest, curr, index, arr) => {          
            if (Math.abs(curr - props.yTicks) < Math.abs(arr[closest] - props.yTicks)) {
              return index;
            }
            return closest;
          }, 0) + 1;

		svg.append("g")
			.call(
				d3
					.axisLeft(yScale)
					.tickSize(-width)
					.tickValues(
						props.yIsAbsolute
							? yScale.ticks(yTicks).filter((tick) => Number.isInteger(tick))
							: yScale.ticks(yTicks)
					)
					.tickFormat(
						props.yIsAbsolute
							? d3.format(".0f")
							: (d) => `${Math.round(Number(d) * 100)}%`
					)
			)
			.attr("transform", `translate(${adjustedLeftMargin}, ${props.margin.top})`)
			.style("color", "rgb(255, 255, 255, 0.35)")
			.style("stroke-dasharray", "5,5")
			.attr("class", styles.yAxis)
			.selectAll("text")
			.style("color", "white")
			.style("transform", "translateX(-15px)");

		svg.append("text")
			.text(props.xLabel)
			.attr("class", "xAxisLabel")
			.attr("x", adjustedLeftMargin + width / 2)
			.attr("y", props.chartHeight - 10)
			.attr("text-anchor", "middle")
			.attr("color", "white")
			.attr("fill", "white")
			.attr("font-size", "1.5rem");

		svg.append("text")
			.text(props.yLabel)
			.attr("class", "yAxisLabel")
			.attr("x", -height / 2)
			.attr("y", 25)
			.attr("transform", "rotate(-90)")
			.attr("text-anchor", "middle")
			.attr("color", "white")
			.attr("fill", "white")
			.attr("font-size", "1.5rem");

		const graphArea = svg
			.append("g")
			.attr("transform", `translate(${adjustedLeftMargin}, ${props.margin.top})`)
			.attr("height", height + "px");

		svg.append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", width)
			.attr("height", yScale(0));

		graphArea
			.attr("clip-path", "url(#clip)")
			.selectAll("bar")
			.data(bins.filter((d) => d.x0 !== undefined && d.x1 !== undefined))
			.enter()
			.append("path")
			.attr("class", styles.bar)
			.attr("bin", (d) => `${getBinUpperBound(d[0], props.binWidth)}`)
            .attr('data-metric', props.metric)
			.attr("data-color", (d) => {
				const binNumber = getBinUpperBound(d[0], props.binWidth);

				const closestTickIndex = xScale.ticks().reduce((i, _, j, arr) => {
					return Math.abs(arr[j] - binNumber) < Math.abs(arr[i] - binNumber) ? j : i;
				}, 0);

				const quartile = Math.floor(
					((closestTickIndex - (props.xCutoff === "low" ? 1 : 0)) /
						(xScale.ticks().length - 1)) *
						4
				);

				if (props.lowerIsBetter) {
					return quartile === 0
						? "blue"
						: quartile === 1
						? "green"
						: quartile === 2
						? "yellow"
						: "red";
				}

				return quartile === 0
					? "red"
					: quartile === 1
					? "yellow"
					: quartile === 2
					? "green"
					: "blue";
			})
			.style("transform-origin", height + "px")
			.attr("d", (d) => {
				let barWidth =
					xScale(getBinUpperBound(d[0], props.binWidth)) - xScale(getBinLowerBound(d[0], props.binWidth)) - props.barGap;
				let barHeight = barWidth;
				let r = barWidth / 2; // bar radius
				return `M${xScale(getBinLowerBound(d[0], props.binWidth)) + props.barGap / 2},${
					yScale(0) + r
				} a${r},${r} 0 0 1 ${r},${-r} h${barWidth - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${
					barHeight - r - 1
				} h${-barWidth}`;
			})
            // Tooltip
            .attr("data-tooltip-id", styles.tooltip)
			.attr("data-tooltip-place", 'top')
			.attr("data-tooltip-offset", 10)
            .attr('data-tooltip-float', 'true')
            .on("mouseenter", (_e, d) => {
                const units: Record<string, string> = {
                    ttc: ' seconds',
                    wpm: ' wpm',
                    accuracy: '%'
                }
                // @ts-ignore
                console.log(props.max, props.min, d.x0, d.x1);
                const head: Record<string, string> = {
                    // @ts-ignore
                    ttc: getBinLowerBound(d[0], props.binWidth) + (d.x1 > props.max - props.binWidth ? '+' : ` – ${getBinUpperBound(d[0], props.binWidth)}`),
                    // @ts-ignore
                    wpm: getBinLowerBound(d[0], props.binWidth) + (d.x1 > props.max - props.binWidth ? '+' : ` – ${getBinUpperBound(d[0], props.binWidth)}`),
                    // @ts-ignore
                    accuracy: (d.x0 - props.binWidth <= props.min  ? 0 : getBinLowerBound(d[0], props.binWidth)) + ` – ${getBinUpperBound(d[0], props.binWidth)}`,
                }

                const content = `
                    <div id = ${styles.tooltipContent}>
                        <p id = ${styles.tooltipHead}>
                            ${head[props.metric]}
                            <span class = ${styles.unit}>${units[props.metric]}</span>
                        </p>
                        <p id ${styles.tooltipBody}>
                            ${props.yIsAbsolute ? d.length : (100 * d.length / props.data.length).toFixed(1)}${props.yIsAbsolute ? ' sentence' + (d.length !== 1 ? 's' : '') : '% of sentences'}
                        </p>
                    </div>
                `;
                setTooltipContent(content);
            })
			// Animation
			.transition()
			.duration(800)
			.attr("d", (d) => {
				let barWidth =
					xScale(getBinUpperBound(d[0], props.binWidth)) - xScale(getBinLowerBound(d[0], props.binWidth)) - props.barGap;
				const dLength = props.yIsAbsolute ? d.length : d.length / props.data.length;
				let barHeight = height - yScale(dLength) + barWidth;
				let r = barWidth / 2; // bar radius

				return `M${xScale(getBinLowerBound(d[0], props.binWidth)) + props.barGap / 2},${
					yScale(dLength) + r
				} a${r},${r} 0 0 1 ${r},${-r} h${barWidth - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${
					barHeight - r - 1
				} h${-barWidth}`;
			})
			.delay((_, i) => i * 50);
	}, []);

	return (
        <>
            <svg
                ref={svgRef}
                id={styles.container}
                viewBox={`0 0 ${props.chartWidth} ${props.chartHeight}`}
                preserveAspectRatio="xMidYMid meet"
                data-tooltip-id={styles.tooltip}
				data-tooltip-content=""
				data-tooltip-place="top"
            >
                <defs>
                    <linearGradient
                        className={styles.barGradient}
                        id="barGradientIndigoBlue"
                        gradientTransform="rotate(90)"
                    >
                        <stop offset="0%" stop-color="var(--purple)" />
                        <stop offset="100%" stop-color="var(--blue)" />
                    </linearGradient>
                    <linearGradient
                        className={styles.barGradient}
                        id="barGradientTealGreen"
                        gradientTransform="rotate(90)"
                    >
                        <stop offset="0%" stop-color="var(--teal)" />
                        <stop offset="100%" stop-color="var(--green)" />
                    </linearGradient>
                    <linearGradient
                        className={styles.barGradient}
                        id="barGradientLimeYellow"
                        gradientTransform="rotate(90)"
                    >
                        <stop offset="0%" stop-color="var(--lime)" />
                        <stop offset="100%" stop-color="var(--yellow)" />
                    </linearGradient>
                    <linearGradient
                        className={styles.barGradient}
                        id="barGradientOrangeRed"
                        gradientTransform="rotate(90)"
                    >
                        <stop offset="0%" stop-color="var(--orange)" />
                        <stop offset="50%" stop-color="var(--red)" />
                    </linearGradient>
                    <linearGradient
                        className={styles.barGradient}
                        id="barGradientRedPink"
                        gradientTransform="rotate(90)"
                    >
                        <stop offset="0%" stop-color="var(--pink)" />
                        <stop offset="100%" stop-color="var(--purple)" />
                    </linearGradient>
                </defs>
            </svg>
            <Tooltip
                id={styles.tooltip}
                delayHide={75}
                html={tooltipContent} 
            />
        </>
	);
};

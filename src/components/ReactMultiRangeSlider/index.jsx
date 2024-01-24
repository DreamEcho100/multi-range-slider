// import { useStore } from 'zustand';
// import { useId } from 'react';
import { useMemo } from 'react';
import classes from './index.module.css';
import RangesSliders from './Sliders';
import RangeTrackIndicator from './TrackIndicator';
import { useStore } from 'zustand';

/**
 * @example
 * ```tsx
 * const mrsStore = useCreateMRSStore({
 * 	min: 0,
 * 	max: 48,
 * 	rangeType: 'down',
 * 	step: 0.5,
 * 	sliders: [
 * 		// { start: 0, end: 48 }
 * 		{ start: 0, end: 8 },
 * 		{ start: 9, end: 17 },
 * 		{ start: 23, end: 32 },
 * 		{ start: 35, end: 48 }
 * 	]
 * });
 *
 * <ReactMultiRangeSlider
 * 	store={mrsStore}
 * 	onSliderChange={(params) => {
 * 		console.log(
 * 			`id: ${params.slider.id}, start: ${params.slider.start}, end: ${params.slider.end}`
 * 		);
 * 	}}
 * />;
 * ```
 * @param {{
 * store: import('./utils').CreateMRSStoreApi
 * onSliderChange: import('./utils').OnSliderChange;
 * }} props
 */
export default function ReactMultiRangeSlider(props) {
	const min = useStore(props.store, (state) => state.base.min);
	const max = useStore(props.store, (state) => state.base.max);

	const __offset = useMemo(() => {
		return (16 * (1 / (max - min))).toFixed(2);
	}, [max, min]);

	return (
		<div
			className={classes.slider}
			style={
				/** @type {import('react').CSSProperties} */
				({
					width: 1024,
					position: 'relative',
					'--h': '0.4rem',
					height: 'var(--h)',
					'--min': min,
					'--max': max,
					'--r': `var(--h)`,
					'--offset': __offset
				})
			}
		>
			<RangesSliders
				store={props.store}
				onSliderChange={props.onSliderChange}
			/>
			<div className={classes['slider__track']} />

			<RangeTrackIndicator store={props.store} />
		</div>
	);
}

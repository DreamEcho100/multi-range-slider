// import { useStore } from 'zustand';
// import { useId } from 'react';
import { useMemo } from 'react';
import classes from './index.module.css';
import RangesSliders from './RangesSliders';
import RangeTrackIndicator from './RangeTrackIndicator';
import { useStore } from 'zustand';

/**
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

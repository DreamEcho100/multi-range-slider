import { useCallback, useEffect, useState, useRef } from 'react';
import './multiRangeSlider.css';

/**
 *
 * @param {{
 * min: number;
 * max: number;
 * onChange: (params: { min: number; max: number; }) => void;
 * }} props
 */
export default function MultiRangeSlider1(props) {
	const [minVal, setMinVal] = useState(props.min);
	const [maxVal, setMaxVal] = useState(props.max);
	/** @type {import('react').MutableRefObject<HTMLInputElement | null>} */
	const minValRef = useRef(null);
	/** @type {import('react').MutableRefObject<HTMLInputElement | null>} */
	const maxValRef = useRef(null);
	/** @type {import('react').MutableRefObject<HTMLDivElement | null>} */
	const rangeRef = useRef(null);

	// Convert to percentage
	const getPercent = useCallback(
		/** @param {number} value */
		(value) =>
			Math.round(((value - props.min) / (props.max - props.min)) * 100),
		[props.min, props.max]
	);

	// Set width of the range to decrease from the left side
	useEffect(() => {
		if (maxValRef.current) {
			const minPercent = getPercent(minVal);
			const maxPercent = getPercent(+maxValRef.current.value); // Preceding with '+' converts the value from type string to type number

			if (rangeRef.current) {
				rangeRef.current.style.left = `${minPercent}%`;
				rangeRef.current.style.width = `${maxPercent - minPercent}%`;
			}
		}
	}, [minVal, getPercent]);

	// Set width of the range to decrease from the right side
	useEffect(() => {
		if (minValRef.current) {
			const minPercent = getPercent(+minValRef.current.value);
			const maxPercent = getPercent(maxVal);

			if (rangeRef.current) {
				rangeRef.current.style.width = `${maxPercent - minPercent}%`;
			}
		}
	}, [maxVal, getPercent]);

	// Get min and max values when their state changes
	useEffect(() => {
		props.onChange({ min: minVal, max: maxVal });
	}, [minVal, maxVal, props.onChange]);

	return (
		<div className='container'>
			<input
				type='range'
				min={props.min}
				max={props.max}
				value={minVal}
				ref={minValRef}
				onChange={(event) => {
					const value = Math.min(+event.target.value, maxVal - 1);
					setMinVal(value);
					event.target.value = value.toString();
				}}
				className={`thumb thumb--zindex-3 ${
					minVal > props.max - 100 ? 'thumb--zindex-5' : ''
				}`}
			/>
			<input
				type='range'
				min={props.min}
				max={props.max}
				value={maxVal}
				ref={maxValRef}
				onChange={(event) => {
					const value = Math.max(+event.target.value, minVal + 1);
					setMaxVal(value);
					event.target.value = value.toString();
				}}
				className='thumb thumb--zindex-4'
			/>

			<div className='slider'>
				<div ref={rangeRef} className='slider__range' />
				<div className='slider__track' />
				<div className='slider__left-value'>{minVal}</div>
				<div className='slider__right-value'>{maxVal}</div>
			</div>
		</div>
	);
}

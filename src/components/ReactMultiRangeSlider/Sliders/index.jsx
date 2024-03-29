import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useStore } from 'zustand';

import classes from './index.module.css';

/**
 * @typedef {{
 * store: import('../utils').CreateMRSStoreApi
 * min: number;
 * max: number;
 * index: number;
 * onSliderChange: import('../utils').OnSliderChange;
 * }} RangeSliderProps
 */

/**
 *
 * @typedef {{ hours: number; minutes: number; }} TimeValues
 * @param {{
 * setValues: (updater: ((values: TimeValues) => TimeValues)) => void;
 * hours: number;
 * minutes: number;
 * }} props
 */
function TimeEditController(props) {
	const maxHours = 48;
	const maxMinutes = 59;

	/**
	 * @param {{
	 * 	value: string;
	 * 	type?: 'increment' | 'decrement';
	 * }} params
	 */
	function handleHoursChange(params) {
		props.setValues((prev) => {
			let fieldValue = +params.value;

			if (isNaN(fieldValue)) {
				return prev;
			}

			switch (params.type) {
				case 'increment':
					fieldValue++;
					break;
				case 'decrement':
					fieldValue--;
					break;
			}

			const newValue = +Math.min(Math.max(fieldValue, 0), maxHours)
				.toString()
				.padStart(2, '0');

			const result = {
				...prev,
				hours: newValue,
				minutes: newValue === maxHours ? 0 : prev.minutes
			};
			return result;
		});
	}

	/**
	 * @param {{
	 * 	value: string;
	 * 	type?: 'increment' | 'decrement';
	 * }} params
	 */
	function handleMinutesChange(params) {
		props.setValues((prev) => {
			if (props.hours === maxHours) {
				return { ...prev, minutes: 0 };
			}

			let fieldValue = +params.value;
			if (isNaN(fieldValue)) {
				return prev;
			}

			switch (params.type) {
				case 'increment':
					fieldValue++;
					break;
				case 'decrement':
					fieldValue--;
					break;
			}

			const newValue = +Math.min(Math.max(fieldValue, 0), maxMinutes)
				.toString()
				.padStart(2, '0');

			return { ...prev, minutes: newValue };
		});
	}

	return (
		<fieldset
			style={{
				display: 'flex',
				border: '0'
			}}
		>
			<input
				value={props.hours.toString().padStart(2, '0')}
				style={{
					width: '3ch',
					height: '3ch',
					backgroundColor: 'transparent',
					border: '0.0625rem solid black',
					color: 'black',
					textAlign: 'center'
				}}
				name='range-1-min-hours'
				min={0}
				max={maxHours}
				onChange={(event) => {
					handleHoursChange({
						value: event.target.value
					});
				}}
				onKeyDown={(event) => {
					switch (event.key) {
						case 'ArrowUp':
							event.preventDefault();
							handleHoursChange({
								value: event.currentTarget.value,
								type: 'increment'
							});
							break;
						case 'ArrowDown':
							event.preventDefault();
							handleHoursChange({
								value: event.currentTarget.value,
								type: 'decrement'
							});
							break;
					}
				}}
			/>
			<input
				value={props.minutes.toString().padStart(2, '0')}
				style={{
					width: '3ch',
					height: '3ch',
					backgroundColor: 'transparent',
					border: '0.0625rem solid black',
					color: 'black',
					textAlign: 'center'
				}}
				name='range-1-min-minutes'
				min={0}
				max={maxMinutes}
				onChange={(event) => {
					handleMinutesChange({
						value: event.target.value
					});
				}}
				onKeyDown={(event) => {
					switch (event.key) {
						case 'ArrowUp':
							event.preventDefault();
							handleMinutesChange({
								value: event.currentTarget.value,
								type: 'increment'
							});
							break;
						case 'ArrowDown':
							event.preventDefault();
							handleMinutesChange({
								value: event.currentTarget.value,
								type: 'decrement'
							});
							break;
					}
				}}
			/>
		</fieldset>
	);
}

/**
 * @typedef {{
 * setValue: (value: number, id: string) => void
 * value: number;
 * trackId: string;
 * label: string
 * }} MinMaxProps
 */

/**
 * @param {MinMaxProps} props
 */
function TimeField(props) {
	// const
	const hours = Math.floor(props.value);
	const minutes = Math.round((props.value % 1) * 60);

	return (
		<fieldset>
			<legend style={{ textAlign: 'center' }}>{props.label}</legend>
			<TimeEditController
				setValues={(updater) => {
					const value = updater({ hours, minutes });
					const newValue = value.hours + value.minutes / 60;

					props.setValue(newValue, props.trackId);
				}}
				hours={hours}
				minutes={minutes}
			/>
		</fieldset>
	);
}

/**
 * @param {{
 * setStart: (value: number, id: string) => void;
 * setEnd: (value: number, id: string) => void;
 * end: number;
 * start: number;
 * trackId: string;
 * rangeRef: import('react').MutableRefObject<HTMLDivElement | null>;
 * transformValue: (value: number) => number;
 * deTransformValue: (value: number) => number;
 * handleDeleteSlider: () => void;
 * }} props
 */
function SliderTrack(props) {
	return (
		<div ref={props.rangeRef} className={classes.slider__track}>
			<div className={classes['slider__range-config']} />
			<div
				className={classes['slider__range-config__tooltip']}
				style={{ display: 'flex', flexDirection: 'column' }}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
						height: '0.75rem'
					}}
				>
					<button
						style={{
							backgroundColor: 'transparent',
							border: 'none',
							cursor: 'pointer',
							fontSize: '0.75rem',
							color: 'black'
						}}
						type='button'
						onClick={props.handleDeleteSlider}
					>
						x
					</button>
				</div>
				<div
					style={{
						display: 'flex',
						gap: '0.25rem'
					}}
				>
					<TimeField
						setValue={props.setStart}
						trackId={props.trackId}
						value={props.start}
						label='Start'
					/>
					<TimeField
						setValue={props.setEnd}
						trackId={props.trackId}
						value={props.end}
						label='End'
					/>
				</div>
			</div>
		</div>
	);
}

/** @param {RangeSliderProps} props */
function RangeSlider(props) {
	const id = useStore(
		props.store,
		(state) =>
			/** @type {import("../utils").Slider} */ (state.base.sliders[props.index])
				.id
	);
	const start = useStore(
		props.store,
		(state) =>
			/** @type {import("../utils").Slider} */ (state.base.sliders[props.index])
				.start
	);
	const end = useStore(
		props.store,
		(state) =>
			/** @type {import("../utils").Slider} */ (state.base.sliders[props.index])
				.end
	);
	const setStart = useCallback(
		/**
		 * @param {number} value
		 * @param {string} id
		 **/
		(value, id) => {
			props.store
				.getState()
				.updateSlider((prev) => ({ ...prev, start: value }), {
					id,
					type: 'start'
				});
		},
		[props.store]
	);
	const setEnd = useCallback(
		/**
		 * @param {number} value
		 * @param {string} id
		 **/
		(value, id) => {
			props.store
				.getState()
				.updateSlider((prev) => ({ ...prev, end: value }), { id, type: 'end' });
		},
		[props.store]
	);
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
			const minPercent = getPercent(start);
			const maxPercent = getPercent(+maxValRef.current.value); // Preceding with '+' converts the value from type string to type number

			if (rangeRef.current) {
				rangeRef.current.style.left = `${minPercent}%`;
				rangeRef.current.style.width = `${maxPercent - minPercent}%`;
			}
		}
	}, [getPercent, start]);

	// Set width of the range to decrease from the right side
	useEffect(() => {
		if (minValRef.current) {
			const minPercent = getPercent(+minValRef.current.value);
			const maxPercent = getPercent(end);

			if (rangeRef.current) {
				rangeRef.current.style.width = `${maxPercent - minPercent}%`;
			}
		}
	}, [end, getPercent]);

	const onSliderChange = props.onSliderChange;

	// Get min and max values when their state changes
	useEffect(() => {
		const storeState = props.store.getState();
		onSliderChange({
			slider: { id, start, end },
			getTransformedSlider: storeState.getTransformedSlider,
			getTransformedSliders: storeState.getTransformedSliders,
			transformSlider: storeState.transformSlider
		});
	}, [end, id, onSliderChange, props.store, start]);

	return (
		<>
			<div className={classes.slider}>
				<input
					type='range'
					min={props.min}
					max={props.max}
					value={start}
					ref={minValRef}
					onChange={(event) => {
						const value = Math.min(+event.target.value, end - 1);
						setStart(value, id);
						event.target.value = value.toString();
					}}
					style={{ zIndex: start > end - 100 ? 5 : 4 }}
					className={`${classes.thumb} ${classes['thumb-min']}`}
				/>
				<input
					type='range'
					min={props.min}
					max={props.max}
					value={end}
					ref={maxValRef}
					onChange={(event) => {
						const value = Math.max(+event.target.value, start + 1);
						setEnd(value, id);
						event.target.value = value.toString();
					}}
					className={`${classes.thumb} ${classes['thumb-max']}`}
					style={{ zIndex: 4 }}
				/>

				<SliderTrack
					rangeRef={rangeRef}
					end={end}
					setEnd={setEnd}
					setStart={setStart}
					start={start}
					trackId={id}
					transformValue={props.store.getState().transformValue}
					deTransformValue={props.store.getState().deTransformValue}
					handleDeleteSlider={() => {
						props.store.getState().deleteSlider(id);
					}}
				/>
			</div>
		</>
	);
}

/**
 * @param {{
 * store: import('../utils').CreateMRSStoreApi
 * onSliderChange: import('../utils').OnSliderChange;
 * }} props
 */
export default function RangesSliders(props) {
	const min = useStore(props.store, (state) => state.base.min);
	const max = useStore(props.store, (state) => state.base.max);
	const slidersCount = useStore(
		props.store,
		(state) => state.base.sliders.length
	);

	const slidersSize = useMemo(
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		() => new Array(slidersCount).fill(0),
		[slidersCount]
	);

	return slidersSize.map((_, sliderIndex) => (
		<RangeSlider
			store={props.store}
			min={min}
			max={max}
			key={sliderIndex}
			index={sliderIndex}
			onSliderChange={props.onSliderChange}
		/>
	));
}

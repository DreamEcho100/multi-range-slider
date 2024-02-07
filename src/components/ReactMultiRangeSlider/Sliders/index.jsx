import { useCallback, useEffect, useMemo, useRef } from "react";
import { useStore } from "zustand";

import classes from "./index.module.css";

/**
 * @typedef {{
 * store: import('../utils').CreateMRSStoreApi
 * min: number;
 * max: number;
 * index: number;
 * onSliderChange: import('../utils').OnSliderChange;
 * }} RangeSliderProps
 */

/** @param {RangeSliderProps} props */
function RangeSlider(props) {
  const id = useStore(
    props.store,
    (state) =>
      /** @type {import("../utils").Slider} */ (state.base.sliders[props.index])
        .id,
  );
  const start = useStore(
    props.store,
    (state) =>
      /** @type {import("../utils").Slider} */ (state.base.sliders[props.index])
        .start,
  );
  const end = useStore(
    props.store,
    (state) =>
      /** @type {import("../utils").Slider} */ (state.base.sliders[props.index])
        .end,
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
          type: "start",
        });
    },
    [props.store],
  );
  const setEnd = useCallback(
    /**
     * @param {number} value
     * @param {string} id
     **/
    (value, id) => {
      props.store
        .getState()
        .updateSlider((prev) => ({ ...prev, end: value }), { id, type: "end" });
    },
    [props.store],
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
    [props.min, props.max],
  );

  // const configRef = useRef({
  // 	isInitialized: false,
  // 	track: { translateX: 0, originalX: 0, width: 0 },
  // 	trackContainer: { x: 0, x2: 0 },
  // 	mouse: { oldX: 0 },
  // 	isActive: false
  // });

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
      transformSlider: storeState.transformSlider,
    });
  }, [end, id, onSliderChange, props.store, start]);

  /*
div
			className='slider__range-container'
			style={
				/** @type {import('react').CSSProperties} / ({
					width: '100%',
					height: '100%',
					isolation: 'isolate',
					position: 'relative',
					left: 0,
					right: 0,
					zIndex: 2 + props.index
				})
			}
	 */
  return (
    <>
      <input
        type="range"
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
        className={`${classes.thumb} ${classes["thumb-min"]}`}
      />
      <input
        type="range"
        min={props.min}
        max={props.max}
        value={end}
        ref={maxValRef}
        onChange={(event) => {
          const value = Math.max(+event.target.value, start + 1);
          setEnd(value, id);
          event.target.value = value.toString();
        }}
        className={`${classes.thumb} ${classes["thumb-max"]}`}
        style={{ zIndex: 4 }}
      />

      <div
        ref={rangeRef}
        className={classes.slider__range}
        // onPointerDown={(event) => {
        // 	if (!rangeRef.current) return;

        // 	configRef.current.isActive = true;
        // 	configRef.current.mouse.oldX = event.clientX;
        // }}
        // onPointerUp={() => {
        // 	if (!rangeRef.current) return;

        // 	configRef.current.isActive = false;
        // 	configRef.current.mouse.oldX = 0;
        // }}
        // onPointerLeave={() => {
        // 	if (!rangeRef.current) return;

        // 	configRef.current.isActive = false;
        // 	configRef.current.mouse.oldX = 0;
        // }}
        // onPointerMove={(event) => {
        // 	if (!configRef.current.isActive || !rangeRef.current) return;
        // 	const moveX = event.clientX - configRef.current.mouse.oldX;

        // 	if (
        // 		configRef.current.track.translateX + moveX > 0 ||
        // 		Math.abs(configRef.current.track.translateX + moveX) >
        // 			configRef.current.trackContainer.x2
        // 	)
        // 		return;

        // 	configRef.current.track.translateX += moveX;
        // 	rangeRef.current.style.transform = `translateX(${configRef.current.track.translateX}px)`;

        // 	configRef.current.mouse.oldX = event.clientX;
        // }}
      />
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
    (state) => state.base.sliders.length,
  );

  const slidersSize = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    () => new Array(slidersCount).fill(0),
    [slidersCount],
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

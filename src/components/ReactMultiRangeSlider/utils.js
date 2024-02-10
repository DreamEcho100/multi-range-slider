import { useRef } from 'react';
import { createStore } from 'zustand';

/**
 * @template CreateMRSStoreShape
 * @typedef {typeof createStore<CreateMRSStoreShape>} CreateStore */
/** @typedef {{ id: string, start: number, end: number }} Slider */

/** @typedef {{ min: number, max: number, sliders: Slider[], initialSliders: Slider[] }} CreateMRSStoreBase */
/** @typedef {(slider: Slider) => Slider} TransformSlider */
/** @typedef {(selectorKey?: 'sliders' | 'initialSliders') => Slider[]} GetTransformedSliders */
/** @typedef {(id: string, selectorKey?: 'sliders' | 'initialSliders') => Slider | undefined} GetTransformedSlider */
/** @typedef {(params: { slider: Slider, getTransformedSlider: GetTransformedSlider, getTransformedSliders: GetTransformedSliders, transformSlider: TransformSlider }) => void} OnSliderChange */

/**
 * @typedef {{
 * transformed: { min: 0, max: number, },
 * base: CreateMRSStoreBase,
 * step: number,
 * rangeType: 'down' | 'up' | 'alternate-even' | 'alternate-odd',
 * setSliders: (sliders: (Omit<Slider, 'id'> & { id?: string })[], options?: { andSetInitialSliders?: boolean }) => void,
 * updateSlider: (valueOrUpdate: Slider | ((value: Slider) => Slider),  params: { id: string, index?: number, type: 'start' | 'end' } ) => void,
 * addSlider: (slider?: Partial<Slider>) => void,
 * deleteSlider: (id: string) => void,
 * deTransformValue: (value: number) => number,
 * transformValue: (value: number) => number,
 * transformSlider: TransformSlider,
 * getTransformedSliders: GetTransformedSliders,
 * getTransformedSlider: GetTransformedSlider,
 *  }} CreateMRSStoreShape
 **/
/** @typedef { import('zustand').StoreApi<CreateMRSStoreShape> } CreateMRSStoreApi */

/**
 * @typedef {{
 * min: CreateMRSStoreShape['transformed']['min'],
 * max: CreateMRSStoreShape['transformed']['max'],
 * rangeType?: CreateMRSStoreShape['rangeType'],
 * initialSliders: (Omit<Slider, 'id'> & { id?: string })[],
 * step?: number,
 * }} CreateMRSStoreParams
 **/

/** @param {number} value */
const fixedTo2 = (value) => value; // +value.toFixed(8);

/** @param {CreateMRSStoreParams} params **/
export function CreateMRSStore(params) {
	/** @type {typeof createStore<CreateMRSStoreShape>} */
	return createStore(
		/**
		 * @param {{ _(partial: CreateMRSStoreShape | Partial<CreateMRSStoreShape> | { _(state: CreateMRSStoreShape): CreateMRSStoreShape | Partial<CreateMRSStoreShape>; }['_'], replace?: boolean | undefined): void; }['_']} set
		 * @param {() => CreateMRSStoreShape} get
		 * @returns {CreateMRSStoreShape}
		 */
		(set, get) => {
			const step = params.step ?? 1;
			const initialSliders = params.initialSliders.map((slider, index) => ({
				id: slider.id ?? (index + Math.random()).toString(36).slice(2),
				start: fixedTo2(slider.start / step),
				end: fixedTo2(slider.end / step)
			}));
			const sliders = initialSliders.map((slider) => ({ ...slider }));

			if (step > 1) {
				throw new Error('step must be less than 1');
			} else if (step <= 0) {
				throw new Error('step must be greater than 0');
			}

			return {
				transformed: {
					min: params.min,
					max: params.max
				},
				base: {
					min: fixedTo2(params.min / step),
					max: fixedTo2(params.max / step),
					sliders,
					initialSliders
				},

				step,
				rangeType: params.rangeType ?? 'down',

				transformValue: (value) => fixedTo2(value / step),
				deTransformValue: (value) => fixedTo2(value * step),

				setSliders: (sliders, options) => {
					const store = get();
					const base = store.base;

					base.sliders = sliders.map((slider, index) => ({
						id: slider.id ?? (index + Math.random()).toString(36).slice(2),
						start: store.transformValue(slider.start),
						end: store.transformValue(slider.end)
					}));

					if (options?.andSetInitialSliders) {
						base.initialSliders = base.sliders.map((slider) => ({ ...slider }));
					}

					set({ base });
				},
				updateSlider(valueOrUpdate, params) {
					const base = get().base;
					/** @type {Slider} */
					let prevSlider;
					/** @type {Slider} */
					let currSlider;
					/** @type {Slider} */
					let nextSlider;

					let i = 0;
					for (; i < base.sliders.length; i++) {
						if (/** @type {Slider} */ (base.sliders[i]).id === params.id) {
							currSlider =
								typeof valueOrUpdate === 'function'
									? valueOrUpdate(/** @type {Slider} */ (base.sliders[i]))
									: valueOrUpdate;

							console.log('___ currSlider', currSlider);
							if (params.type === 'start') {
								if (currSlider.start >= currSlider.end) {
									break;
								}
								if (i > 0) {
									prevSlider = /** @type {Slider} */ (base.sliders[i - 1]);
									if (prevSlider.end > currSlider.start) {
										currSlider.start = prevSlider.end;
									}
								}
							} else if (params.type === 'end') {
								if (currSlider.end <= currSlider.start) {
									break;
								}

								if (i < base.sliders.length - 1) {
									nextSlider = /** @type {Slider} */ (base.sliders[i + 1]);
									if (nextSlider.start < currSlider.end) {
										currSlider.end = nextSlider.start;
									}
								}
							}

							base.sliders[i] = currSlider;
							break;
						}
					}
					set({ base });
				},
				addSlider(slider) {
					const store = get();
					const base = store.base;

					const id =
						slider?.id ??
						(base.sliders.length + Math.random()).toString(36).slice(2);
					let start = slider?.start
						? store.transformValue(slider?.start)
						: undefined;
					let end = slider?.end ? store.transformValue(slider.end) : undefined;

					const lastSlider = base.sliders[base.sliders.length - 1];

					if (typeof start !== 'number') {
						start = lastSlider ? lastSlider.end + store.step * 4 : base.min;
					}

					if (typeof end !== 'number') {
						end = start + store.step;
					}

					if (end > base.max) {
						end = base.max;
					}

					if (start > end) {
						console.error('start must be less than end');
						return;
					}

					const newSlider = {
						id,
						start,
						end
					};

					base.sliders.push(newSlider);
					set({ base });
				},
				deleteSlider(id) {
					const store = get();
					const base = store.base;

					let i = 0;
					for (; i < base.sliders.length; i++) {
						if (base.sliders[i].id === id) {
							base.sliders.splice(i, 1);
							break;
						}
					}
					set({ base });
				},

				getTransformedSliders(selectorKey = 'sliders') {
					const store = get();
					/** @type {Slider[]} */
					const transformedSliders = new Array(store.base[selectorKey].length);

					for (let i = 0; i < store.base[selectorKey].length; i++) {
						const slider = /** @type {Slider} */ (store.base[selectorKey][i]);
						transformedSliders[i] = store.transformSlider(slider);
					}

					return transformedSliders;
				},
				getTransformedSlider(id, selectorKey = 'sliders') {
					const store = get();

					// eslint-disable-next-line @typescript-eslint/prefer-for-of
					for (let i = 0; i < store.base[selectorKey].length; i++) {
						if (/** @type {Slider} */ (store.base[selectorKey][i]).id === id) {
							return store.transformSlider(
								/** @type {Slider} */ (store.base[selectorKey][i])
							);
						}
					}
				},
				transformSlider(slider) {
					const store = get();
					return {
						...slider,
						start: store.transformValue(slider.start * store.step),
						end: store.transformValue(slider.end * store.step)
					};
				}
			};
		}
	);
}

/** @param {CreateMRSStoreParams} params */
export const useCreateMRSStore = (params) =>
	useRef(CreateMRSStore(params)).current;

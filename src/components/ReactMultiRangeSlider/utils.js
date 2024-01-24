import { useRef } from 'react';
import { createStore } from 'zustand';

/**
 * @template CreateMRSStoreShape
 * @typedef {typeof createStore<CreateMRSStoreShape>} CreateStore */
/** @typedef {{ id: string, start: number, end: number }} Slider */

/** @typedef {(slider: Slider) => Slider} TransformSlider */
/** @typedef {() => Slider[]} GetTransformedSliders */
/** @typedef {(id: string) => Slider | undefined} GetTransformedSlider */
/** @typedef {(params: { slider: Slider, getTransformedSlider: GetTransformedSlider, getTransformedSliders: GetTransformedSliders, transformSlider: TransformSlider }) => void} OnSliderChange */

/**
 * @typedef {{
 * transformed: { min: 0, max: number, },
 * base: { min: number, max: number, sliders: Slider[], },
 * step: number,
 * rangeType: 'down' | 'up' | 'alternate-even' | 'alternate-odd',
 * updateSlider: (valueOrUpdate: Slider | ((value: Slider) => Slider),  params: { id: string, index?: number, type: 'start' | 'end' } ) => void,
 * getTransformedSliders: GetTransformedSliders,
 * getTransformedSlider: GetTransformedSlider,
 * transformSlider: TransformSlider
 *  }} CreateMRSStoreShape
 **/
/** @typedef { import('zustand').StoreApi<CreateMRSStoreShape> } CreateMRSStoreApi */

/**
 * @typedef {{
 * min: CreateMRSStoreShape['transformed']['min'],
 * max: CreateMRSStoreShape['transformed']['max'],
 * rangeType?: CreateMRSStoreShape['rangeType'],
 * sliders: (Omit<Slider, 'id'> & { id?: string })[],
 * step?: number,
 * }} CreateMRSStoreParams
 **/

/** @param {number} value */
const fixedTo2 = (value) => +value.toFixed(2);

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
					sliders: params.sliders.map((slider, index) => ({
						id: slider.id ?? (index + Math.random()).toString(36).slice(2),
						start: fixedTo2(slider.start / step),
						end: fixedTo2(slider.end / step)
					}))
				},

				step,
				rangeType: params.rangeType ?? 'down',

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
						if (base.sliders[i].id === params.id) {
							currSlider =
								typeof valueOrUpdate === 'function'
									? valueOrUpdate(base.sliders[i])
									: valueOrUpdate;

							if (params.type === 'start' && i > 0) {
								prevSlider = base.sliders[i - 1];
								if (prevSlider.end > currSlider.start) {
									currSlider.start = prevSlider.end;
								}
							} else if (params.type === 'end' && i < base.sliders.length - 1) {
								nextSlider = base.sliders[i + 1];
								if (nextSlider.start < currSlider.end) {
									currSlider.end = nextSlider.start;
								}
							}

							base.sliders[i] = currSlider;
							break;
						}
					}
					return set({ base });
				},
				getTransformedSliders() {
					const store = get();
					/** @type {Slider[]} */
					const transformedSliders = new Array(store.base.sliders.length);

					for (let i = 0; i < store.base.sliders.length; i++) {
						const slider = store.base.sliders[i];
						transformedSliders[i] = store.transformSlider(slider);
					}

					return transformedSliders;
				},
				getTransformedSlider(id) {
					const store = get();

					for (let i = 0; i < store.base.sliders.length; i++) {
						if (store.base.sliders[i].id === id) {
							return store.transformSlider(store.base.sliders[i]);
						}
					}
				},
				transformSlider(slider) {
					const store = get();
					return {
						...slider,
						start: fixedTo2(slider.start * store.step),
						end: fixedTo2(slider.end * store.step)
					};
				}
			};
		}
	);
}

/** @param {CreateMRSStoreParams} params */
export const useCreateMRSStore = (params) =>
	useRef(CreateMRSStore(params)).current;

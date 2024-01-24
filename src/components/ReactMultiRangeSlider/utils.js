import { useRef } from 'react';
import { createStore } from 'zustand';

/**
 * @template CreateMRSStoreShape
 * @typedef {typeof createStore<CreateMRSStoreShape>} CreateStore */
/** @typedef {{ id: string, start: number, end: number }} Slider */

/** @typedef {(params: { slider: Slider, }) => void} OnSliderChange */

/**
 * @typedef {{
 * min: number, max: number, sliders: Slider[],
 * step: number,
 * rangeType: 'down' | 'up' | 'alternate-even' | 'alternate-odd',
 * updateSlider: (valueOrUpdate: Slider | ((value: Slider) => Slider),  params: { id: string, index?: number, type: 'start' | 'end' } ) => void,
 *  }} CreateMRSStoreShape
 **/
/** @typedef { import('zustand').StoreApi<CreateMRSStoreShape> } CreateMRSStoreApi */

/**
 * @typedef {{
 * min: CreateMRSStoreShape['min'],
 * max: CreateMRSStoreShape['max'],
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
				min: fixedTo2(params.min),
				max: fixedTo2(params.max),
				sliders: params.sliders.map((slider, index) => ({
					id: slider.id ?? (index + Math.random()).toString(36).slice(2),
					start: fixedTo2(slider.start),
					end: fixedTo2(slider.end)
				})),

				step,
				rangeType: params.rangeType ?? 'down',

				updateSlider(valueOrUpdate, params) {
					const sliders = get().sliders;
					/** @type {Slider} */
					let prevSlider;
					/** @type {Slider} */
					let currSlider;
					/** @type {Slider} */
					let nextSlider;

					let i = 0;
					for (; i < sliders.length; i++) {
						if (sliders[i].id === params.id) {
							currSlider =
								typeof valueOrUpdate === 'function'
									? valueOrUpdate(sliders[i])
									: valueOrUpdate;

							if (params.type === 'start' && i > 0) {
								prevSlider = sliders[i - 1];
								if (prevSlider.end > currSlider.start) {
									currSlider.start = prevSlider.end;
								}
							} else if (params.type === 'end' && i < sliders.length - 1) {
								nextSlider = sliders[i + 1];
								if (nextSlider.start < currSlider.end) {
									currSlider.end = nextSlider.start;
								}
							}

							sliders[i] = currSlider;
							break;
						}
					}
					return set({ sliders });
				}
			};
		}
	);
}

/** @param {CreateMRSStoreParams} params */
export const useCreateMRSStore = (params) =>
	useRef(CreateMRSStore(params)).current;

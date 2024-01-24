import { useMemo } from 'react';
import { useStore } from 'zustand';

// Component for the slider track ranges indicators
/** @param {{ store: import('../utils').CreateMRSStoreApi }} props */
export default function RangeTrackIndicator(props) {
	// const baseMin = useStore(props.store, (state) => state.base.min);
	// const baseMax = useStore(props.store, (state) => state.base.max);
	// const step = useStore(props.store, (state) => state.step);

	const transformedMin = useStore(props.store, (state) => state.min);
	const transformedMax = useStore(props.store, (state) => state.max);

	const rangeType = useStore(props.store, (state) => state.rangeType);
	const ranges = useMemo(() => {
		/** @type { (number | null)[] } */
		const ranges = [transformedMin];

		let i = transformedMin + 1;
		for (; i < transformedMax; i++) {
			ranges.push((i + 1) % 1 === 0 ? i : null);
		}

		ranges.push((i + 1) % 1 === 0 ? i : null);

		return ranges;
	}, [transformedMin, transformedMax]);

	return (
		<div
			style={{
				position: 'absolute',
				left: '0%',
				right: '0%',
				width: '100%',
				height: '100%'
			}}
		>
			<div
				style={{
					position: 'relative',
					left: '0%',
					right: '0%',
					width: '100%',
					height: '100%'
				}}
			>
				{ranges.map((item, index) => {
					const isEven = index % 2 === 0;
					const isOdd = index % 2 !== 0;
					const isAlternateEven = rangeType === 'alternate-even';
					const isAlternateOdd = rangeType === 'alternate-odd';
					const isUp = rangeType === 'up';

					/** @type {import('react').CSSProperties} */
					const styles1 =
						isUp || (isAlternateEven && isEven) || (isAlternateOdd && isOdd)
							? { flexDirection: 'column-reverse', bottom: '-100%' }
							: { flexDirection: 'column', top: '0%' };

					return (
						<div
							key={index}
							style={{
								...styles1,
								left: `${
									// (index / step)
									((index / (transformedMax - transformedMin)) * 100).toFixed(2)
								}%`,
								position: 'absolute',
								transform: 'translateX(-50%)',
								fontSize: '0.75rem',
								display: 'flex',
								justifyItems: 'center',
								alignItems: 'center',
								textAlign: 'center'
							}}
						>
							{typeof item === 'number' && (
								<div
									style={{
										width: '0.0625rem',
										height: '1rem',
										backgroundColor: 'white',
										boxShadow: 'black 0px 0 1rem 0.0625rem'
										// transform: 'translateX(-50%)'
									}}
								/>
							)}
							<span
								style={
									{
										// width: 0,
										// writingMode: 'vertical-lr'
									}
								}
							>
								{item}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

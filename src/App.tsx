import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
// import MultiRangeSlider1 from './components/MultiRangeSlider1';
import ReactMultiRangeSlider from './components/ReactMultiRangeSlider';
import { useCreateMRSStore } from './components/ReactMultiRangeSlider/utils';

function App() {
	const mrsStore = useCreateMRSStore({
		min: 0,
		max: 48,
		rangeType: 'down',
		step: 0.5,
		sliders: [
			// { start: 0, end: 48 }
			{ start: 0, end: 8 },
			{ start: 9, end: 17 },
			{ start: 23, end: 32 },
			{ start: 35, end: 48 }
		]
	});

	return (
		<>
			<div>
				<a href='https://vitejs.dev' target='_blank'>
					<img src={viteLogo} className='logo' alt='Vite logo' />
				</a>
				<a href='https://react.dev' target='_blank'>
					<img src={reactLogo} className='logo react' alt='React logo' />
				</a>
			</div>
			<h1>Multi Range Slider</h1>
			<section>
				{/* <div className='card'>
					<MultiRangeSlider1
						min={0}
						max={1000}
						onChange={({ min, max }) =>
							console.log(`min = ${min}, max = ${max}`)
						}
					/>
				</div> */}
				<div style={{ padding: '2rem 0.25rem' }}>
					<div
						className='card'
						style={{
							overflowX: 'auto',
							maxWidth: '100%'
						}}
					>
						<ReactMultiRangeSlider
							store={mrsStore}
							onSliderChange={(params) => {
								const transformSlider = params.transformSlider(params.slider);

								console.log(
									`id: ${transformSlider.id}, start: ${transformSlider.start}, end: ${transformSlider.end}`
								);
							}}
						/>
					</div>
				</div>
			</section>
		</>
	);
}

export default App;
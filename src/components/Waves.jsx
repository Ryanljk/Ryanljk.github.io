import WaveLayer from './WaveLayer'

const wavePaths = {
  back: 'M0,200 C120,180 240,160 360,180 C480,200 600,220 720,200 C840,180 960,160 1080,180 C1200,200 1320,220 1440,200 L1440,320 L0,320 Z',
  mid: 'M0,230 C120,210 240,190 360,210 C480,230 600,250 720,230 C840,210 960,190 1080,210 C1200,230 1320,250 1440,230 L1440,320 L0,320 Z',
  front: 'M0,260 C120,240 240,220 360,240 C480,260 600,280 720,260 C840,240 960,220 1080,240 C1200,260 1320,280 1440,260 L1440,320 L0,320 Z',
}

const waveColors = {
  back: '#93c5fd',
  mid: '#a5b4fc',
  front: '#bfdbfe',
}

export default function Waves() {
  return (
    <>
      <WaveLayer className="wave-back" color={waveColors.back} d={wavePaths.back} />
      <WaveLayer className="wave-mid" color={waveColors.mid} d={wavePaths.mid} />
      <WaveLayer className="wave-front" color={waveColors.front} d={wavePaths.front} />
    </>
  )
}

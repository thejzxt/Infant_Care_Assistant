import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function WaveBackground() {
  return (
    <Svg
      width={width}
      height={420}
      viewBox={`0 0 ${width} 420`}
      style={{ position: 'absolute', top: 0 }}
    >
      <Defs>
        <LinearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#5FB3F9"   />
          <Stop offset="100%" stopColor="#2D9CDB" />
        </LinearGradient>
      </Defs>

      {/* Pink background */}
      <Path
        d={`
          M0 0
          H${width}
          V320
          Q ${width * 0.75} 380 ${width * 0.5} 340
          Q ${width * 0.25} 300 0 340
          Z
        `}
        fill="url(#waveGrad)"
      />
    </Svg>
  );
}

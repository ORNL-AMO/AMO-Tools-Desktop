import * as React from 'react';
import Box from '@mui/material/Box';
import { Slider, Typography } from '@mui/material';


export default function ContinuousSlider(props: SliderProps) {

  const MAX = props.max? props.max : 10;
  const MIN = props.min? props.min : 1;
  const step = props.step? props.step : undefined;
  const unit = props.unit !== undefined? props.unit : 'px'; 
  const marks = [
    {
      value: MIN,
      label: '',
    },
    {
      value: MAX,
      label: '',
    },
  ];

    return (
      <Box sx={{ width: 300, fontSize: '.75rem', marginLeft: '.5rem' }}>
        <Slider
          size="small"
          aria-label="Small"
          valueLabelDisplay="auto"
          min={MIN}
          max={MAX}
          step={step}
          marks={marks}
          value={props.value} onChange={props.setSliderValue}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <span
            onClick={(event) => props.setSliderValue(event, MIN)}
            style={{ cursor: 'pointer' }}
          >
            {MIN} {unit}
          </span>
          <span
            onClick={(event) => props.setSliderValue(event, MAX)}
            style={{ cursor: 'pointer' }}
          >
            {MAX} {unit}
          </span>
        </Box>
      </Box>
    );
  }

  export interface SliderProps {
    setSliderValue: (event: Event | React.MouseEvent, newValue: number) => void;
    min?: number,
    max?: number,
    step?: number,
    unit?: string,
    value: number;
  }
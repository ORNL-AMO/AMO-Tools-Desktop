import * as React from 'react';
import Box from '@mui/material/Box';
import { Slider } from '@mui/material';


export default function ContinuousSlider(props: SliderProps) {
  let min = props.min;
  let max = props.max;
  if (props.marks) {
    min = props.marks[0].value;
    max = props.marks[props.marks.length - 1].value;
  }


  const step = props.step? props.step : undefined;
  const defaultMarks = [
    {
      value: min,
      label: '',
    },
    {
      value: max,
      label: '',
    },
  ];

    return (
      <Box sx={{ width: 300, fontSize: '.75rem', marginLeft: '.5rem' }} style={{ ...props.style }}>
        <Slider
          size={props.size}
          aria-label="Small"
          valueLabelDisplay="auto"
          min={min}
          max={max}
          step={step}
          marks={props.marks? props.marks : defaultMarks}
          sx={{padding: 0}}
          value={props.value} onChange={props.setSliderValue}
        />
        {!props.marks && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span
              onClick={(event) => props.setSliderValue(event, min)}
              style={{ cursor: 'pointer' }}
            >
              {min} {props.unit ? props.unit : undefined}
            </span>
            <span
              onClick={(event) => props.setSliderValue(event, max)}
              style={{ cursor: 'pointer' }}
            >
              {max} {props.unit ? props.unit : undefined}
            </span>
          </Box>
        )}
      </Box>
    );
  }

  export interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
    setSliderValue: (event: Event | React.MouseEvent, newValue: number) => void;
    min?: number,
    max?: number,
    size?: 'small' | 'medium';
    step?: number,
    unit?: string,
    value: number;
    marks?: { value: number; label: string }[];
    style?: React.CSSProperties;
  }
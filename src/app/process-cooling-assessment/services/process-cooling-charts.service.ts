import { Injectable } from '@angular/core';
import { ProcessCoolingChillerOutput } from '../../shared/models/process-cooling-assessment';
import { TraceData } from '../../shared/models/plotting';
import { graphColors } from '../../shared/graphColors';
import { defaultPlotlyConfig } from '../../shared/helperFunctions';
import { PROCESS_COOLING_UNITS } from '../constants/process-cooling-units';

export interface PlotlyChartConfig {
  traces: TraceData[];
  layout: object;
  config: object;
}


const MARKER_SHAPES: Array<string> = [
  'star', 'star-diamond', 'hexagram', 'star-square', 'square',
  'diamond', 'cross', 'x', 'diamond-wide', 'diamond-tall'
];
const CHILLER_FILL_ALPHA = 0.07;
const CHILLER_DASH_PATTERNS: Array<string> = ['solid', 'dash', 'dot', 'dashdot', 'longdash', 'longdashdot'];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

@Injectable({ providedIn: 'root' })
export class ProcessCoolingChartsService {

  buildChillerProfileChart(chillerOutput: ProcessCoolingChillerOutput[]): PlotlyChartConfig {
    const efficiencyLabel = PROCESS_COOLING_UNITS.efficiency.labelHTML.imperial;

    const traces: TraceData[] = chillerOutput.map((chiller, index) => {
      const color = graphColors[index % graphColors.length];
      const dash = CHILLER_DASH_PATTERNS[index % CHILLER_DASH_PATTERNS.length];
      const fillColor = hexToRgba(color, CHILLER_FILL_ALPHA);
      return {
        x: chiller.loadPercents.slice(1),
        y: chiller.ariEfficiencyProfile.slice(1),
        type: 'scatter',
        mode: 'lines+markers',
        name: chiller.name,
        marker: { size: 12, color, symbol: MARKER_SHAPES[index % MARKER_SHAPES.length], line: { color: '#ffffff', width: 1.5 } },
        line: { width: 2, dash, color },
        fill: 'tozeroy',
        fillcolor: fillColor,
        hovertemplate: `${chiller.name}<br>Load: %{x}<br>Efficiency (${efficiencyLabel}): %{y:.2f}<extra></extra>`
      };
    });

    const haloTraces: TraceData[] = traces.map(trace => ({
      x: trace.x,
      y: trace.y,
      type: 'scatter',
      mode: 'markers',
      name: trace.name,
      showlegend: false,
      hoverinfo: 'skip',
      marker: {
        size: 22,
        symbol: 'circle-open',
        color: trace.marker.color,
        line: { color: trace.marker.color as string, width: 1.5 },
        opacity: 0.45,
      }
    }));

    const maxEfficiency = Math.max(...chillerOutput.flatMap(c => c.ariEfficiencyProfile.slice(1)));
    const NUM_INTERVALS = 5;
    let tickStep: number;
    let yMax: number;
    let tickformat: string;

 if (maxEfficiency <= 1) {
      yMax = parseFloat((Math.ceil(maxEfficiency * 10) / 10 + 0.02).toFixed(2));
      tickStep = parseFloat((yMax / NUM_INTERVALS).toFixed(2));
      if (tickStep === 0) tickStep = 0.01;
      tickformat = '.2f';
    } else if (maxEfficiency <= 10) {
      yMax = parseFloat((Math.ceil(maxEfficiency * 10) / 10 + 0.2).toFixed(1));
      tickStep = parseFloat((yMax / NUM_INTERVALS).toFixed(1));
      tickformat = '.1f';
    } else if (maxEfficiency > 10) {
      yMax = Math.ceil(maxEfficiency) + 1;
      tickStep = yMax / NUM_INTERVALS;
      tickformat = '.0f';
    }

    const tickvals = Array.from({ length: NUM_INTERVALS + 1 }, (_, i) => parseFloat((i * tickStep).toFixed(tickformat === '.2f' ? 2 : tickformat === '.1f' ? 1 : 0)));
    const rangeMax = tickvals[tickvals.length - 1];

    const layout = {
      xaxis: {
        title: { text: '% Load', font: { size: 16 } },
        range: [0, 100],
        dtick: 10,
        ticksuffix: '%',
        automargin: true
      },
      yaxis: {
        title: { text: `Efficiency (${efficiencyLabel})`, font: { size: 16 } },
        rangemode: 'tozero',
        hoverformat: tickformat,
        automargin: true,
        range: [0, rangeMax],
        tickvals,
        tickformat,
      },
      margin: { t: 20, r: 20, l: 60, b: 60 },
      legend: {
        orientation: 'h', y: 1.15,
        font: {
          size: 14
        }
      },
      showlegend: true,
      hovermode: 'closest'
    };

    const config = defaultPlotlyConfig(undefined, 'scatter');

    return { traces: [...traces, ...haloTraces], layout, config };
  }
}

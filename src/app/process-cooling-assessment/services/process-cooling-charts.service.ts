import { Injectable } from '@angular/core';
import { ProcessCoolingChillerOutput } from '../../shared/models/process-cooling-assessment';
import { TraceData } from '../../shared/models/plotting';
import { graphColors } from '../../shared/graphColors';
import { defaultPlotlyConfig } from '../../shared/helperFunctions';
import { PROCESS_COOLING_UNITS } from '../constants/process-cooling-units';

export interface PlotlyChartConfig {
  traces: TraceData[];
  layout: any;
  config: any;
}


const CHILLER_FILL_COLORS: Array<string> = [
  'rgba(30,118,64,0.07)',   'rgba(42,189,218,0.07)',  'rgba(132,182,65,0.07)',
  'rgba(112,48,160,0.07)',  'rgba(225,205,0,0.07)',   'rgba(48,109,190,0.07)',
  'rgba(160,49,35,0.07)',   'rgba(127,215,233,0.07)', 'rgba(222,118,45,0.07)',
  'rgba(148,138,84,0.07)',  'rgba(169,213,139,0.07)', 'rgba(255,225,102,0.07)',
  'rgba(221,113,100,0.07)', 'rgba(63,74,125,0.07)',
];
const CHILLER_DASH_PATTERNS: Array<string> = ['solid', 'dash', 'dot', 'dashdot', 'longdash', 'longdashdot'];

@Injectable({ providedIn: 'root' })
export class ProcessCoolingChartsService {

  buildChillerProfileChart(chillerOutput: ProcessCoolingChillerOutput[]): PlotlyChartConfig {
    const efficiencyLabel = PROCESS_COOLING_UNITS.efficiency.labelHTML.imperial;

    const traces: TraceData[] = chillerOutput.map((chiller, index) => {
      const color = graphColors[index % graphColors.length];
      const dash = CHILLER_DASH_PATTERNS[index % CHILLER_DASH_PATTERNS.length];
      const fillColor = CHILLER_FILL_COLORS[index % CHILLER_FILL_COLORS.length];
      return {
        x: chiller.loadPercents.slice(1),
        y: chiller.ariEfficiencyProfile.slice(1),
        type: 'scatter',
        mode: 'lines+markers',
        name: chiller.name,
        marker: { size: 8, color, line: { color: '#ffffff', width: 1.5 } },
        line: { width: 2, dash, color },
        fill: 'tozeroy',
        fillcolor: fillColor,
        hovertemplate: `${chiller.name}<br>Load: %{x}<br>Efficiency (${efficiencyLabel}): %{y:.2f}<extra></extra>`,
      };
    });

    const layout = {
      xaxis: {
        title: { text: '% Load', font: { size: 16 } },
        range: [0, 100],
        dtick: 10,
        ticksuffix: '%',
        automargin: true,
      },
      yaxis: {
        title: { text: `Efficiency (${efficiencyLabel})`, font: { size: 16 } },
        rangemode: 'tozero',
        hoverformat: '.2f',
        automargin: true,
        range: [0, 1.2],
        tickvals: [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2],
        tickformat: '.1f',
      },
      margin: { t: 20, r: 20, l: 60, b: 60 },
      legend: {
        orientation: 'h', y: 1.15,
        font: {
          size: 14
        }
      },
      showlegend: true,
      hovermode: 'closest',
      responsive: true,
    };

    const config = defaultPlotlyConfig(undefined, 'scatter');

    return { traces, layout, config };
  }
}

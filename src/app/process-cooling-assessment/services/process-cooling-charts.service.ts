import { Injectable } from '@angular/core';
import { ProcessCoolingChillerOutput } from '../../shared/models/process-cooling-assessment';
import { LOAD_PERCENTAGES } from '../constants/process-cooling-constants';
import { PROCESS_COOLING_UNITS } from '../constants/process-cooling-units';

export interface PlotlyChartConfig {
  traces: any[];
  layout: any;
  config: any;
}

@Injectable({ providedIn: 'root' })
export class ProcessCoolingChartsService {

  buildChillerProfileChart(chillerOutput: ProcessCoolingChillerOutput[]): PlotlyChartConfig {
    const efficiencyLabel = PROCESS_COOLING_UNITS.efficiency.labelHTML.imperial;

    const traces = chillerOutput.map(chiller => ({
      x: LOAD_PERCENTAGES,
      y: chiller.ariEfficiencyProfile,
      type: 'scatter',
      mode: 'lines+markers',
      name: chiller.name,
      line: { width: 3, dash: 'dot', marker: { size: 8 } },
      hovertemplate: `${chiller.name}<br>Load: %{x}<br>Efficiency (${efficiencyLabel}): %{y:.2f}<extra></extra>`,
    }));

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
        range: [0, 1],
        tickvals: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
        tickformat: '.1f',
      },
      margin: { t: 20, r: 20, l: 60, b: 60 },
      legend: { orientation: 'h', y: 1.15 },
      showlegend: true,
      hovermode: 'closest',
      responsive: true,
    };

    const config = {
      responsive: true,
      displaylogo: false,
    };

    return { traces, layout, config };
  }
}

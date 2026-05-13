import { Injectable } from '@angular/core';
import { ProcessCoolingChillerOutput } from '../../shared/models/process-cooling-assessment';
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

    const traces = chillerOutput.map((chiller) => {
      return {
        x: chiller.loadPercents.slice(1),
        y: chiller.ariEfficiencyProfile.slice(1),
        type: 'scatter',
        mode: 'lines+markers',
        name: chiller.name,
        marker: { size: 8 },
        line: {
          width: 3, dash: 'dot',
        },
        hovertemplate: `${chiller.name}<br>Load: %{x}<br>Efficiency (${efficiencyLabel}): %{y:.2f}<extra></extra>`,
      }});

    const maxEfficiency = Math.max(...chillerOutput.flatMap(c => c.ariEfficiencyProfile.slice(1)));
    const tickStep = maxEfficiency <= 1.2 ? 0.2 : Math.ceil((maxEfficiency / 6) / 0.2) * 0.2;
    const yMax = Math.ceil(maxEfficiency / tickStep) * tickStep;
    const tickvals = Array.from({ length: Math.round(yMax / tickStep) + 1 }, (_, i) => parseFloat((i * tickStep).toFixed(1))).slice(0, 7);

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
        range: [0, yMax],
        tickvals,
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

    const config = {
      responsive: true,
      displaylogo: false,
    };

    return { traces, layout, config };
  }
}

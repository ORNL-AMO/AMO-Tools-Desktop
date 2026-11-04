import { Injectable } from '@angular/core';
import { ProcessCoolingChillerOutput } from '../../shared/models/process-cooling-assessment';
import { TraceData } from '../../shared/models/plotting';
import { graphColors } from '../../shared/graphColors';
import { defaultPlotlyConfig } from '../../shared/helperFunctions';
import { PROCESS_COOLING_UNITS } from '../constants/process-cooling-units';
import { CHART_TITLE_FONT_SIZE } from '../../shared/report-builder/adapters/report-chart-style.constants';

export interface PlotlyChartConfig {
  traces: TraceData[];
  layout: object;
  config: object;
}


const MARKER_SHAPES: Array<string> = [
  'star', 'star-diamond', 'hexagram', 'star-square', 'square',
  'diamond', 'cross', 'x', 'diamond-wide', 'diamond-tall'
];
const COMPACT_FONT_SIZE = 11;
const COMPACT_MARKER_SCALE = 0.6;
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

  buildChillerProfileChart(chillerOutput: ProcessCoolingChillerOutput[], showFactoredProfile = false, compact = false): PlotlyChartConfig {
    const titleFontSize = compact ? COMPACT_FONT_SIZE : CHART_TITLE_FONT_SIZE;
    const markerScale = compact ? COMPACT_MARKER_SCALE : 1;
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
        marker: { size: 12 * markerScale, color, symbol: MARKER_SHAPES[index % MARKER_SHAPES.length], line: { color: '#ffffff', width: 1.5 } },
        line: { width: 2, dash, color },
        fill: 'tozeroy',
        fillcolor: fillColor,
        hovertemplate: `${chiller.name}<br>Load: %{x}<br>Efficiency (${efficiencyLabel}): %{y:.2f}<extra></extra>`
      };
    });

    const factoredTraces: TraceData[] = showFactoredProfile ? chillerOutput.map((chiller, index) => {
      const color = graphColors[index % graphColors.length];
      return {
        x: chiller.loadPercents.slice(1),
        y: chiller.ariEfficiencyProfileFactored.slice(1),
        type: 'scatter',
        mode: 'lines+markers',
        name: `${chiller.name} (Adjusted)`,
        marker: { size: 8 * markerScale, color, symbol: MARKER_SHAPES[index % MARKER_SHAPES.length], line: { color: '#ffffff', width: 1 } },
        line: { width: 2, dash: 'dot', color },
        hovertemplate: `${chiller.name} (Adjusted)<br>Load: %{x}<br>Efficiency (${efficiencyLabel}): %{y:.2f}<extra></extra>`
      };
    }) : [];

    const haloTraces: TraceData[] = [...traces, ...factoredTraces].map(trace => ({
      x: trace.x,
      y: trace.y,
      type: 'scatter',
      mode: 'markers',
      name: trace.name,
      showlegend: false,
      hoverinfo: 'skip',
      marker: {
        size: 22 * markerScale,
        symbol: 'circle-open',
        color: trace.marker.color,
        line: { color: trace.marker.color as string, width: 1.5 },
        opacity: 0.45,
      }
    }));

    const maxEfficiency = Math.max(
      ...chillerOutput.flatMap(c => c.ariEfficiencyProfile.slice(1)),
      ...(showFactoredProfile ? chillerOutput.flatMap(c => c.ariEfficiencyProfileFactored.slice(1)) : [])
    );
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
        title: { text: '% Load', font: { size: titleFontSize } },
        range: [0, 100],
        dtick: compact ? 20 : 10,
        tickfont: compact ? { size: COMPACT_FONT_SIZE } : undefined,
        ticksuffix: '%',
        automargin: true
      },
      yaxis: {
        title: { text: `Efficiency (${efficiencyLabel})`, font: { size: titleFontSize } },
        tickfont: compact ? { size: COMPACT_FONT_SIZE } : undefined,
        rangemode: 'tozero',
        hoverformat: tickformat,
        automargin: true,
        range: [0, rangeMax],
        tickvals,
        tickformat,
      },
      margin: compact ? { t: 10, r: 10, l: 45, b: 45 } : { t: 20, r: 20, l: 60, b: 60 },
      legend: compact ? {
        orientation: 'h', x: 0, y: -0.3, yanchor: 'top',
        font: {
          size: COMPACT_FONT_SIZE
        }
      } : {
        orientation: 'h', y: 1.15,
        font: {
          size: CHART_TITLE_FONT_SIZE
        }
      },
      showlegend: true,
      hovermode: 'closest'
    };

    const config = defaultPlotlyConfig(undefined, 'scatter');

    return { traces: [...traces, ...factoredTraces, ...haloTraces], layout, config };
  }
}

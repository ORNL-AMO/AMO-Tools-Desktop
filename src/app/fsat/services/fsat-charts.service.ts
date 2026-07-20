import { inject, Injectable } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { FSAT, FsatOutput } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { TraceData } from '../../shared/models/plotting';

export interface SankeyLayout {
  autosize: boolean;
  margin: { l: number; t: number; r?: number; pad?: number };
  paper_bgcolor?: string;
  plot_bgcolor?: string;
}

export interface FsatSankeyChartData {
  sankeyData: Record<string, unknown>;
  layout: SankeyLayout;
  connectingNodes: number[];
}

export interface FsatGraphData {
  name: string;
  energyInput: number;
  motorLoss: number;
  driveLoss: number;
  fanLoss: number;
  usefulOutput: number;
}

export interface FsatChartConfig {
  traces: TraceData[];
  layout: object;
}

const PIE_LABELS = ['Motor Losses', 'Drive Losses', 'Fan Losses', 'Useful Output'];
const PIE_COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'];
const BAR_LABELS = ['Energy Input', 'Motor Losses', 'Drive Losses', 'Fan Losses', 'Useful Output'];

@Injectable({ providedIn: 'root' })
export class FsatChartsService {
  private readonly convertUnitsService = inject(ConvertUnitsService);
  private readonly plotlyService = inject(PlotlyService);
  private readonly decimalPipe = new DecimalPipe(inject(LOCALE_ID) as string);

  computeOutputGraphData(outputs: FsatOutput, settings: Settings): Omit<FsatGraphData, 'name'> {
    let motorShaftPower = outputs.motorShaftPower;
    let fanShaftPower = outputs.fanShaftPower;
    if (settings.powerMeasurement === 'hp') {
      motorShaftPower = this.convertUnitsService.value(motorShaftPower).from('hp').to('kW');
      fanShaftPower = this.convertUnitsService.value(fanShaftPower).from('hp').to('kW');
    }
    const energyInput = outputs.motorPower;
    const motorLoss = outputs.motorPower * (1 - outputs.motorEfficiency / 100);
    const driveLoss = motorShaftPower - fanShaftPower;
    const fanLoss = (outputs.motorPower - motorLoss - driveLoss) * (1 - outputs.fanEfficiency / 100);
    const usefulOutput = outputs.motorPower - (motorLoss + driveLoss + fanLoss);
    return { energyInput, motorLoss, driveLoss, fanLoss, usefulOutput };
  }

  collectGraphData(fsat: FSAT, settings: Settings): FsatGraphData[] {
    const result: FsatGraphData[] = [];

    if (fsat.outputs) {
      result.push({ name: fsat.name ?? 'Baseline', ...this.computeOutputGraphData(fsat.outputs, settings) });
    }

    fsat.modifications?.forEach(m => {
      if (m.fsat?.valid?.isValid && m.fsat.outputs) {
        result.push({ name: m.fsat.name ?? 'Modification', ...this.computeOutputGraphData(m.fsat.outputs, settings) });
      }
    });

    return result;
  }

  buildEnergyDistributionChart(baseline: FsatGraphData, modification: FsatGraphData): FsatChartConfig {
    return {
      traces: [baseline, modification].map((d, i) => ({
        values: [d.motorLoss, d.driveLoss, d.fanLoss, d.usefulOutput],
        labels: PIE_LABELS,
        type: 'pie', name: d.name,
        title: { text: d.name, font: { size: 14 } },
        domain: { x: [i === 0 ? 0 : 0.52, i === 0 ? 0.48 : 1], y: [0.05, 0.95] },
        marker: { colors: PIE_COLORS },
        textinfo: 'label+percent',
        direction: 'clockwise', rotation: 90,
        hovertemplate: '%{value:.2f} kW<extra></extra>',
      })),
      layout: { showlegend: false, margin: { t: 60, b: 20, l: 20, r: 20 }, paper_bgcolor: 'white' },
    };
  }

  buildPowerComparisonChart(baseline: FsatGraphData, modification: FsatGraphData): FsatChartConfig {
    return {
      traces: [baseline, modification].map(d => ({
        x: BAR_LABELS,
        y: [d.energyInput, d.motorLoss, d.driveLoss, d.fanLoss, d.usefulOutput],
        name: d.name, type: 'bar',
        text: [d.energyInput, d.motorLoss, d.driveLoss, d.fanLoss, d.usefulOutput].map(v => v.toFixed(2)),
        textposition: 'auto',
        hovertemplate: 'Power: %{y:.3r} kW<extra></extra>',
      })),
      layout: {
        barmode: 'group', showlegend: true,
        legend: { orientation: 'h' }, font: { size: 14 },
        yaxis: { title: { text: 'Power (kW)', font: { family: 'Roboto', size: 14 } }, hoverformat: '.3r' },
        margin: { t: 30, b: 80, l: 80, r: 30 }, paper_bgcolor: 'white',
      },
    };
  }

  buildSankeyChartData(outputs: FsatOutput, settings: Settings, labelStyle = 'both'): FsatSankeyChartData {
    const nodeStartColor = 'rgba(214, 185, 0, .9)';
    const nodeArrowColor = 'rgba(232, 217, 82, .9)';

    let motorShaftPower = outputs.motorShaftPower;
    let fanShaftPower = outputs.fanShaftPower;
    if (settings.powerMeasurement === 'hp') {
      motorShaftPower = this.convertUnitsService.value(motorShaftPower).from('hp').to('kW');
      fanShaftPower = this.convertUnitsService.value(fanShaftPower).from('hp').to('kW');
    }
    const motorLoss = outputs.motorPower * (1 - outputs.motorEfficiency / 100);
    const driveLoss = motorShaftPower - fanShaftPower;
    const hasDrive = driveLoss > 0;

    const inputPower = outputs.motorPower;
    const motorConnector = inputPower - motorLoss;
    const driveConnector = hasDrive ? motorConnector - driveLoss : 0;
    const fanLoss = (hasDrive ? driveConnector : motorConnector) * (1 - outputs.fanEfficiency / 100);
    const usefulOutput = (hasDrive ? driveConnector : motorConnector) - fanLoss;
    const connectingNodes = hasDrive ? [0, 1, 2, 5] : [0, 1, 2];

    const getLabel = (name: string, kw: number, pct: number): string => {
      if (labelStyle === 'both') return `${name} ${this.decimalPipe.transform(kw, '1.0-0')} kW/hr (${this.decimalPipe.transform(pct, '1.1-1')}%)`;
      if (labelStyle === 'power') return `${name} ${this.decimalPipe.transform(kw, '1.0-0')} kW/hr`;
      return `${name} ${this.decimalPipe.transform(pct, '1.1-1')}%`;
    };

    const nodes: Array<{ id: string; name: string; value: number; x: number; y: number; nodeColor: string; loss: number }> = [
      { id: 'originConnector', name: getLabel('Energy Input', inputPower, 100), value: 100, x: .1, y: .6, nodeColor: nodeStartColor, loss: inputPower },
      { id: 'inputConnector', name: '', value: 0, x: .4, y: .6, nodeColor: nodeStartColor, loss: inputPower },
      { id: 'motorConnector', name: '', value: (motorConnector / inputPower) * 100, x: .5, y: .6, nodeColor: nodeStartColor, loss: motorConnector },
      { id: 'motorLosses', name: getLabel('Motor Losses', motorLoss, (motorLoss / inputPower) * 100), value: (motorLoss / inputPower) * 100, x: .5, y: .10, nodeColor: nodeArrowColor, loss: motorLoss },
    ];

    if (hasDrive) {
      nodes.push(
        { id: 'driveLosses', name: getLabel('Drive Losses', driveLoss, (driveLoss / inputPower) * 100), value: (driveLoss / inputPower) * 100, x: .6, y: .25, nodeColor: nodeArrowColor, loss: driveLoss },
        { id: 'driveConnector', name: '', value: (driveConnector / inputPower) * 100, x: .7, y: .6, nodeColor: nodeStartColor, loss: driveConnector },
      );
    }
    nodes.push(
      { id: 'fanLosses', name: getLabel('Fan Losses', fanLoss, (fanLoss / inputPower) * 100), value: (fanLoss / inputPower) * 100, x: .8, y: .15, nodeColor: nodeArrowColor, loss: fanLoss },
      { id: 'usefulOutput', name: getLabel('Useful Output', usefulOutput, (usefulOutput / inputPower) * 100), value: (usefulOutput / inputPower) * 100, x: .85, y: .65, nodeColor: nodeArrowColor, loss: usefulOutput },
    );

    const links = [
      { source: 0, target: 1 }, { source: 0, target: 2 },
      { source: 1, target: 2 }, { source: 1, target: 3 },
      ...(hasDrive
        ? [{ source: 2, target: 4 }, { source: 2, target: 5 }, { source: 5, target: 6 }, { source: 5, target: 7 }]
        : [{ source: 2, target: 4 }, { source: 2, target: 5 }]),
    ];

    const sankeyData = {
      type: 'sankey',
      orientation: 'h',
      valuesuffix: '%',
      arrangement: 'freeform',
      textfont: { color: 'rgba(0, 0, 0)', size: 14 },
      ids: nodes.map(n => n.id),
      node: {
        pad: 50,
        line: { color: nodeStartColor, width: 0 },
        label: nodes.map(n => n.name),
        x: nodes.map(n => n.x),
        y: nodes.map(n => n.y),
        color: nodes.map(n => n.nodeColor),
        customdata: nodes.map(n => `${this.decimalPipe.transform(n.loss, '1.0-0')} kW`),
        hovertemplate: '%{customdata}',
        hoverlabel: { font: { size: 14, color: 'rgba(255, 255, 255)' }, align: 'auto' },
      },
      link: {
        value: nodes.map(n => n.value),
        source: links.map(l => l.source),
        target: links.map(l => l.target),
        color: links.map(() => nodeStartColor),
        hoverinfo: 'none',
        line: { color: nodeStartColor, width: 0 },
      },
    };

    const layout: SankeyLayout = { autosize: true, margin: { l: 50, t: 100 } };
    return { sankeyData, layout, connectingNodes };
  }

  applyGradientAndArrows(container: Element, connectingNodes: number[]): void {
    const gradientStartColor = 'rgb(214, 185, 0)';
    const gradientEndColor = 'rgb(232, 217, 82)';

    const mainSVG = container.querySelector('.main-svg');
    const svgDefs = container.querySelector('defs');
    if (mainSVG && svgDefs) {
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.id = 'fsatLinkGradient';
      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '10%');
      stop1.setAttribute('stop-color', gradientStartColor);
      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', gradientEndColor);
      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      svgDefs.querySelector('#fsatLinkGradient')?.remove();
      svgDefs.appendChild(gradient);
    }

    const linkPaths = container.querySelectorAll('.sankey-link');
    for (let i = 0; i < linkPaths.length; i++) {
      // * hardcoded isGradientLink 2–3 are connector-throughput flows (inputConnector→motorConnector, inputConnector→motorLosses).
      // * Last two are fan losses and useful output
      const isGradientLink = i === 2 || i === 3 || i >= linkPaths.length - 2;
      const el = linkPaths[i] as SVGElement;
      el.style.fill = isGradientLink ? 'url(#fsatLinkGradient)' : gradientStartColor;
      el.style.fillOpacity = '0.9';
    }

    const rects = container.querySelectorAll('.node-rect');
    for (let i = 0; i < rects.length; i++) {
      if (!connectingNodes.includes(i)) {
        const rect = rects[i] as SVGRectElement;
        const h = Number(rect.getAttribute('height'));
        const y = Number(rect.getAttribute('y'));
        if (!h || isNaN(y)) continue;
        const x = Number(rect.getAttribute('x') ?? '0');

        const arrowY = y - h / 2.75;
        const arrowH = h * 1.75;
        const arrowW = h;

        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', `${x},${arrowY} ${x + arrowW},${arrowY + arrowH / 2} ${x},${arrowY + arrowH}`);
        poly.setAttribute('fill', gradientEndColor);
        poly.setAttribute('fill-opacity', '0.9');
        poly.setAttribute('stroke', 'rgb(255,255,255)');
        poly.setAttribute('stroke-opacity', '0.5');
        poly.setAttribute('stroke-width', '0.5');

        // * Polygon provides the visual; rect kept at opacity 0 so Plotly's hover events still fire.
        rect.parentElement?.insertBefore(poly, rect);
        rect.setAttribute('opacity', '0');
      }
    }
  }

  async renderSankeyAsImage(outputs: FsatOutput, settings: Settings, labelStyle = 'both'): Promise<string> {
    const { sankeyData, layout, connectingNodes } = this.buildSankeyChartData(outputs, settings, labelStyle);
    layout.paper_bgcolor = 'white';
    layout.margin = { l: 0, t: 60, r: 0 };

    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1400px;height:400px';
    document.body.appendChild(container);

    const plotly = await this.plotlyService.getPlotly();
    try {
      await plotly.newPlot(container, [sankeyData], layout, { displaylogo: false, displayModeBar: false, responsive: false });
      this.applyGradientAndArrows(container, connectingNodes);

      // * Sankey charts only: we serialize the already-modified SVG and render to canvas directly.
      // * Cannot use Plotly.toImage on our sankeys which have custom SVGs, because toImage only clones the graph from the data and layout params. Dom elements are not visible.
      const svgEl = container.querySelector('.main-svg') as SVGSVGElement | null;
      if (!svgEl) throw new Error('FSAT sankey: .main-svg not found after render');
      svgEl.setAttribute('width', '1400');
      svgEl.setAttribute('height', '400');
      const svgString = new XMLSerializer().serializeToString(svgEl);
      return await this.svgToJpeg(svgString, 1400, 400);
    } finally {
      plotly.purge(container);
      document.body.removeChild(container);
    }
  }

  private svgToJpeg(svgString: string, width: number, height: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas 2D context unavailable')); return; }
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load serialized SVG as image'));
      };
      img.src = url;
    });
  }
}

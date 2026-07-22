import { inject, Injectable } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { Settings } from '../../shared/models/settings';
import { SSMT } from '../../shared/models/steam/ssmt';
import { SSMTLosses, SSMTOutput } from '../../shared/models/steam/steam-outputs';
import { formatNumber } from '../../shared/report-builder/adapters/report-adapter.utils';
import { ReportGraphsService } from './report-graphs/report-graphs.service';
import { graphColors } from '../../shared/graphColors';

export interface SsmtChartConfig {
  traces: Array<Record<string, unknown>>;
  layout: object;
}

const ORANGE_START = '#c77f0a';
const ORANGE_END = '#f6b141';
const RED = '#ff0000';
const BLUE = '#0000ff';
const MIN_DISPLAY_VALUE = 0.2;

interface SsmtSankeyNode {
  id: string;
  name: string;
  value: number;
  x: number;
  y: number;
  source: number;
  target: number[];
  isConnector: boolean;
  nodeColor: string;
}

interface SsmtSankeyChartData {
  sankeyData: Record<string, unknown>;
  layout: Record<string, unknown>;
  connectingNodes: number[];
  redLinkPaths: number[];
  blueLinkPaths: number[];
  orangeLinkPaths: number[];
}

/**
 * Ported from shared/ssmt-sankey/ssmt-sankey.component.ts — that component recomputes the whole
 * baseline/modification model itself to get losses/outputData; this service instead takes the
 * already-computed SSMTLosses/SSMTOutput from SsmtReportAdapter's BaselineBundle/ModBundle.
 * providedIn: 'root' — no module-scoped dependencies (unlike compressed air's chart service).
 */
@Injectable({ providedIn: 'root' })
export class SsmtChartsService {
  private readonly plotlyService = inject(PlotlyService);
  private readonly reportGraphsService = inject(ReportGraphsService);

  // ---------------------------------------------------------------------------------
  // Report Graphs (process usage / power generation pie charts, energy waterfall)
  //
  // Ported from the legacy print system's ReportGraphsPrintComponent, which laid out each
  // modification as a "Scenario: {name}" page — Baseline's Process Usage/Generation pies in a
  // left column next to that modification's pies in a right column, then Baseline's Energy Usage
  // waterfall stacked above that modification's waterfall. The new PDF renderer places one image
  // per section (always full width, always stacked vertically) rather than a CSS column layout,
  // so each "page" here is built as a single composite Plotly figure (multiple pies on one figure
  // via domain positioning; two waterfalls on one figure via a 2-row grid) instead of separate
  // side-by-side images.
  // ---------------------------------------------------------------------------------

  /** No modifications: Process Usage pie next to Generation pie (matches the print component's zero-modification fallback). */
  buildBaselineOnlyPieChart(ssmt: SSMT, settings: Settings): SsmtChartConfig {
    const processData = this.reportGraphsService.getProcessUsageValuesAndLabels(ssmt);
    const genData = this.reportGraphsService.getGenerationValuesAndLabels(ssmt);
    return this.buildPieGrid([
      { data: processData, unit: `${settings.steamEnergyMeasurement}/hr`, label: 'Process Usage', x: [0, .46], y: [0, .92] },
      { data: genData, unit: settings.steamPowerMeasurement, label: 'Generation', x: [.54, 1], y: [0, .92] },
    ]);
  }

  /** Has a modification: 2x2 grid — baseline/mod Process Usage on top, baseline/mod Generation below. */
  buildScenarioPieChart(baselineSsmt: SSMT, modSsmt: SSMT, baselineLabel: string, modLabel: string, settings: Settings): SsmtChartConfig {
    const processUnit = `${settings.steamEnergyMeasurement}/hr`;
    const powerUnit = settings.steamPowerMeasurement;
    return this.buildPieGrid([
      { data: this.reportGraphsService.getProcessUsageValuesAndLabels(baselineSsmt), unit: processUnit, label: `${baselineLabel} Process Usage`, x: [0, .46], y: [.54, .96] },
      { data: this.reportGraphsService.getProcessUsageValuesAndLabels(modSsmt), unit: processUnit, label: `${modLabel} Process Usage`, x: [.54, 1], y: [.54, .96] },
      { data: this.reportGraphsService.getGenerationValuesAndLabels(baselineSsmt), unit: powerUnit, label: `${baselineLabel} Generation`, x: [0, .46], y: [0, .42] },
      { data: this.reportGraphsService.getGenerationValuesAndLabels(modSsmt), unit: powerUnit, label: `${modLabel} Generation`, x: [.54, 1], y: [0, .42] },
    ]);
  }

  private buildPieGrid(cells: Array<{ data: Array<{ value: number; label: string }>; unit: string; label: string; x: [number, number]; y: [number, number] }>): SsmtChartConfig {
    const traces: Record<string, unknown>[] = [];
    const annotations: Record<string, unknown>[] = [];

    cells.forEach(cell => {
      const centerX = (cell.x[0] + cell.x[1]) / 2;
      annotations.push({
        text: `<b>${cell.label}</b>`, x: centerX, y: cell.y[1] + 0.05, xref: 'paper', yref: 'paper',
        showarrow: false, font: { size: 13 }, xanchor: 'center',
      });
      if (cell.data.length === 0) {
        annotations.push({
          text: 'No Data for Scenario', x: centerX, y: (cell.y[0] + cell.y[1]) / 2, xref: 'paper', yref: 'paper',
          showarrow: false, font: { size: 12, color: 'rgb(120,120,120)' }, xanchor: 'center',
        });
        return;
      }
      traces.push({
        values: cell.data.map(v => v.value),
        labels: cell.data.map(v => v.label),
        marker: { colors: graphColors },
        type: 'pie',
        domain: { x: cell.x, y: cell.y },
        textposition: 'auto',
        insidetextorientation: 'horizontal',
        hoverformat: '.2r',
        texttemplate: `<b>%{label}:</b><br> %{value:,.2f} ${cell.unit}`,
        hoverinfo: 'label+percent',
      });
    });

    return {
      traces,
      layout: { font: { size: 14 }, showlegend: false, margin: { t: 30, b: 10, l: 20, r: 20 }, annotations },
    };
  }

  /**
   * Ported from SsmtWaterfallComponent.createChart(), stacked into rows of one figure when a
   * modification is present (rows = [baseline, modification]) instead of two separate images.
   * xAxisRange is shared across every waterfall in the report (max fuelEnergy+makeupWaterEnergy
   * across baseline + all valid mods), matching ReportGraphsComponent.setWaterfallXAxis().
   */
  buildScenarioWaterfallChart(
    baselineLosses: SSMTLosses, modLosses: SSMTLosses | null,
    baselineLabel: string, modLabel: string | null,
    settings: Settings, xAxisRange: number,
  ): SsmtChartConfig {
    const rows = modLosses
      ? [{ losses: baselineLosses, label: baselineLabel }, { losses: modLosses, label: modLabel as string }]
      : [{ losses: baselineLosses, label: baselineLabel }];

    const traces: Record<string, unknown>[] = [];
    const annotations: Record<string, unknown>[] = [];
    const layout: Record<string, unknown> = {
      barmode: 'stack', showlegend: false, font: { size: 12 },
      grid: { rows: rows.length, columns: 1, pattern: 'independent', roworder: 'top to bottom' },
      margin: { t: 30, b: 40, r: 50, l: 150 }, clickmode: 'none', dragmode: false,
    };

    rows.forEach((row, i) => {
      const axisSuffix = i === 0 ? '' : String(i + 1);
      const labelsAndValues = this.reportGraphsService.getWaterfallLabelsAndValues(row.losses);

      traces.push({
        x: labelsAndValues.map(v => v.stackTraceValue), y: labelsAndValues.map(v => v.label),
        hoverinfo: 'none', type: 'bar', marker: { color: 'rgba(0,0,0,0)', width: .8 }, orientation: 'h',
        xaxis: `x${axisSuffix}`, yaxis: `y${axisSuffix}`,
      });
      traces.push({
        x: labelsAndValues.map(v => v.value), y: labelsAndValues.map(v => v.label),
        hoverinfo: 'none', textposition: 'auto', insidetextorientation: 'horizontal',
        texttemplate: `<b>%{label}:</b><br> %{value:,.2f} ${settings.steamEnergyMeasurement}/hr`,
        name: 'Energy Usage', type: 'bar', marker: { color: labelsAndValues.map(v => v.color), width: .8 }, orientation: 'h',
        xaxis: `x${axisSuffix}`, yaxis: `y${axisSuffix}`,
      });

      layout[`xaxis${axisSuffix}`] = { range: [0, xAxisRange + 50], automargin: true };
      layout[`yaxis${axisSuffix}`] = { fixedrange: true };
      annotations.push({
        text: `<b>${row.label} Energy Usage</b>`, x: 0, xref: 'paper',
        y: 1 - i / rows.length - 0.02, yref: 'paper', showarrow: false, font: { size: 13 }, xanchor: 'left',
      });
    });

    layout.annotations = annotations;
    return { traces, layout };
  }

  // ---------------------------------------------------------------------------------
  // Report Sankey
  // ---------------------------------------------------------------------------------

  private getSankeyLabel(name: string, loss: number, value: number, units: string, labelStyle: string): string {
    if (labelStyle === 'both') return `${name} ${formatNumber(loss)} ${units}/hr (${formatNumber(value, 1, 1)}%)`;
    if (labelStyle === 'energy') return `${name} ${formatNumber(loss)} ${units}/hr`;
    return `${name} ${formatNumber(value, 1, 1)}%`;
  }

  /** Literal port of SsmtSankeyComponent.buildNodes()/buildLinks(). */
  private buildSankeyChartData(losses: SSMTLosses, units: string, labelStyle = 'both'): SsmtSankeyChartData {
    const redLinkPaths: number[] = [];
    const blueLinkPaths: number[] = [];
    const orangeLinkPaths: number[] = [];
    const label = (name: string, loss: number, value: number) => this.getSankeyLabel(name, loss, value, units, labelStyle);

    const energyInput = losses.fuelEnergy + losses.makeupWaterEnergy;
    const stackLosses = losses.stack;
    const blowdownLosses = losses.blowdown;
    const turbineLosses = losses.condensingTurbineEfficiencyLoss + losses.highToMediumTurbineEfficiencyLoss
      + losses.highToLowTurbineEfficiencyLoss + losses.mediumToLowTurbineEfficiencyLoss + losses.condensingLosses;
    const turbineGeneration = losses.condensingTurbineUsefulEnergy + losses.highToLowTurbineUsefulEnergy
      + losses.highToMediumTurbineUsefulEnergy + losses.mediumToLowTurbineUsefulEnergy;
    const processUsage = losses.highPressureProcessUsage + losses.mediumPressureProcessUsage + losses.lowPressureProcessUsage;
    const unreturnedCondensate = losses.lowPressureProcessLoss + losses.highPressureProcessLoss + losses.mediumPressureProcessLoss;
    // NOTE: the source component has `otherLosses + this.losses.lowPressureVentLoss;` here — a no-op
    // expression statement (missing `=`), so lowPressureVentLoss is never actually added. Ported
    // verbatim (bug and all) to match the on-screen sankey's real, shipped behavior.
    const otherLosses = losses.highPressureHeader + losses.mediumPressureHeader + losses.lowPressureHeader
      + losses.condensateLosses + losses.deaeratorVentLoss + losses.condensateFlashTankLoss;

    let returnedCondensate = 0;
    let returnedCondensateValue = 0;
    const originalEnergyInput = energyInput;
    let energyInputValue = (energyInput / originalEnergyInput) * 100;

    if (losses.returnedSteamAndCondensate) {
      returnedCondensate = losses.returnedSteamAndCondensate;
      returnedCondensateValue = (returnedCondensate / energyInput) * 100;
    }
    const adjustedEnergyInput = energyInput + returnedCondensate;
    energyInputValue += returnedCondensateValue;

    const stackLossValue = (stackLosses / energyInput) * 100;
    const blowdownLossValue = (blowdownLosses / energyInput) * 100;
    const otherLossValue = (otherLosses / energyInput) * 100;
    const turbineLossValue = (turbineLosses / energyInput) * 100;
    const turbineGenerationValue = (turbineGeneration / energyInput) * 100;
    const unreturnedCondensateValue = (unreturnedCondensate / energyInput) * 100;
    const processUsageValue = (processUsage / energyInput) * 100;

    const lossConnectorTargets: number[] = [3];
    const usefulConnectorTargets: number[] = [];
    let totalLosses = 0;
    let usefulEnergy = 0;
    let currentSourceIndex = 4;

    const nodes: SsmtSankeyNode[] = [
      { id: 'originConnector', name: label('Energy', originalEnergyInput, 100), value: 100, x: .05, y: .6, source: 0, target: [1], isConnector: true, nodeColor: ORANGE_START },
      { id: 'ReturnAndOrigin', name: '', value: energyInputValue, x: .2, y: .6, source: 1, target: [2, 3], isConnector: true, nodeColor: ORANGE_START },
      { id: 'lossConnector', name: '', value: 0, x: .4, y: .6, source: 2, target: lossConnectorTargets, isConnector: true, nodeColor: ORANGE_START },
      { id: 'usefulConnector', name: '', value: 0, x: .6, y: .6, source: 3, target: usefulConnectorTargets, isConnector: true, nodeColor: ORANGE_START },
    ];

    if (stackLossValue > MIN_DISPLAY_VALUE) {
      nodes.push({ id: 'stackLoss', name: label('Stack Loss', stackLosses, stackLossValue), value: stackLossValue, x: .5, y: .1, source: currentSourceIndex, target: [], isConnector: false, nodeColor: RED });
      lossConnectorTargets.push(currentSourceIndex);
      redLinkPaths.push(currentSourceIndex);
      totalLosses += stackLosses;
      currentSourceIndex++;
    }

    if (blowdownLossValue > MIN_DISPLAY_VALUE) {
      nodes.push({ id: 'blowdownLoss', name: label('Blowdown Loss', blowdownLosses, blowdownLossValue), value: blowdownLossValue, x: .6, y: .15, source: currentSourceIndex, target: [], isConnector: false, nodeColor: RED });
      lossConnectorTargets.push(currentSourceIndex);
      redLinkPaths.push(currentSourceIndex);
      totalLosses += blowdownLosses;
      currentSourceIndex++;
    }

    if (otherLossValue > MIN_DISPLAY_VALUE) {
      nodes.push({ id: 'otherLosses', name: label('Other Losses', otherLosses, otherLossValue), value: otherLossValue, x: .55, y: .3, source: currentSourceIndex, target: [], isConnector: false, nodeColor: RED });
      lossConnectorTargets.push(currentSourceIndex);
      redLinkPaths.push(currentSourceIndex);
      totalLosses += otherLosses;
      currentSourceIndex++;
    }

    if (turbineLossValue > MIN_DISPLAY_VALUE) {
      nodes.push({ id: 'turbineLosses', name: label('Turbine Losses', turbineLosses, turbineLossValue), value: turbineLossValue, x: .6, y: .2, source: currentSourceIndex, target: [], isConnector: false, nodeColor: RED });
      lossConnectorTargets.push(currentSourceIndex);
      redLinkPaths.push(currentSourceIndex);
      totalLosses += turbineLosses;
      currentSourceIndex++;
    }

    if (turbineGenerationValue > MIN_DISPLAY_VALUE) {
      nodes.push({ id: 'turbineGeneration', name: label('Turbine Generation', turbineGeneration, turbineGenerationValue), value: turbineGenerationValue, x: .8, y: .4, source: currentSourceIndex, target: [], isConnector: false, nodeColor: ORANGE_END });
      usefulConnectorTargets.push(currentSourceIndex);
      orangeLinkPaths.push(currentSourceIndex);
      usefulEnergy += turbineGeneration;
      currentSourceIndex++;
    }

    if (processUsageValue > MIN_DISPLAY_VALUE) {
      nodes.push({ id: 'processUsage', name: label('Process Usage', processUsage, processUsageValue), value: processUsageValue, x: .85, y: .6, source: currentSourceIndex, target: [], isConnector: false, nodeColor: ORANGE_END });
      usefulConnectorTargets.push(currentSourceIndex);
      orangeLinkPaths.push(currentSourceIndex);
      usefulEnergy += processUsage;
      currentSourceIndex++;
    }

    if (unreturnedCondensateValue > MIN_DISPLAY_VALUE) {
      nodes.push({ id: 'unreturnedCondensate', name: label('Unreturned Condensate', unreturnedCondensate, unreturnedCondensateValue), value: unreturnedCondensateValue, x: .8, y: .75, source: currentSourceIndex, target: [], isConnector: false, nodeColor: RED });
      usefulConnectorTargets.push(currentSourceIndex);
      redLinkPaths.push(currentSourceIndex);
      usefulEnergy += unreturnedCondensate;
      currentSourceIndex++;
    }

    const usefulConnectorValue = ((adjustedEnergyInput - totalLosses) / energyInput) * 100;
    nodes[3].value = usefulConnectorValue;

    usefulEnergy += returnedCondensate;
    const remainingEnergy = energyInput - (totalLosses + usefulEnergy);
    const remainingEnergyValue = (remainingEnergy / energyInput) * 100;

    if (remainingEnergyValue > MIN_DISPLAY_VALUE) {
      nodes.push({ id: 'remainingEnergy', name: label('Remaining Energy', remainingEnergy, remainingEnergyValue), value: remainingEnergyValue, x: .8, y: .8, source: currentSourceIndex, target: [], isConnector: false, nodeColor: ORANGE_END });
      usefulConnectorTargets.push(currentSourceIndex);
      orangeLinkPaths.push(currentSourceIndex);
      currentSourceIndex++;
    }

    if (returnedCondensateValue > MIN_DISPLAY_VALUE) {
      nodes.push({ id: 'returnedCondensate', name: label('Returned Steam and Condensate', returnedCondensate, returnedCondensateValue), value: returnedCondensateValue, x: .8, y: .95, source: currentSourceIndex, target: [1], isConnector: true, nodeColor: BLUE });
      usefulConnectorTargets.push(currentSourceIndex);
      blueLinkPaths.push(currentSourceIndex);
      currentSourceIndex++;

      // No label displays for circular flows - dummy node/link, matches the source component.
      nodes.push({ id: 'returnedCondensateLabel', name: '', value: returnedCondensateValue, x: .4, y: .9, source: currentSourceIndex, target: [1], isConnector: true, nodeColor: BLUE });
      blueLinkPaths.push(currentSourceIndex);
      currentSourceIndex++;
    }

    const connectingNodes: number[] = [];
    const links: Array<{ source: number; target: number }> = [];
    nodes.forEach((node, i) => {
      if (node.isConnector) connectingNodes.push(i);
      node.target.forEach(target => links.push({ source: node.source, target }));
    });

    const sankeyData = {
      type: 'sankey', orientation: 'h', valuesuffix: '%',
      ids: nodes.map(n => n.id),
      textfont: { color: 'rgba(0, 0, 0)', size: 14 },
      arrangement: 'freeform',
      node: {
        pad: 0,
        line: { color: ORANGE_START },
        label: nodes.map(n => n.name),
        x: nodes.map(n => n.x),
        y: nodes.map(n => n.y),
        color: nodes.map(n => n.nodeColor),
        hoverinfo: 'all',
        hovertemplate: '%{value}<extra></extra>',
        hoverlabel: { font: { size: 14, color: 'rgba(255,255,255)' }, align: 'auto' },
        showgrid: false,
      },
      link: {
        value: nodes.map(n => n.value),
        source: links.map(l => l.source),
        target: links.map(l => l.target),
        hoverinfo: 'none',
        line: { color: ORANGE_START, width: 0 },
      },
    };

    const layout = { autosize: true, margin: { l: 50, t: 60, r: 0 }, paper_bgcolor: 'white', plot_bgcolor: 'white' };

    return { sankeyData, layout, connectingNodes, redLinkPaths, blueLinkPaths, orangeLinkPaths };
  }

  /** Port of addGradientElement() + setGradient() + buildSvgArrows(), off-DOM (no Renderer2/ElementRef host). */
  private applyGradientAndArrows(
    container: Element, connectingNodes: number[], redLinkPaths: number[], blueLinkPaths: number[], orangeLinkPaths: number[],
  ): void {
    this.injectGradientDefs(container);

    const links = container.querySelectorAll('.sankey-link');
    links.forEach((link, i) => {
      let fill: string;
      if (redLinkPaths.includes(i + 1)) fill = 'url(#ssmtOrangeRedGradient)';
      else if (blueLinkPaths.includes(i + 1)) fill = 'url(#ssmtOrangeBlueGradient)';
      else if (orangeLinkPaths.includes(i + 1)) fill = 'url(#ssmtOrangeGradient)';
      else fill = ORANGE_START;
      (link as SVGElement).setAttribute('style', `fill: ${fill}; opacity: 1; fill-opacity: 1;`);
    });

    const rects = container.querySelectorAll('.node-rect');
    rects.forEach((rectEl, i) => {
      if (connectingNodes.includes(i)) return;
      const rect = rectEl as SVGRectElement;
      const height = Number(rect.getAttribute('height'));
      const y = Number(rect.getAttribute('y'));
      if (!height || isNaN(y)) return;

      let arrowColor = ORANGE_END;
      if (redLinkPaths.includes(i)) arrowColor = RED;
      else if (blueLinkPaths.includes(i)) arrowColor = BLUE;

      rect.setAttribute('y', `${y - height / 2.75}`);
      rect.setAttribute('style', `width: ${height}px; height: ${height * 1.75}px; clip-path: polygon(100% 50%, 0 0, 0 100%); stroke-width: 0.5; stroke: rgb(255,255,255); stroke-opacity: 0.5; fill: ${arrowColor}; fill-opacity: 1;`);
    });
  }

  private injectGradientDefs(container: Element): void {
    const mainSVG = container.querySelector('.main-svg');
    const svgDefs = container.querySelector('defs');
    if (!mainSVG || !svgDefs) return;

    const gradients: Array<[string, string, string]> = [
      ['ssmtOrangeGradient', ORANGE_START, ORANGE_END],
      ['ssmtOrangeRedGradient', ORANGE_START, RED],
      ['ssmtOrangeBlueGradient', ORANGE_START, BLUE],
    ];
    gradients.forEach(([id, start, end]) => {
      svgDefs.querySelector(`#${id}`)?.remove();
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.id = id;
      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '10%');
      stop1.setAttribute('stop-color', start);
      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', end);
      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      svgDefs.appendChild(gradient);
    });
  }

  /** Returns null (mirrors the on-screen `!hasSteamModelerError` guard) if the sankey can't be built. */
  async renderSankeyAsImage(losses: SSMTLosses | undefined, outputData: SSMTOutput | undefined, settings: Settings, labelStyle = 'both'): Promise<string | null> {
    if (!losses || !outputData || outputData.hasSteamModelerError) return null;

    const units = settings.steamEnergyMeasurement;
    const { sankeyData, layout, connectingNodes, redLinkPaths, blueLinkPaths, orangeLinkPaths } = this.buildSankeyChartData(losses, units, labelStyle);

    const width = 1400;
    const height = 500;
    const container = document.createElement('div');
    container.style.cssText = `position:absolute;left:-9999px;top:-9999px;width:${width}px;height:${height}px`;
    document.body.appendChild(container);

    const plotly = await this.plotlyService.getPlotly();
    try {
      await plotly.newPlot(container, [sankeyData], layout, { displaylogo: false, displayModeBar: false, responsive: false });
      this.applyGradientAndArrows(container, connectingNodes, redLinkPaths, blueLinkPaths, orangeLinkPaths);

      const svgEl = container.querySelector('.main-svg') as SVGSVGElement | null;
      if (!svgEl) throw new Error('SSMT sankey: .main-svg not found after render');
      svgEl.setAttribute('width', String(width));
      svgEl.setAttribute('height', String(height));
      const svgString = new XMLSerializer().serializeToString(svgEl);
      return await this.svgToJpeg(svgString, width, height);
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

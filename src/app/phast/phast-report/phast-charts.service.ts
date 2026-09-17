import { inject, Injectable } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { PHAST, PhastResults, ShowResultsCategories } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { TraceData } from '../../shared/models/plotting';
import { PhastResultsService } from '../phast-results.service';
import { FuelResults, SankeyService } from '../../shared/phast-sankey/sankey.service';
import { formatNumber, renderSankeyToImage } from '../../shared/report-builder/adapters/report-adapter.utils';
import {
  CHART_LABEL_FONT_SIZE, CHART_TITLE_FONT_FAMILY, CHART_TITLE_FONT_SIZE, getSideBySidePieDomain,
} from '../../shared/report-builder/adapters/report-chart-style.constants';

export interface PhastChartConfig {
  traces: TraceData[];
  layout: object;
}

export interface PhastPieCell {
  valuesAndLabels: Array<{ value: number; label: string }>;
  unit: string;
  label: string;
}

const GRADIENT_START = '#a71600';
const GRADIENT_END = '#ffa400';
const MIN_DISPLAY_VALUE = 0.2;

/**
 * PHAST loss-breakdown pies can carry far more slices (up to ~10 loss categories) than PSAT/FSAT's
 * fixed 4-category pies, so they need more headroom than the shared SIDE_BY_SIDE_PIE_MARGIN — outside
 * labels on narrow slices need room to sit past the pie's edge without getting clipped.
 */
const PHAST_PIE_MARGIN = { t: 60, b: 40, l: 60, r: 60 };

interface PhastSankeyNode {
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

interface PhastSankeyChartData {
  sankeyData: Record<string, unknown>;
  layout: Record<string, unknown>;
  connectingNodes: number[];
  orangeLinkPaths: number[];
}

@Injectable({ providedIn: 'root' })
export class PhastChartsService {
  private readonly plotlyService = inject(PlotlyService);
  private readonly phastResultsService = inject(PhastResultsService);
  private readonly sankeyService = inject(SankeyService);

  /** Ported from ReportGraphsComponent.getValuesAndLabels */
  getLossValuesAndLabels(results: PhastResults, resultCats: ShowResultsCategories): Array<{ value: number; label: string }> {
    const pieData: Array<{ label: string; value: number }> = [];
    if (results.totalWallLoss) pieData.push({ label: 'Wall', value: results.totalWallLoss });
    if (results.totalAtmosphereLoss) pieData.push({ label: 'Atmosphere', value: results.totalAtmosphereLoss });
    if (results.totalOtherLoss) pieData.push({ label: 'Other', value: results.totalOtherLoss });
    if (results.totalCoolingLoss) pieData.push({ label: 'Cooling', value: results.totalCoolingLoss });
    if (results.totalOpeningLoss) pieData.push({ label: 'Opening', value: results.totalOpeningLoss });
    if (results.totalFixtureLoss) pieData.push({ label: 'Fixture', value: results.totalFixtureLoss });
    if (results.totalLeakageLoss) pieData.push({ label: 'Leakage', value: results.totalLeakageLoss });
    if (results.totalExtSurfaceLoss) pieData.push({ label: 'Extended Surface', value: results.totalExtSurfaceLoss });
    if (results.totalChargeMaterialLoss) pieData.push({ label: 'Charge Material', value: results.totalChargeMaterialLoss });
    if (resultCats.showFlueGas) pieData.push({ label: 'Flue Gas', value: results.totalFlueGas });
    if (resultCats.showAuxPower) pieData.push({ label: 'Auxiliary', value: results.totalAuxPower });
    if (resultCats.showSlag) pieData.push({ label: 'Slag', value: results.totalSlag });
    if (resultCats.showExGas) pieData.push({ label: 'Exhaust Gas', value: results.totalExhaustGasEAF });
    if (resultCats.showEnInput2) pieData.push({ label: 'Exhaust Gas', value: results.totalExhaustGas });
    if (resultCats.showSystemEff) pieData.push({ label: 'System Eff.', value: results.totalSystemLosses });
    return pieData;
  }

  /** Ported from ReportGraphsComponent.getDeliverValuesAndLabels */
  getDeliverValuesAndLabels(results: PhastResults): Array<{ value: number; label: string }> {
    const pieData: Array<{ label: string; value: number }> = [];
    if (results.energyInputTotalChemEnergy) pieData.push({ label: 'Chemical Energy Input', value: results.energyInputTotalChemEnergy });
    if (results.energyInputHeatDelivered) pieData.push({ label: 'Electrical Energy Input', value: results.energyInputHeatDelivered });
    return pieData;
  }

  /**
   * Renders 1-2 pies side by side (via getSideBySidePieDomain when there are 2), each labeled with
   * its own bold annotation above it — needed because a shared ChartSection.title can only describe
   * the whole image, not which pie is which once two scenarios/metrics are combined into one chart.
   */
  buildPieChart(cells: PhastPieCell[]): PhastChartConfig {
    const domains = cells.length > 1
      ? cells.map((_, i) => getSideBySidePieDomain(i))
      : [{ x: [0, 1] as [number, number], y: [0, 1] as [number, number] }];
    const traces: TraceData[] = [];
    const annotations: Record<string, unknown>[] = [];

    cells.forEach((cell, i) => {
      const domain = domains[i];
      const centerX = (domain.x[0] + domain.x[1]) / 2;
      annotations.push({
        text: `<b>${cell.label}</b>`, x: centerX, y: domain.y[1] + 0.05, xref: 'paper', yref: 'paper',
        showarrow: false, font: { size: CHART_TITLE_FONT_SIZE }, xanchor: 'center',
      });
      if (cell.valuesAndLabels.length === 0) {
        annotations.push({
          text: 'No Data', x: centerX, y: (domain.y[0] + domain.y[1]) / 2, xref: 'paper', yref: 'paper',
          showarrow: false, font: { size: CHART_LABEL_FONT_SIZE, color: 'rgb(120,120,120)' }, xanchor: 'center',
        });
        return;
      }
      traces.push({
        values: cell.valuesAndLabels.map(v => v.value),
        labels: cell.valuesAndLabels.map(v => v.label),
        type: 'pie',
        domain,
        // 'auto' lets big slices (Flue Gas, Charge Material, ...) keep their label inside, only
        // pushing smaller slices' labels outside — automargin then keeps those outside labels from
        // getting clipped at the image edge instead of just vanishing.
        textposition: 'auto',
        automargin: true,
        textinfo: 'label+percent',
        textfont: { size: CHART_LABEL_FONT_SIZE },
        hovertemplate: `%{label}: %{value:,.2f} ${cell.unit}<extra></extra>`,
      } as unknown as TraceData);
    });

    return {
      traces,
      layout: {
        showlegend: false,
        margin: PHAST_PIE_MARGIN,
        font: { size: CHART_TITLE_FONT_SIZE }, paper_bgcolor: 'white', annotations,
      },
    };
  }

  buildLossBarChart(scenarios: Array<{ name: string; labels: string[]; values: number[] }>, yUnit: string): PhastChartConfig {
    return {
      traces: scenarios.map(s => ({
        x: s.labels, y: s.values, name: s.name, type: 'bar',
        text: s.values.map(v => v.toFixed(2)), textposition: 'auto',
        hovertemplate: `%{y:.2f} ${yUnit}<extra></extra>`,
      } as unknown as TraceData)),
      layout: {
        barmode: 'group', showlegend: true, legend: { orientation: 'h' }, font: { size: CHART_TITLE_FONT_SIZE },
        yaxis: { title: { text: `Heat Loss (${yUnit})`, font: { family: CHART_TITLE_FONT_FAMILY, size: CHART_TITLE_FONT_SIZE } } },
        margin: { t: 30, b: 80, l: 80, r: 30 }, paper_bgcolor: 'white',
      },
    };
  }

  private getSankeyLabel(name: string, loss: number, value: number, units: string, labelStyle: string): string {
    if (labelStyle === 'both') return `${name} ${formatNumber(loss)} ${units}/hr (${formatNumber(value, 1, 1)}%)`;
    if (labelStyle === 'power') return `${name} ${formatNumber(loss)} ${units}/hr`;
    return `${name} ${formatNumber(value, 1, 1)}%`;
  }

  /**
   * Ported from PhastSankeyComponent's buildNodes/addInitialNodes/addLossNode/addEndNode — kept as
   * local state within this single call (rather than instance fields) so concurrent report builds
   * can't interfere with each other.
   */
  private buildSankeyChartData(
    results: FuelResults, exothermicHeatRaw: number | null, fuelEnergyRaw: number | null, electricalEnergyRaw: number | null,
    settings: Settings, labelStyle: string,
  ): PhastSankeyChartData {
    const units = settings.energyResultUnit !== 'kWh' ? settings.energyResultUnit : 'kW';
    const label = (name: string, loss: number, value: number) => this.getSankeyLabel(name, loss, value, units, labelStyle);

    const nodes: PhastSankeyNode[] = [];
    const orangeLinkPaths: number[] = [];
    const initialLossConnectorTargets: number[] = [];
    const lossNodeYPositions = [.1, .9, .2, .8, .15, .9, .2, .8, .1, .9, .2, .8, .1, .9, .2, .8];

    let energyInput = results.totalInput;
    const exothermicHeat = exothermicHeatRaw ? Math.abs(exothermicHeatRaw) : 0;
    if (exothermicHeat) energyInput += exothermicHeat;
    const exothermicHeatValue = exothermicHeat ? (exothermicHeat / energyInput) * 100 : 0;
    const fuelEnergy = fuelEnergyRaw ?? 0;
    const electricalEnergy = electricalEnergyRaw ?? 0;

    let currentSourceIndex: number;
    let secondConnectorLoss: number;
    let subLossesConnectorIndex: number;

    if (fuelEnergy) {
      currentSourceIndex = 4;
      secondConnectorLoss = 6;
      subLossesConnectorIndex = 5;
      let startingSource = 0;
      let spacerTarget = 3;
      const fuelValue = (fuelEnergy / energyInput) * 100;
      const electricalValue = (electricalEnergy / energyInput) * 100;

      if (exothermicHeat) {
        startingSource++; spacerTarget++;
        nodes.push({ id: 'exothermicHeat', name: label('Exothermic Heat', exothermicHeat, exothermicHeatValue), value: exothermicHeatValue, x: .02, y: .9, source: 0, target: [startingSource + 2], isConnector: true, nodeColor: GRADIENT_START });
        currentSourceIndex++; secondConnectorLoss++; subLossesConnectorIndex++;
      }

      nodes.push(
        { id: 'fuelConnector', name: label('Chemical Heat', fuelEnergy, fuelValue), value: fuelValue, x: .02, y: .2, source: startingSource, target: [startingSource + 2], isConnector: true, nodeColor: GRADIENT_START },
        { id: 'electricalConnector', name: label('Electrical Heat', electricalEnergy, electricalValue), value: electricalValue, x: .02, y: .65, source: startingSource + 1, target: [startingSource + 2], isConnector: true, nodeColor: GRADIENT_START },
        { id: 'spacer', name: 'Total Energy', value: 100, x: .2, y: .5, source: startingSource + 2, target: [spacerTarget], isConnector: true, nodeColor: GRADIENT_START },
        { id: 'initialLossConnector', name: '', value: 0, x: .35, y: .5, source: spacerTarget, target: initialLossConnectorTargets, isConnector: true, nodeColor: GRADIENT_START },
      );
    } else {
      currentSourceIndex = 3;
      secondConnectorLoss = 5;
      subLossesConnectorIndex = 4;
      let startingSource = 0;
      let totalInputValue = 100;

      if (exothermicHeat) {
        totalInputValue -= exothermicHeatValue;
        startingSource++;
        nodes.push({ id: 'exothermicHeat', name: label('Exothermic Heat', exothermicHeat, exothermicHeatValue), value: exothermicHeatValue, x: .02, y: .95, source: 0, target: [startingSource + 1], isConnector: true, nodeColor: GRADIENT_START });
        currentSourceIndex++; secondConnectorLoss++; subLossesConnectorIndex++;
      }

      nodes.push(
        { id: 'originConnector', name: label('Heat Input', energyInput - exothermicHeat, totalInputValue), value: totalInputValue, x: .02, y: .5, source: startingSource, target: [startingSource + 1], isConnector: true, nodeColor: GRADIENT_START },
        { id: 'spacer', name: '', value: 100, x: .2, y: .5, source: startingSource + 1, target: [startingSource + 2], isConnector: true, nodeColor: GRADIENT_START },
        { id: 'initialLossConnector', name: '', value: 0, x: .35, y: .5, source: startingSource + 2, target: initialLossConnectorTargets, isConnector: true, nodeColor: GRADIENT_START },
      );
    }
    initialLossConnectorTargets.push(currentSourceIndex);

    let totalLosses = 0;
    let hasLossConnectors = false;
    let connectorNodeXPosition = .45;
    let lossNodeXPosition = .45;

    const addLossNode = (loss: number, lossValue: number, lossName: string, lossNodeYIndex: number) => {
      if (currentSourceIndex < subLossesConnectorIndex) {
        totalLosses += loss;
      }
      if (lossValue > MIN_DISPLAY_VALUE) {
        if (currentSourceIndex > subLossesConnectorIndex) {
          const lossConnectorTargets = [currentSourceIndex + 1];
          hasLossConnectors = true;
          connectorNodeXPosition += .05;
          nodes.push({
            id: `${lossName.split(' ').join('')}LossConnector`, name: '', value: ((energyInput - totalLosses) / energyInput) * 100,
            x: connectorNodeXPosition, y: .6, source: currentSourceIndex, target: lossConnectorTargets, isConnector: true, nodeColor: GRADIENT_START,
          });
          if (currentSourceIndex === secondConnectorLoss) {
            initialLossConnectorTargets.push(secondConnectorLoss);
          } else {
            nodes[currentSourceIndex - 2].target.push(currentSourceIndex);
          }
          currentSourceIndex++;
        }

        lossNodeXPosition += .05;
        nodes.push({
          id: `${lossName.split(' ').join('')}Loss`, name: label(lossName, loss, lossValue), value: lossValue,
          x: lossNodeXPosition, y: lossNodeYPositions[lossNodeYIndex], source: currentSourceIndex, target: [], isConnector: false, nodeColor: GRADIENT_END,
        });
        if (currentSourceIndex <= subLossesConnectorIndex) {
          initialLossConnectorTargets.push(currentSourceIndex);
        }
        orangeLinkPaths.push(currentSourceIndex);
        currentSourceIndex++;
      }

      if (currentSourceIndex > subLossesConnectorIndex) {
        totalLosses += loss;
      }
    };

    const losses: Record<string, number> = {
      'Flue Gas': results.totalFlueGas,
      'Exhaust': results.totalExhaustGas,
      'Electrical': results.totalElectricalHeaterLosses,
      'System': results.totalSystemLosses,
      'Water Cooling': results.totalCoolingLoss,
      'Wall': results.totalWallLoss,
      'Opening': results.totalOpeningLoss,
      'Leakage': results.totalLeakageLoss,
      'Atmosphere': results.totalAtmosphereLoss,
      'Fixture': results.totalFixtureLoss,
      'External': results.totalExtSurfaceLoss,
      'Other': results.totalOtherLoss,
      'Slag': results.totalSlag,
    };

    let positionIndex = 0;
    Object.keys(losses).forEach(lossName => {
      const amount = losses[lossName];
      if (amount > 0) {
        addLossNode(amount, (amount / energyInput) * 100, lossName, positionIndex);
        positionIndex++;
      }
    });

    const chargeMaterialLoss = results.totalChargeMaterialLoss;
    const chargeMaterialLossValue = (chargeMaterialLoss / energyInput) * 100;
    if (chargeMaterialLossValue > 0 && chargeMaterialLossValue > MIN_DISPLAY_VALUE) {
      if (hasLossConnectors) {
        nodes[nodes.length - 2].target.push(currentSourceIndex);
      } else {
        initialLossConnectorTargets.push(currentSourceIndex);
      }
      nodes.push({
        id: 'chargeMaterial', name: label('Charge Material', chargeMaterialLoss, chargeMaterialLossValue), value: chargeMaterialLossValue,
        x: .9, y: .6, source: currentSourceIndex, target: [], isConnector: false, nodeColor: GRADIENT_END,
      });
      orangeLinkPaths.push(currentSourceIndex);
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
        pad: 260,
        line: { color: GRADIENT_START },
        label: nodes.map(n => n.name),
        x: nodes.map(n => n.x),
        y: nodes.map(n => n.y),
        color: nodes.map(n => n.nodeColor),
        hoverinfo: 'all',
        hovertemplate: '%{value}<extra></extra>',
        hoverlabel: { font: { size: 14, color: 'rgba(255, 255, 255)' }, align: 'justify' },
        showgrid: false,
      },
      link: {
        value: nodes.map(n => n.value),
        source: links.map(l => l.source),
        target: links.map(l => l.target),
        hoverinfo: 'none',
        line: { color: GRADIENT_START, width: 0 },
      },
    };

    const layout = {
      autosize: true, height: 500,
      margin: { l: 50, t: 25, r: 50, pad: 20 },
      paper_bgcolor: 'white', plot_bgcolor: 'white',
      xaxis: { showgrid: false, showticklabels: false, showline: false },
      yaxis: { showgrid: false, showticklabels: false, showline: false },
    };

    return { sankeyData, layout, connectingNodes, orangeLinkPaths };
  }

  private injectGradientDefs(container: Element): void {
    const mainSVG = container.querySelector('.main-svg');
    const svgDefs = container.querySelector('defs');
    if (!mainSVG || !svgDefs) return;
    svgDefs.querySelector('#phastOrangeRedGradient')?.remove();
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.id = 'phastOrangeRedGradient';
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '10%');
    stop1.setAttribute('stop-color', GRADIENT_START);
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', GRADIENT_END);
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    svgDefs.appendChild(gradient);
  }

  private applyGradientAndArrows(container: Element, connectingNodes: number[], orangeLinkPaths: number[]): void {
    this.injectGradientDefs(container);

    const links = container.querySelectorAll('.sankey-link');
    links.forEach((linkEl, i) => {
      const fill = orangeLinkPaths.includes(i + 1) ? 'url(#phastOrangeRedGradient)' : GRADIENT_START;
      (linkEl as SVGElement).setAttribute('style', `fill: ${fill}; opacity: 1; fill-opacity: 1;`);
    });

    const rects = container.querySelectorAll('.node-rect');
    rects.forEach((rectEl, i) => {
      if (connectingNodes.includes(i)) return;
      const rect = rectEl as SVGRectElement;
      const height = Number(rect.getAttribute('height'));
      const y = Number(rect.getAttribute('y'));
      if (!height || isNaN(y)) return;
      rect.setAttribute('y', `${y - height / 2.75}`);
      rect.setAttribute('style', `width: ${height}px; height: ${height * 1.75}px; clip-path: polygon(100% 50%, 0 0, 0 100%); stroke-width: 0.5; stroke: rgb(255,255,255); stroke-opacity: 0.5; fill: ${GRADIENT_END}; fill-opacity: 1;`);
    });
  }

  async renderSankeyAsImage(phast: PHAST, settings: Settings, labelStyle = 'both'): Promise<string> {
    const results = this.sankeyService.getFuelTotals(phast, settings);
    const exothermicHeat = this.sankeyService.getExothermicHeat();
    const fuelEnergy = this.sankeyService.getFuelEnergy() ?? this.sankeyService.getChemicalEnergy();
    const electricalEnergy = this.sankeyService.getElectricalEnergy();

    const { sankeyData, layout, connectingNodes, orangeLinkPaths } =
      this.buildSankeyChartData(results, exothermicHeat, fuelEnergy, electricalEnergy, settings, labelStyle);

    return renderSankeyToImage(
      this.plotlyService, sankeyData, layout,
      container => this.applyGradientAndArrows(container, connectingNodes, orangeLinkPaths),
      1400, 500,
    );
  }
}

import { inject, Injectable } from '@angular/core';
import { PSAT, PsatOutputs } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

export interface PsatGraphData {
  name: string;
  energyInput: number;
  motorLoss: number;
  driveLoss: number;
  pumpLoss: number;
  usefulOutput: number;
}

const PIE_LABELS = ['Motor Losses', 'Drive Losses', 'Pump Losses', 'Useful Output'];
const PIE_COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'];
const BAR_LABELS = ['Energy Input', 'Motor Losses', 'Drive Losses', 'Pump Losses', 'Useful Output'];

@Injectable({ providedIn: 'root' })
export class PsatChartsService {
  private readonly convertUnitsService = inject(ConvertUnitsService);

  computeOutputGraphData(outputs: PsatOutputs, settings: Settings): Omit<PsatGraphData, 'name'> {
    let motorShaftPower = outputs.motor_shaft_power;
    let moverShaftPower = outputs.mover_shaft_power;
    if (settings.powerMeasurement === 'hp') {
      motorShaftPower = this.convertUnitsService.value(motorShaftPower).from('hp').to('kW');
      moverShaftPower = this.convertUnitsService.value(moverShaftPower).from('hp').to('kW');
    }
    const motorLoss = outputs.motor_power * (1 - outputs.motor_efficiency / 100);
    const driveLoss = motorShaftPower - moverShaftPower;
    const pumpLoss = (outputs.motor_power - motorLoss - driveLoss) * (1 - outputs.pump_efficiency / 100);
    const usefulOutput = outputs.motor_power - (motorLoss + driveLoss + pumpLoss);
    return { energyInput: outputs.motor_power, motorLoss, driveLoss, pumpLoss, usefulOutput };
  }

  collectGraphData(psat: PSAT, settings: Settings): PsatGraphData[] {
    const result: PsatGraphData[] = [];

    if (psat.outputs) {
      result.push({ name: psat.name ?? 'Baseline', ...this.computeOutputGraphData(psat.outputs, settings) });
    }

    psat.modifications?.forEach(m => {
      if (m.psat?.valid?.isValid && m.psat.outputs) {
        result.push({ name: m.psat.name ?? 'Modification', ...this.computeOutputGraphData(m.psat.outputs, settings) });
      }
    });

    return result;
  }

  buildEnergyDistributionChart(baseline: PsatGraphData, modification: PsatGraphData): { traces: any[]; layout: any } {
    return {
      traces: [baseline, modification].map((d, i) => ({
        values: [d.motorLoss, d.driveLoss, d.pumpLoss, d.usefulOutput],
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

  buildPowerComparisonChart(baseline: PsatGraphData, modification: PsatGraphData): { traces: any[]; layout: any } {
    return {
      traces: [baseline, modification].map(d => ({
        x: BAR_LABELS,
        y: [d.energyInput, d.motorLoss, d.driveLoss, d.pumpLoss, d.usefulOutput],
        name: d.name, type: 'bar',
        text: [d.energyInput, d.motorLoss, d.driveLoss, d.pumpLoss, d.usefulOutput].map(v => v.toFixed(2)),
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
}

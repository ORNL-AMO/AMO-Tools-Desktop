import { Component } from '@angular/core';
import { DiagramCalculatorRequest, DiagramCalculatorResult } from 'process-flow-lib';
import { Settings } from '../../models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { PumpImperialDefaults, PumpMetricDefaults, SteamImperialDefaults, SteamMetricDefaults } from '../../../settings/settings.service';

/**
 * Hosts MEASUR calculator modals requested from inside the process flow diagram (see process-flow-lib diagram-calculators).
 * Modals render here, outside the diagram's shadow DOM, and each request is settled when its modal saves or closes.
 * To add a calculator: add a @case for its id in the template that calls close() with the value to apply.
 */
@Component({
  selector: 'app-diagram-calculator-host',
  standalone: false,
  templateUrl: './diagram-calculator-host.component.html',
  styleUrl: './diagram-calculator-host.component.css',
})
export class DiagramCalculatorHostComponent {
  activeRequest: DiagramCalculatorRequest;
  settings: Settings;
  operatingHoursModalWidth: number = 400;
  private resolveActiveRequest: (result: DiagramCalculatorResult) => void;

  constructor(private settingsDbService: SettingsDbService) { }

  open(request: DiagramCalculatorRequest): Promise<DiagramCalculatorResult> {
    // * only one calculator open at a time - cancel any pending request
    this.close(undefined);
    this.settings = this.getCalculatorSettings(request.unitsOfMeasure);
    this.activeRequest = request;
    return new Promise<DiagramCalculatorResult>(resolve => this.resolveActiveRequest = resolve);
  }

  close(result: DiagramCalculatorResult) {
    if (this.resolveActiveRequest) {
      this.resolveActiveRequest(result);
      this.resolveActiveRequest = undefined;
    }
    this.activeRequest = undefined;
  }

  /**
   * Diagram units can differ from global settings - align the unit fields calculators read so their inputs match the diagram
   */
  getCalculatorSettings(unitsOfMeasure: string): Settings {
    const settings: Settings = { ...this.settingsDbService.globalSettings };
    if (unitsOfMeasure === 'Imperial' || unitsOfMeasure === 'Metric') {
      const isImperial = unitsOfMeasure === 'Imperial';
      settings.unitsOfMeasure = unitsOfMeasure;
      settings.temperatureMeasurement = isImperial ? PumpImperialDefaults.temperatureMeasurement : PumpMetricDefaults.temperatureMeasurement;
      settings.steamTemperatureMeasurement = isImperial ? SteamImperialDefaults.steamTemperatureMeasurement : SteamMetricDefaults.steamTemperatureMeasurement;
    }
    return settings;
  }
}

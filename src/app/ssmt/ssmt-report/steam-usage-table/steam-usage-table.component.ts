import { Component, OnInit, Input } from '@angular/core';
import { ProcessSteamUsage, HeaderOutputObj } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-steam-usage-table',
  templateUrl: './steam-usage-table.component.html',
  styleUrls: ['./steam-usage-table.component.css']
})
export class SteamUsageTableComponent implements OnInit {
  @Input()
  calculatedHeader: HeaderOutputObj;
  @Input()
  headerSteamUsage: number;
  @Input()
  name: string;

  processSteamUsage: ProcessSteamUsage;

  constructor() { }

  ngOnInit() {
  }


  ngOnChanges() {
    if (this.calculatedHeader) {
      let processSteamUsageEnergyFlow: number = this.headerSteamUsage * this.calculatedHeader.specificEnthalpy / 1000;
      //TODO: Calculate processUsage
      this.processSteamUsage = {
        pressure: this.calculatedHeader.pressure,
        temperature: this.calculatedHeader.temperature,
        energyFlow: processSteamUsageEnergyFlow,
        massFlow: this.headerSteamUsage,
        processUsage: 0
      };
    }
  }
}

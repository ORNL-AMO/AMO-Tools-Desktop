import { Component, OnInit, Input } from '@angular/core';
import { HeaderOutputObj, ProcessSteamUsage, SteamPropertiesOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-header-diagram',
  templateUrl: './header-diagram.component.html',
  styleUrls: ['./header-diagram.component.css']
})
export class HeaderDiagramComponent implements OnInit {
  @Input()
  header: HeaderOutputObj;
  @Input()
  pressureLevel: string;
  @Input()
  headerSteamUsage: number;
  @Input()
  condensate: SteamPropertiesOutput;

  steamUsage: ProcessSteamUsage;

  constructor() { }

  ngOnInit() {
    let processSteamUsageEnergyFlow: number = this.headerSteamUsage * this.header.specificEnthalpy / 1000;
    //TODO: Calculate processUsage
    this.steamUsage = {
      pressure: this.header.pressure,
      temperature: this.header.temperature,
      energyFlow: processSteamUsageEnergyFlow,
      massFlow: this.header.massFlow,
      processUsage: 0
    };
  }

}

import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
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
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();


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

  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  hoverCondensate() {
    this.emitSetHover.emit('condensateHovered');
  }

  hoverHeader() {
    this.emitSetHover.emit(this.pressureLevel+'Hovered');
  }

  hoverProcessUsage() {
    this.emitSetHover.emit(this.pressureLevel+'ProcessSteamHovered');
  }
}

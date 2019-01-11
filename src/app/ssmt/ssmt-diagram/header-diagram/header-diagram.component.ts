import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { HeaderOutputObj, ProcessSteamUsage, SteamPropertiesOutput } from '../../../shared/models/steam/steam-outputs';
import { HeaderWithHighestPressure, HeaderNotHighestPressure } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

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
  @Input()
  settings: Settings;

  steamUsage: ProcessSteamUsage;

  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    let processSteamUsageEnergyFlow: number = this.headerSteamUsage * this.header.specificEnthalpy / 1000;

    let processUsage: number = (this.headerSteamUsage) * (this.header.specificEnthalpy - this.condensate.specificEnthalpy);
    processUsage = this.convertUnitsService.value(processUsage).from(this.settings.steamMassFlowMeasurement).to('kg');
    processUsage = this.convertUnitsService.value(processUsage).from(this.settings.steamSpecificEnthalpyMeasurement).to('kJkg');
    processUsage = this.convertUnitsService.value(processUsage).from('kJ').to(this.settings.steamEnergyMeasurement);

    //TODO: Calculate processUsage
    this.steamUsage = {
      pressure: this.header.pressure,
      temperature: this.header.temperature,
      energyFlow: processSteamUsageEnergyFlow,
      massFlow: this.headerSteamUsage,
      processUsage: processUsage
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

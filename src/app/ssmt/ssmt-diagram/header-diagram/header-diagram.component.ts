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
  steamUsage: ProcessSteamUsage;
  @Input()
  condensate: SteamPropertiesOutput;
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  ventedLowPressureSteam: SteamPropertiesOutput;
  constructor() { }

  ngOnInit() {
  }

  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  hoverCondensate() {
    this.emitSetHover.emit(this.pressureLevel+'CondensateHovered');
  }

  hoverHeader() {
    this.emitSetHover.emit(this.pressureLevel+'Hovered');
  }

  hoverProcessUsage() {
    this.emitSetHover.emit(this.pressureLevel+'ProcessSteamHovered');
  }

  hoverProcessUsageInlet(){
    this.emitSetHover.emit(this.pressureLevel+'ProcessSteamInletHovered');
  }
}

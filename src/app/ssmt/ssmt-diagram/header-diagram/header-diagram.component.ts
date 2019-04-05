import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { HeaderOutputObj, ProcessSteamUsage, SteamPropertiesOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

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

  steamClasses: Array<string>;
  condensateClasses: Array<string>;
  pressureClasses: Array<string>;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(){
    this.setClasses();
  }

  setClasses() {
    this.steamClasses = [this.pressureLevel];
    this.pressureClasses = [this.pressureLevel];
    if (this.steamUsage.massFlow < 1e-3) {
      this.steamClasses = ['no-steam-flow'];
    }
    this.condensateClasses = ['condensate'];
    if(this.condensate.massFlow < 1e-3){
      this.condensateClasses = ['no-steam-flow'];
    }

    if(this.header.massFlow < 1e-3){
      this.pressureClasses.push('noSteamFlow');
    }

  }

  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  hoverCondensate() {
    this.emitSetHover.emit(this.pressureLevel + 'CondensateHovered');
  }

  hoverHeader() {
    this.emitSetHover.emit(this.pressureLevel + 'Hovered');
  }

  hoverProcessUsage() {
    this.emitSetHover.emit(this.pressureLevel + 'ProcessSteamHovered');
  }

  hoverProcessUsageInlet() {
    this.emitSetHover.emit(this.pressureLevel + 'ProcessSteamInletHovered');
  }
}

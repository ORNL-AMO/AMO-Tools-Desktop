import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SteamPropertiesOutput, ProcessSteamUsage } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-header-diagram',
    templateUrl: './header-diagram.component.html',
    styleUrls: ['./header-diagram.component.css'],
    standalone: false
})
export class HeaderDiagramComponent implements OnInit {
  @Input()
  header: SteamPropertiesOutput;
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
  @Output('emitSelectEquipment')
  emitSelectEquipment = new EventEmitter<string>();

  steamClasses: Array<string>;
  condensateClasses: Array<string>;
  pressureClasses: Array<string>;
  condensingWarning: boolean;
  showVentedSteam: boolean = false;
  constructor() { }

  ngOnInit() {

  }

  ngOnChanges() {
    this.setClasses();
    this.checkWarnings();
    if (this.ventedLowPressureSteam != undefined && isNaN(this.ventedLowPressureSteam.massFlow) == false && this.ventedLowPressureSteam.massFlow != 0) {
      this.showVentedSteam = true;
    } else {
      this.showVentedSteam = false;
    }
  }

  setClasses() {
    this.steamClasses = [this.pressureLevel];
    this.pressureClasses = [this.pressureLevel];
    if (this.steamUsage.massFlow < 1e-3) {
      this.steamClasses = ['no-steam-flow'];
    }
    this.condensateClasses = ['condensate'];
    if (this.condensate.massFlow < 1e-3) {
      this.condensateClasses = ['no-steam-flow'];
    }

    if (this.header.massFlow < 1e-3) {
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

  checkWarnings() {
    if (this.header.quality < 1) {
      this.condensingWarning = true;
    } else {
      this.condensingWarning = false;
    }
  }

  selectProcessUsage() {
    this.emitSelectEquipment.emit(this.pressureLevel + 'ProcessSteamHovered');
  }

  selectCondensate() {
    this.emitSelectEquipment.emit(this.pressureLevel + 'CondensateHovered');
  }

  selectHeader() {
    this.emitSelectEquipment.emit(this.pressureLevel + 'Hovered');
  }

  selectProcessUsageInlet() {
    this.emitSelectEquipment.emit(this.pressureLevel + 'ProcessSteamInletHovered');
  }
}

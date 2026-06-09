import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DeaeratorOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-deaerator-diagram',
    templateUrl: './deaerator-diagram.component.html',
    styleUrls: ['./deaerator-diagram.component.css'],
    standalone: false
})
export class DeaeratorDiagramComponent implements OnInit {
  @Input()
  deaerator: DeaeratorOutput;
  @Input()
  inletPressure: string;
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();
  @Output('emitSelectEquipment')
  emitSelectEquipment = new EventEmitter<string>();
  @Input()
  settings: Settings;

  ventClasses: Array<string>;
  feedwaterClasses: Array<string>;
  inletSteamClasses: Array<string>;
  deaeratorWarnings: boolean;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.setClasses();
    this.checkWarnings();
  }

  setClasses() {
    this.ventClasses = [];
    this.feedwaterClasses = [];
    this.inletSteamClasses = [this.inletPressure];
    if (this.deaerator.ventedSteamMassFlow < 1e-3) {
      this.ventClasses.push('no-steam-flow');
    }
    if (this.deaerator.feedwaterMassFlow < 1e-3) {
      this.feedwaterClasses.push('no-steam-flow');
    }
    if (this.deaerator.inletSteamMassFlow < 1e-3) {
      this.inletSteamClasses.push('no-steam-flow');
    }
  }

  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  hoverPressure() {
    if (this.inletPressure === 'high-pressure') {
      this.emitSetHover.emit('highPressureHovered');
    } else if (this.inletPressure === 'low-pressure') {
      this.emitSetHover.emit('lowPressureHovered');
    }
  }

  selectPressure() {
    if (this.inletPressure === 'high-pressure') {
      this.selectEquipment('highPressureHovered');
    } else if (this.inletPressure === 'low-pressure') {
      this.selectEquipment('lowPressureHovered');
    }
  }

  selectEquipment(str: string) {
    this.emitSelectEquipment.emit(str);
  }

  checkWarnings() {
    let energyWarning: boolean = this.checkEnergyWarning();
    let massFlowWarning: boolean = false;
    let inletEnthalpyWarning: boolean = false;
    let enthalpyFeedwaterWarning: boolean = false;
    if (this.deaerator.inletSteamMassFlow < 0 || this.deaerator.inletSteamMassFlow == 0) {
      massFlowWarning = true;
    }

    if (this.deaerator.inletSteamSpecificEnthalpy == this.deaerator.inletWaterSpecificEnthalpy) {
      inletEnthalpyWarning = true;
    } else if (this.deaerator.inletSteamSpecificEnthalpy < this.deaerator.inletWaterSpecificEnthalpy) {
      inletEnthalpyWarning = true;
    }

    if (this.deaerator.feedwaterSpecificEnthalpy > this.deaerator.inletWaterSpecificEnthalpy && this.deaerator.feedwaterSpecificEnthalpy > this.deaerator.inletSteamSpecificEnthalpy) {
      enthalpyFeedwaterWarning = true;

    }
    if (energyWarning || massFlowWarning || inletEnthalpyWarning || enthalpyFeedwaterWarning) {
      this.deaeratorWarnings = true;
    } else {
      this.deaeratorWarnings = false;
    }
  }

  checkEnergyWarning(): boolean {
    let energyIn: number = this.deaerator.inletSteamEnergyFlow + this.deaerator.inletWaterEnergyFlow;
    let energyOut: number = this.deaerator.feedwaterEnergyFlow + this.deaerator.ventedSteamEnergyFlow;
    if (energyIn - energyOut > (1e-7)) {
      return true;
    } else {
      return false;
    }
  }
}

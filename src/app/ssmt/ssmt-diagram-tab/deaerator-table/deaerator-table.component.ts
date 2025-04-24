import { Component, OnInit, Input, Output } from '@angular/core';
import { DeaeratorOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';
import { SsmtDiagramTabService } from '../ssmt-diagram-tab.service';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';

@Component({
    selector: 'app-deaerator-table',
    templateUrl: './deaerator-table.component.html',
    styleUrls: ['./deaerator-table.component.css'],
    standalone: false
})
export class DeaeratorTableComponent implements OnInit {
  @Input()
  deaerator: DeaeratorOutput;
  @Input()
  settings: Settings;
  @Input()
  inputData: SSMTInputs;


  notEnoughEnergyWarning: string;
  massFlowWarnings: string;
  inletEnthalpyWarning: string;
  enthalpyFeedwaterWarning: string;
  constructor(private ssmtDiagramTabService: SsmtDiagramTabService) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.checkWarnings();
  }

  goToCalculator() {
    this.ssmtDiagramTabService.setDeaeratorCalculator(this.deaerator, this.inputData);
  }

  checkWarnings() {
    this.notEnoughEnergyWarning = this.checkEnergyWarning();
    if (this.deaerator.inletSteamMassFlow < 0) {
      this.massFlowWarnings = 'Negative steam flow';
    } else if (this.deaerator.inletSteamMassFlow == 0) {
      this.massFlowWarnings = 'No mass flow';
    } else {
      this.massFlowWarnings = undefined;
    }

    if (this.deaerator.inletSteamSpecificEnthalpy == this.deaerator.inletWaterSpecificEnthalpy) {
      this.inletEnthalpyWarning = 'Steam and water specific enthalpy are equal';
    } else if (this.deaerator.inletSteamSpecificEnthalpy < this.deaerator.inletWaterSpecificEnthalpy) {
      this.inletEnthalpyWarning = 'Water specific enthalpy greater than steam.';
    } else {
      this.inletEnthalpyWarning = undefined;
    }

    if (this.deaerator.feedwaterSpecificEnthalpy > this.deaerator.inletWaterSpecificEnthalpy && this.deaerator.feedwaterSpecificEnthalpy > this.deaerator.inletSteamSpecificEnthalpy) {
      this.enthalpyFeedwaterWarning = 'Steam specific enthalpy too low for feedwater requirements';
    } else {
      this.enthalpyFeedwaterWarning = undefined;
    }
  }

  checkEnergyWarning(): string {
    let energyIn: number = this.deaerator.inletSteamEnergyFlow + this.deaerator.inletWaterEnergyFlow;
    let energyOut: number = this.deaerator.feedwaterEnergyFlow + this.deaerator.ventedSteamEnergyFlow;
    if (energyIn - energyOut > (1e-7)) {
      return 'Not enough energy to operate correctly';
    } else {
      return undefined;
    }
  }
}

import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasByMass, FlueGasByVolume } from '../../../../shared/models/phast/losses/flueGas';
import { LossTab } from '../../../tabs';
import { PhastService } from '../../../phast.service';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { FlueGasLossesService } from '../../../losses/flue-gas-losses/flue-gas-losses.service';

@Component({
  selector: 'app-explore-flue-gas-form',
  templateUrl: './explore-flue-gas-form.component.html',
  styleUrls: ['./explore-flue-gas-form.component.css']
})
export class ExploreFlueGasFormComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('changeTab')
  changeTab = new EventEmitter<LossTab>();


  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];

  baselineFlueGas: FlueGasByMass | FlueGasByVolume;
  modifiedFlueGas: FlueGasByMass | FlueGasByVolume;

  showExcessAir: boolean = false;
  showO2: boolean = false;

  baselineWarnings: { excessAirWarning: string, o2Warning: string };
  modificationWarnings: { excessAirWarning: string, o2Warning: string };
  constructor(private phastService: PhastService, private suiteDbService: SuiteDbService, private flueGasLossesService: FlueGasLossesService) { }

  ngOnInit() {
    this.initData();
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.phast.modifications[this.exploreModIndex].exploreOppsShowFlueGas = { hasOpportunity: false, display: 'Maintain Optimum Air/Fuel Ratio or Recommended O<sub>2</sub> Level in Flue Gas' }; 
        this.initData();
      }
    }
  }

  initData() {
    if (this.phast.losses.flueGasLosses[0].flueGasType === 'By Mass') {
      this.baselineFlueGas = this.phast.losses.flueGasLosses[0].flueGasByMass;
    } else {
      this.baselineFlueGas = this.phast.losses.flueGasLosses[0].flueGasByVolume;
    }
    if (this.phast.modifications[this.exploreModIndex].phast.losses.flueGasLosses[0].flueGasType === 'By Mass') {
      this.modifiedFlueGas = this.phast.modifications[this.exploreModIndex].phast.losses.flueGasLosses[0].flueGasByMass;
    } else {
      this.modifiedFlueGas = this.phast.modifications[this.exploreModIndex].phast.losses.flueGasLosses[0].flueGasByVolume;
    }
    this.checkBaselineWarnings(this.baselineFlueGas);
    this.checkModificationWarnings(this.modifiedFlueGas);
    this.initExcessAir();
    this.initO2();
    this.initAirTemp();
    this.initFlueGas();
  }

  initExcessAir() {
    if (this.baselineFlueGas.excessAirPercentage !== this.modifiedFlueGas.excessAirPercentage) {
      this.showExcessAir = true;
    } else {
      this.showExcessAir = false;
    }
  }

  initO2() {
    if (this.baselineFlueGas.o2InFlueGas !== this.modifiedFlueGas.o2InFlueGas) {
      this.showO2 = true;
    } else {
      this.showO2 = false;
    }
  }

  initAirTemp() {
    if (this.baselineFlueGas.combustionAirTemperature !== this.modifiedFlueGas.combustionAirTemperature) {
      this.phast.modifications[this.exploreModIndex].exploreOppsShowAirTemp = { hasOpportunity: true, display: 'Preheat Combustion Air' }; 
    } else {
      this.phast.modifications[this.exploreModIndex].exploreOppsShowAirTemp = { hasOpportunity: false, display: 'Preheat Combustion Air' }; 
    }
  }

  initFlueGas() {
    if (this.phast.modifications[this.exploreModIndex].exploreOppsShowAirTemp.hasOpportunity || this.showO2 || this.showExcessAir) {
      this.phast.modifications[this.exploreModIndex].exploreOppsShowFlueGas = { hasOpportunity: true, display: 'Maintain Optimum Air/Fuel Ratio or Recommended O<sub>2</sub> Level in Flue Gas' }; 
    } else {
      this.phast.modifications[this.exploreModIndex].exploreOppsShowFlueGas = { hasOpportunity: false, display: 'Maintain Optimum Air/Fuel Ratio or Recommended O<sub>2</sub> Level in Flue Gas' }; 
    }
  }

  toggleFlueGas() {
    if (this.phast.modifications[this.exploreModIndex].exploreOppsShowFlueGas.hasOpportunity === false) {
      this.phast.modifications[this.exploreModIndex].exploreOppsShowAirTemp = { hasOpportunity: false, display: 'Preheat Combustion Air' }; 
      this.showExcessAir = false;
      this.showO2 = false;
      this.toggleAirTemp();
      this.toggleExcessAir();
      this.toggleO2();
    }
  }

  toggleAirTemp() {
    if (this.phast.modifications[this.exploreModIndex].exploreOppsShowAirTemp.hasOpportunity === false) {
      this.modifiedFlueGas.combustionAirTemperature = this.baselineFlueGas.combustionAirTemperature;
      this.checkModificationWarnings(this.modifiedFlueGas);
    }
  }

  toggleExcessAir() {
    if (this.showExcessAir === false) {
      this.modifiedFlueGas.excessAirPercentage = this.baselineFlueGas.excessAirPercentage;
      this.checkModificationWarnings(this.modifiedFlueGas);
    }
  }

  toggleO2() {
    if (this.showO2 === false) {
      this.modifiedFlueGas.o2InFlueGas = this.baselineFlueGas.o2InFlueGas;
      this.checkModificationWarnings(this.modifiedFlueGas);
    }
  }

  changeMethod(num: number) {
    if (num === 1) {
      this.baselineFlueGas.o2InFlueGas = 0;
      this.baselineFlueGas.excessAirPercentage = 0;
      this.checkBaselineWarnings(this.baselineFlueGas);
    } else if (num === 2) {
      this.modifiedFlueGas.o2InFlueGas = 0;
      this.modifiedFlueGas.excessAirPercentage = 0;
      this.checkModificationWarnings(this.modifiedFlueGas);
    }
    this.calculate();
  }

  calculateExcessAir(loss: FlueGasByMass | FlueGasByVolume, num: number) {
    if (loss.o2InFlueGas < 0 || loss.o2InFlueGas > 20.99999) {
      loss.excessAirPercentage = 0.0;
    } else {
      let input = this.buildInput(loss);
      loss.excessAirPercentage = this.phastService.flueGasCalculateExcessAir(input);
    }
    if (num === 1) {
      this.checkBaselineWarnings(loss);
    } else {
      this.checkModificationWarnings(loss);
    }
  }

  calculateO2(loss: FlueGasByMass | FlueGasByVolume, num: number) {
    if (loss.excessAirPercentage < 0) {
      loss.o2InFlueGas = 0.0;
    } else {
      let input = this.buildInput(loss);
      loss.o2InFlueGas = this.phastService.flueGasCalculateO2(input);
    }
    if (num === 1) {
      this.checkBaselineWarnings(loss);
    } else {
      this.checkModificationWarnings(loss);
    }
  }

  checkWarnings(loss: FlueGasByMass | FlueGasByVolume): { excessAirWarning: string, o2Warning: string } {
    let tmpO2Warning: string = this.flueGasLossesService.checkO2Warning(loss);
    let tmpExcessAirWarning: string = this.flueGasLossesService.checkExcessAirWarning(loss);
    return { excessAirWarning: tmpExcessAirWarning, o2Warning: tmpO2Warning };
  }

  checkBaselineWarnings(loss: FlueGasByMass | FlueGasByVolume) {
    this.baselineWarnings = this.checkWarnings(loss);
    this.calculate();
  }

  checkModificationWarnings(loss: FlueGasByMass | FlueGasByVolume) {
    this.modificationWarnings = this.checkWarnings(loss);
    this.calculate();
  }

  buildInput(loss: FlueGasByMass | FlueGasByVolume) {
    let tmpFlueGas = this.suiteDbService.selectGasFlueGasMaterialById(loss.gasTypeId);
    let input = {
      CH4: tmpFlueGas.CH4,
      C2H6: tmpFlueGas.C2H6,
      N2: tmpFlueGas.N2,
      H2: tmpFlueGas.H2,
      C3H8: tmpFlueGas.C3H8,
      C4H10_CnH2n: tmpFlueGas.C4H10_CnH2n,
      H2O: tmpFlueGas.H2O,
      CO: tmpFlueGas.CO,
      CO2: tmpFlueGas.CO2,
      SO2: tmpFlueGas.SO2,
      O2: tmpFlueGas.O2,
      o2InFlueGas: loss.o2InFlueGas,
      excessAir: loss.excessAirPercentage
    };
    return input;
  }

  focusOut() {
    this.changeField.emit('default');
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
    this.changeTab.emit({
      tabName: 'Flue Gas',
      step: 1,
      componentStr: 'flue-gas-losses'
    });
  }

}

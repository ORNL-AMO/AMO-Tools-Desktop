import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasByMass, FlueGasByVolume } from '../../../../shared/models/phast/losses/flueGas';
import { LossTab } from '../../../tabs';
import { PhastService } from '../../../phast.service';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';

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

  showFlueGas: boolean = false;
  showExcessAir: boolean = false;
  showO2: boolean = false;
  showFuelTemp: boolean = false;
  showAirTemp: boolean = false;
  excessAirWarning1: string = null;
  excessAirWarning2: string = null;
  o2warning1: string = null;
  o2warning2: string = null;
  constructor(private phastService: PhastService, private suiteDbService: SuiteDbService) { }

  ngOnInit() {
    this.initData();
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.initData();
      }
    }
  }

  initData() {
    if (this.phast.losses.flueGasLosses[0].flueGasType == 'By Mass') {
      this.baselineFlueGas = this.phast.losses.flueGasLosses[0].flueGasByMass;
      this.modifiedFlueGas = this.phast.modifications[this.exploreModIndex].phast.losses.flueGasLosses[0].flueGasByMass;
    } else {
      this.baselineFlueGas = this.phast.losses.flueGasLosses[0].flueGasByVolume;
      this.modifiedFlueGas = this.phast.modifications[this.exploreModIndex].phast.losses.flueGasLosses[0].flueGasByVolume;
    }
    this.initFuelTemp();
    this.initExcessAir();
    this.initO2();
    this.initAirTemp();
    this.initFlueGas();
  }

  initFuelTemp() {
    if (this.baselineFlueGas.flueGasTemperature != this.modifiedFlueGas.flueGasTemperature) {
      this.showFuelTemp = true;
    } else {
      this.showFuelTemp = false;
    }
  }

  initExcessAir() {
    if (this.baselineFlueGas.excessAirPercentage != this.modifiedFlueGas.excessAirPercentage) {
      this.showExcessAir = true;
    } else {
      this.showExcessAir = false;
    }
  }

  initO2() {
    if (this.baselineFlueGas.o2InFlueGas != this.modifiedFlueGas.o2InFlueGas) {
      this.showO2 = true;
    } else {
      this.showO2 = false;
    }
  }

  initAirTemp() {
    if (this.baselineFlueGas.combustionAirTemperature != this.modifiedFlueGas.combustionAirTemperature) {
      this.showAirTemp = true;
    } else {
      this.showAirTemp = false;
    }
  }

  initFlueGas() {
    if (this.showAirTemp || this.showO2 || this.showExcessAir || this.showFuelTemp) {
      this.showFlueGas = true;
    } else {
      this.showFlueGas = false;
    }
  }

  toggleFlueGas() {
    if (this.showFlueGas == false) {
      this.showExcessAir = false;
      this.showAirTemp = false;
      this.showFuelTemp = false;
      this.showO2 = false;
      this.toggleAirTemp();
      this.toggleExcessAir();
      this.toggleFuelTemp();
      this.toggleO2();
    }
  }

  toggleAirTemp() {
    if (this.showAirTemp == false) {
      this.modifiedFlueGas.combustionAirTemperature = this.baselineFlueGas.combustionAirTemperature;
      this.calculate();
    }
  }

  toggleFuelTemp() {
    if (this.showFuelTemp == false) {
      this.modifiedFlueGas.flueGasTemperature = this.baselineFlueGas.flueGasTemperature;
      this.calculate();
    }
  }

  toggleExcessAir() {
    if (this.showExcessAir == false) {
      this.modifiedFlueGas.excessAirPercentage = this.baselineFlueGas.excessAirPercentage;
      this.calculate();
    }
  }

  toggleO2() {
    if (this.showO2 == false) {
      this.modifiedFlueGas.o2InFlueGas = this.baselineFlueGas.o2InFlueGas;
      this.calculate();
    }
  }


  changeMethod(num: number) {
    if (num == 1) {
      this.baselineFlueGas.o2InFlueGas = 0;
      this.baselineFlueGas.excessAirPercentage = 0;
    } else if (num == 2) {
      this.modifiedFlueGas.o2InFlueGas = 0;
      this.modifiedFlueGas.excessAirPercentage = 0;
    }
    this.excessAirWarning1 = null;
    this.excessAirWarning2 = null;
    this.o2warning1 = null;
    this.o2warning2 = null;
    this.calculate();
  }

  calculateExcessAir(loss: FlueGasByMass | FlueGasByVolume, num: number) {
    if (loss.o2InFlueGas < 0 || loss.o2InFlueGas > 20.99999) {
      loss.excessAirPercentage = 0.0;
      if (num == 1) {
        this.excessAirWarning1 = 'Oxygen levels in Flue Gas must be greater than or equal to 0 and less than 21 percent';
      } else if (num == 2) {
        this.excessAirWarning2 = 'Oxygen levels in Flue Gas must be greater than or equal to 0 and less than 21 percent';
      }
    } else {
      let input = this.buildInput(loss);
      loss.excessAirPercentage = this.phastService.flueGasCalculateExcessAir(input);
      if (num == 1) {
        this.excessAirWarning1 = null;
      } else if (num == 2) {
        this.excessAirWarning2 = null;
      }
    }
    this.calculate();
  }

  calculateO2(loss: FlueGasByMass | FlueGasByVolume, num: number) {
    if (loss.excessAirPercentage < 0) {
      loss.o2InFlueGas = 0.0;
      if (num == 1) {
        this.o2warning1 = 'Excess Air must be greater than 0 percent';
      } else if (num == 2) {
        this.o2warning2 = 'Excess Air must be greater than 0 percent';
      }
    } else {
      let input = this.buildInput(loss);
      loss.o2InFlueGas = this.phastService.flueGasCalculateO2(input);
      if (num == 1) {
        this.o2warning1 = null;
      } else if (num == 2) {
        this.o2warning2 = null;
      }
    }
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

  }

  calculate() {
    this.emitCalculate.emit(true)
  }

  focusField(str: string) {
    this.changeField.emit(str);
    this.changeTab.emit({
      tabName: 'Flue Gas',
      step: 1,
      componentStr: 'flue-gas-losses'
    })
  }

}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SuiteDbService } from '../../../../../suiteDb/suite-db.service';
import { LossesService } from '../../../../../phast/losses/losses.service';
import { PhastService } from '../../../../../phast/phast.service';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../../shared/models/settings';

@Component({
  selector: 'app-stack-loss-by-volume',
  templateUrl: './stack-loss-by-volume.component.html',
  styleUrls: ['./stack-loss-by-volume.component.css']
})
export class StackLossByVolumeComponent implements OnInit {
  @Input()
  stackLossForm: FormGroup;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<FormGroup>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  
  options: any;
  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];
  calculationExcessAir = 0.0;
  calculationFlueGasO2 = 0.0;
  calculationWarning: string = null;
  combustionAirTempWarning: string = null;
  
  calcMethodExcessAir: boolean;
  constructor(private suiteDbService: SuiteDbService, private lossesService: LossesService, private phastService: PhastService) { }

  ngOnInit() {
    this.options = this.suiteDbService.selectGasFlueGasMaterials();
    if (this.stackLossForm) {
      if (this.stackLossForm.controls.gasTypeId.value && this.stackLossForm.controls.gasTypeId.value != '') {
        if (this.stackLossForm.controls.CH4.value == '' || !this.stackLossForm.controls.CH4.value) {
          this.setProperties();
        }
      }
    }
    //this.setCalcMethod();
  }
  focusOut() {
    this.changeField.emit('default');
  }
  focusField(str: string) {
    this.changeField.emit(str);
  }
  calcExcessAir() {
    let input = {
      CH4: this.stackLossForm.controls.CH4.value,
      C2H6: this.stackLossForm.controls.C2H6.value,
      N2: this.stackLossForm.controls.N2.value,
      H2: this.stackLossForm.controls.H2.value,
      C3H8: this.stackLossForm.controls.C3H8.value,
      C4H10_CnH2n: this.stackLossForm.controls.C4H10_CnH2n.value,
      H2O: this.stackLossForm.controls.H2O.value,
      CO: this.stackLossForm.controls.CO.value,
      CO2: this.stackLossForm.controls.CO2.value,
      SO2: this.stackLossForm.controls.SO2.value,
      O2: this.stackLossForm.controls.O2.value,
      o2InFlueGas: this.stackLossForm.controls.o2InFlueGas.value,
      excessAir: this.stackLossForm.controls.excessAirPercentage.value
    };
    this.calculationWarning = null;
    this.combustionAirTempWarning = null;

    if (this.stackLossForm.controls.combustionAirTemperature.value > this.stackLossForm.controls.flueGasTemperature.value) {
      this.combustionAirTempWarning = "Combustion air temperature must be less than flue gas temperature";
    }
    else {
      this.combustionAirTempWarning = null;
    }

    if (!this.calcMethodExcessAir) {
      if (input.o2InFlueGas < 0 || input.o2InFlueGas > 20.99999) {
        this.calculationExcessAir = 0.0;
        this.calculationWarning = 'Oxygen levels in Flue Gas must be greater than or equal to 0 and less than 21 percent';
      } else {
        this.calculationExcessAir = this.phastService.flueGasCalculateExcessAir(input);
      }
      this.stackLossForm.patchValue({
        excessAirPercentage: this.calculationExcessAir
      });
    }
    else {
      if (input.excessAir < 0) {
        this.calculationFlueGasO2 = 0.0;
        this.calculationWarning = 'Excess Air must be greater than 0 percent';
      } else {
        this.calculationFlueGasO2 = this.phastService.flueGasCalculateO2(input);
      }
      this.stackLossForm.patchValue({
        o2InFlueGas: this.calculationFlueGasO2
      });
    }
    this.calculate();
  }

  setProperties() {
    let tmpFlueGas = this.suiteDbService.selectGasFlueGasMaterialById(this.stackLossForm.controls.gasTypeId.value);
    this.stackLossForm.patchValue({
      CH4: this.roundVal(tmpFlueGas.CH4, 4),
      C2H6: this.roundVal(tmpFlueGas.C2H6, 4),
      N2: this.roundVal(tmpFlueGas.N2, 4),
      H2: this.roundVal(tmpFlueGas.H2, 4),
      C3H8: this.roundVal(tmpFlueGas.C3H8, 4),
      C4H10_CnH2n: this.roundVal(tmpFlueGas.C4H10_CnH2n, 4),
      H2O: this.roundVal(tmpFlueGas.H2O, 4),
      CO: this.roundVal(tmpFlueGas.CO, 4),
      CO2: this.roundVal(tmpFlueGas.CO2, 4),
      SO2: this.roundVal(tmpFlueGas.SO2, 4),
      O2: this.roundVal(tmpFlueGas.O2, 4)
    });
    this.calculate();
  }
  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  calculate(){
    this.emitCalculate.emit(this.stackLossForm);
  }

  setFuelTemp(){
    this.stackLossForm.patchValue({
      fuelTemperature: this.stackLossForm.controls.combustionAirTemperature.value
    })
    this.calculate();
  }

  changeMethod() {
    this.stackLossForm.patchValue({
      o2InFlueGas: 0,
      excessAirPercentage: 0
    });
    this.setCalcMethod();
  }

  setCalcMethod() {
    if (this.stackLossForm.controls.oxygenCalculationMethod.value == 'Excess Air') {
      this.calcMethodExcessAir = true;
    } else {
      this.calcMethodExcessAir = false;
    }
    this.calcExcessAir();
  }

}

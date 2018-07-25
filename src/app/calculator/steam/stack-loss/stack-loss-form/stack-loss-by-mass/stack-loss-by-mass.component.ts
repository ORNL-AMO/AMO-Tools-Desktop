import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../../shared/models/settings';
import { SuiteDbService } from '../../../../../suiteDb/suite-db.service';
import { PhastService } from '../../../../../phast/phast.service';

@Component({
  selector: 'app-stack-loss-by-mass',
  templateUrl: './stack-loss-by-mass.component.html',
  styleUrls: ['./stack-loss-by-mass.component.css']
})
export class StackLossByMassComponent implements OnInit {
  @Input()
  stackLossForm: FormGroup;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<FormGroup>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;

  moistureInAirCompositionError: string = null;
  unburnedCarbonInAshError: string = null;
  combustionAirTempWarning: string = null;
  options: any;
  showModal: boolean = false;

  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];

  calculationExcessAir = 0.0;
  calculationFlueGasO2 = 0.0;
  calculationWarning: string = null;
  calcMethodExcessAir: boolean;


  constructor(private suiteDbService: SuiteDbService,
    private phastService: PhastService) { }


  ngOnInit() {
    this.options = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    if (this.stackLossForm) {
      if (this.stackLossForm.controls.gasTypeId.value && this.stackLossForm.controls.gasTypeId.value != '') {
        if (this.stackLossForm.controls.carbon.value == '') {
          this.setProperties();
        }
      }
    }
    this.setCalcMethod();
  }
  focusOut() {
    this.changeField.emit('default');
  }
  focusField(str: string) {
    this.changeField.emit(str);
  }

  calcExcessAir() {
    let input = {
      carbon: this.stackLossForm.controls.carbon.value,
      hydrogen: this.stackLossForm.controls.hydrogen.value,
      sulphur: this.stackLossForm.controls.sulphur.value,
      inertAsh: this.stackLossForm.controls.inertAsh.value,
      o2: this.stackLossForm.controls.o2.value,
      moisture: this.stackLossForm.controls.moisture.value,
      nitrogen: this.stackLossForm.controls.nitrogen.value,
      moistureInAirCombustion: this.stackLossForm.controls.moistureInAirComposition.value,
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
        this.calculationExcessAir = this.phastService.flueGasByMassCalculateExcessAir(input);
      }
      this.stackLossForm.patchValue({
        excessAirPercentage: this.calculationExcessAir
      });
    } else {
      if (input.excessAir < 0) {
        this.calculationFlueGasO2 = 0.0;

        this.calculationWarning = 'Excess Air must be greater than 0 percent';
      } else {
        this.calculationFlueGasO2 = this.phastService.flueGasByMassCalculateO2(input);
      }
      this.stackLossForm.patchValue({
        o2InFlueGas: this.calculationFlueGasO2
      });
      this.calculate();
    }
  }

  setProperties() {
    let tmpFlueGas = this.suiteDbService.selectSolidLiquidFlueGasMaterialById(this.stackLossForm.controls.gasTypeId.value);
    this.stackLossForm.patchValue({
      carbon: this.roundVal(tmpFlueGas.carbon, 4),
      hydrogen: this.roundVal(tmpFlueGas.hydrogen, 4),
      sulphur: this.roundVal(tmpFlueGas.sulphur, 4),
      inertAsh: this.roundVal(tmpFlueGas.inertAsh, 4),
      o2: this.roundVal(tmpFlueGas.o2, 4),
      moisture: this.roundVal(tmpFlueGas.moisture, 4),
      nitrogen: this.roundVal(tmpFlueGas.nitrogen, 4)
    });
    this.checkInputError();
  }

  checkInputError(bool?: boolean) {
    if (this.stackLossForm.controls.moistureInAirComposition.value < 0 || this.stackLossForm.controls.moistureInAirComposition.value > 100) {
      this.moistureInAirCompositionError = 'Moisture in Combustion Air must be equal or greater than 0 and less than or equal to 100%';
    } else {
      this.moistureInAirCompositionError = null;
    }
    if (this.stackLossForm.controls.unburnedCarbonInAsh.value < 0 || this.stackLossForm.controls.unburnedCarbonInAsh.value > 100) {
      this.unburnedCarbonInAshError = 'Unburned Carbon in Ash must be equal or greater than 0 and less than or equal to 100%';
    } else {
      this.unburnedCarbonInAshError = null;    }

  }

  calculate(){
    this.emitCalculate.emit(this.stackLossForm);
  }

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
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

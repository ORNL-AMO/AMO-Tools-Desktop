import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { PhastService } from '../../../../../phast/phast.service';
import { FormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { ModalDirective } from 'ngx-bootstrap';
import { StackLossService } from '../../stack-loss.service';
import { FlueGasMaterial } from '../../../../../shared/models/materials';
import { MaterialInputProperties } from '../../../../../shared/models/phast/losses/flueGas';
import { SqlDbApiService } from '../../../../../tools-suite-api/sql-db-api.service';

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
  @Input()
  inModal: boolean;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;

  options: Array<FlueGasMaterial>;
  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];
  calculationExcessAir: number = 0.0;
  calculationFlueGasO2: number = 0.0;
  calcMethodExcessAir: boolean;
  stackTemperatureWarning: boolean = false;
  tempMin: number;

  constructor(private sqlDbApiService: SqlDbApiService, private stackLossService: StackLossService, private phastService: PhastService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.options = this.sqlDbApiService.selectGasFlueGasMaterials();
    if (this.stackLossForm) {
      if (this.stackLossForm.controls.gasTypeId.value && this.stackLossForm.controls.gasTypeId.value !== '') {
        if (this.stackLossForm.controls.CH4.value === '' || !this.stackLossForm.controls.CH4.value) {
          this.setProperties();
        }
      }
    }
    this.setCalcMethod();
    this.setCombustionValidation();
    this.setFuelTempValidation();
    this.tempMin = 212;
    this.tempMin = this.convertUnitsService.value(this.tempMin).from('F').to(this.settings.steamTemperatureMeasurement);
    this.tempMin = this.convertUnitsService.roundVal(this.tempMin, 1);
    this.checkStackLossTemp();
  }

  focusOut() {
    this.changeField.emit('default');
  }
  focusField(str: string) {
    this.changeField.emit(str);
  }

  showMaterialModal() {
    this.stackLossService.modalOpen.next(true);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.options = this.sqlDbApiService.selectGasFlueGasMaterials();
      let newMaterial = this.options.filter(material => { return material.substance === event.substance; });
      if (newMaterial.length !== 0) {
        this.stackLossForm.patchValue({
          gasTypeId: newMaterial[0].id
        });
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.stackLossService.modalOpen.next(false);
    this.calculate();
  }

  setCombustionValidation() {
    this.stackLossForm.controls.combustionAirTemperature.setValidators([Validators.required, Validators.max(this.stackLossForm.controls.flueGasTemperature.value)]);
    this.stackLossForm.controls.combustionAirTemperature.reset(this.stackLossForm.controls.combustionAirTemperature.value);
    if (this.stackLossForm.controls.combustionAirTemperature.value) {
      this.stackLossForm.controls.combustionAirTemperature.markAsDirty();
    }
    this.calculate();
  }

  setFuelTempValidation() {
    this.stackLossForm.controls.flueGasTemperature.setValidators([Validators.required, Validators.min(this.stackLossForm.controls.combustionAirTemperature.value)]);
    this.stackLossForm.controls.flueGasTemperature.reset(this.stackLossForm.controls.flueGasTemperature.value);
    if (this.stackLossForm.controls.flueGasTemperature.value) {
      this.stackLossForm.controls.flueGasTemperature.markAsDirty();
    }
    this.calculate();
  }

  calcExcessAir() {
    if (!this.calcMethodExcessAir) {
        this.stackLossForm.patchValue({
          excessAirPercentage: 0,
        });
    }

    if (this.calcMethodExcessAir) {
        this.stackLossForm.patchValue({
          o2InFlueGas: 0,
        });
    }
    this.calculate();
  }

  setProperties() {
    let tmpFlueGas: FlueGasMaterial = this.sqlDbApiService.selectGasFlueGasMaterialById(this.stackLossForm.controls.gasTypeId.value);
    if (tmpFlueGas) {
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
    }
    this.calculate();
  }
  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  calculate() {
    this.checkStackLossTemp();
    this.emitCalculate.emit(this.stackLossForm);
  }

  setFuelTemp() {
    this.stackLossForm.patchValue({
      fuelTemperature: this.stackLossForm.controls.combustionAirTemperature.value
    });
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
    if (this.stackLossForm.controls.oxygenCalculationMethod.value === 'Excess Air') {
      this.calcMethodExcessAir = true;
    } else {
      this.calcMethodExcessAir = false;
    }
    this.calcExcessAir();
  }

  checkStackLossTemp() {
    if (this.stackLossForm.controls.flueGasTemperature.value && this.stackLossForm.controls.flueGasTemperature.value < this.tempMin) {
      this.stackTemperatureWarning = true;
    } else {
      this.stackTemperatureWarning = false;
    }
  }

}

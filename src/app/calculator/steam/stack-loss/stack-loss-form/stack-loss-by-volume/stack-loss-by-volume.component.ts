import { Component, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { PhastService } from '../../../../../phast/phast.service';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { StackLossService } from '../../stack-loss.service';
import { FlueGasMaterial } from '../../../../../shared/models/materials';
import { SqlDbApiService } from '../../../../../tools-suite-api/sql-db-api.service';
import { FlueGasMaterialDbService } from '../../../../../indexedDb/flue-gas-material-db.service';
import { firstValueFrom } from 'rxjs';
import { roundVal } from '../../../../../shared/helperFunctions';

@Component({
    selector: 'app-stack-loss-by-volume',
    templateUrl: './stack-loss-by-volume.component.html',
    styleUrls: ['./stack-loss-by-volume.component.css'],
    standalone: false
})
export class StackLossByVolumeComponent implements OnChanges {
  @Input()
  stackLossForm: UntypedFormGroup;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<UntypedFormGroup>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  inModal: boolean;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;

  options: Array<FlueGasMaterial> = [];
  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];
  calculationExcessAir: number = 0.0;
  calculationFlueGasO2: number = 0.0;
  calcMethodExcessAir: boolean;
  stackTemperatureWarning: boolean = false;
  tempMin: number;

  constructor(private flueGasMaterialDbService: FlueGasMaterialDbService, private stackLossService: StackLossService, private phastService: PhastService, private convertUnitsService: ConvertUnitsService) { }

  ngOnChanges(changes: SimpleChanges) {
    this.setOptions();
    this.setCalcMethod();
    this.setCombustionValidation();
    this.setFuelTempValidation();
    this.tempMin = 212;
    this.tempMin = this.convertUnitsService.value(this.tempMin).from('F').to(this.settings.steamTemperatureMeasurement);
    this.tempMin = this.convertUnitsService.roundVal(this.tempMin, 1);
    this.checkStackLossTemp();
  }

  setOptions(){
    this.options = this.flueGasMaterialDbService.getAllMaterials();
    if (this.stackLossForm) {
      if (this.stackLossForm.controls.gasTypeId.value && this.stackLossForm.controls.gasTypeId.value !== '') {
        if (this.stackLossForm.controls.CH4.value === '' || !this.stackLossForm.controls.CH4.value) {
          this.setProperties();
        }
      }
    }
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

  async hideMaterialModal(event?: any) {
    if (event) {
      await this.setOptions();
      let newMaterial = this.options.find(material => { return material.substance === event.substance; });
      if (newMaterial) {
        this.stackLossForm.patchValue({
          gasTypeId: newMaterial.id
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
    let tmpFlueGas: FlueGasMaterial = this.options.find(option => option.id === this.stackLossForm.controls.gasTypeId.value);
    if (tmpFlueGas) {
      this.stackLossForm.patchValue({
        CH4: roundVal(tmpFlueGas.CH4, 4),
        C2H6: roundVal(tmpFlueGas.C2H6, 4),
        N2: roundVal(tmpFlueGas.N2, 4),
        H2: roundVal(tmpFlueGas.H2, 4),
        C3H8: roundVal(tmpFlueGas.C3H8, 4),
        C4H10_CnH2n: roundVal(tmpFlueGas.C4H10_CnH2n, 4),
        H2O: roundVal(tmpFlueGas.H2O, 4),
        CO: roundVal(tmpFlueGas.CO, 4),
        CO2: roundVal(tmpFlueGas.CO2, 4),
        SO2: roundVal(tmpFlueGas.SO2, 4),
        O2: roundVal(tmpFlueGas.O2, 4)
      });
    }
    this.calculate();
  }

  calculate() {
    this.stackLossForm.patchValue({
      fuelTemperature: this.stackLossForm.controls.ambientAirTemp.value,
      combustionAirTemperature: this.stackLossForm.controls.ambientAirTemp.value
    });
    this.checkStackLossTemp();
    this.emitCalculate.emit(this.stackLossForm);
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

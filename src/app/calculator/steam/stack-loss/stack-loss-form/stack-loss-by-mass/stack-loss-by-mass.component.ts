import { Component, Input, EventEmitter, Output, ViewChild, SimpleChanges, ChangeDetectorRef, OnChanges } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../../shared/models/settings';
import { PhastService } from '../../../../../phast/phast.service';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { StackLossService } from '../../stack-loss.service';
import { SolidLiquidFlueGasMaterial } from '../../../../../shared/models/materials';
import { MaterialInputProperties } from '../../../../../shared/models/phast/losses/flueGas';
import { SqlDbApiService } from '../../../../../tools-suite-api/sql-db-api.service';
import { SolidLiquidMaterialDbService } from '../../../../../indexedDb/solid-liquid-material-db.service';
import { roundVal } from '../../../../../shared/helperFunctions';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stack-loss-by-mass',
  templateUrl: './stack-loss-by-mass.component.html',
  styleUrls: ['./stack-loss-by-mass.component.css'],
  standalone: false
})
export class StackLossByMassComponent implements OnChanges {
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


  options: Array<SolidLiquidFlueGasMaterial>;
  optionsSub: Subscription;

  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];

  calculationExcessAir: number = 0.0;
  calculationFlueGasO2: number = 0.0;
  calcMethodExcessAir: boolean;
  stackTemperatureWarning: boolean = false;
  tempMin: number;

  constructor(
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService,
    private phastService: PhastService,
    private convertUnitsService: ConvertUnitsService,
    private stackLossService: StackLossService) { }


  ngOnChanges() {
    this.optionsSub = this.solidLiquidMaterialDbService.dbSolidLiquidFlueGasMaterials.subscribe(val => {
      this.options = val;
    });
    if (this.stackLossForm) {
      if (this.stackLossForm.controls.gasTypeId.value && this.stackLossForm.controls.gasTypeId.value !== '') {
        if (this.stackLossForm.controls.carbon.value === '') {
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

  ngOnDestroy(){
    this.optionsSub.unsubscribe();
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
      let newMaterial: SolidLiquidFlueGasMaterial = this.options.find(material => { return material.substance === event.substance; });
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
    let input: MaterialInputProperties = {
      carbon: this.stackLossForm.controls.carbon.value,
      hydrogen: this.stackLossForm.controls.hydrogen.value,
      sulphur: this.stackLossForm.controls.sulphur.value,
      inertAsh: this.stackLossForm.controls.inertAsh.value,
      o2: this.stackLossForm.controls.o2.value,
      moisture: this.stackLossForm.controls.moisture.value,
      nitrogen: this.stackLossForm.controls.nitrogen.value,
      moistureInAirCombustion: this.stackLossForm.controls.moistureInAirCombustion.value,
      o2InFlueGas: this.stackLossForm.controls.o2InFlueGas.value,
      excessAir: this.stackLossForm.controls.excessAirPercentage.value
    };

    if (!this.calcMethodExcessAir) {
      if (this.stackLossForm.controls.o2InFlueGas.status === 'VALID') {
        this.calculationExcessAir = this.phastService.flueGasByMassCalculateExcessAir(input);
        this.stackLossForm.patchValue({
          excessAirPercentage: this.calculationExcessAir
        });
      } else {
        this.calculationExcessAir = 0;
        this.stackLossForm.patchValue({
          excessAirPercentage: this.calculationExcessAir
        });
      }
    }

    if (this.calcMethodExcessAir) {
      if (this.stackLossForm.controls.excessAirPercentage.status === 'VALID') {
        this.calculationFlueGasO2 = this.phastService.flueGasByMassCalculateO2(input);
        this.stackLossForm.patchValue({
          o2InFlueGas: this.calculationFlueGasO2
        });
      } else {
        this.calculationFlueGasO2 = 0;
        this.stackLossForm.patchValue({
          o2InFlueGas: this.calculationFlueGasO2
        });
      }
    }
    this.calculate();
  }

  setProperties() {
    let tmpFlueGas: SolidLiquidFlueGasMaterial = this.solidLiquidMaterialDbService.getById(this.stackLossForm.controls.gasTypeId.value);
    if (tmpFlueGas) {
      this.stackLossForm.patchValue({
        carbon: roundVal(tmpFlueGas.carbon, 4),
        hydrogen: roundVal(tmpFlueGas.hydrogen, 4),
        sulphur: roundVal(tmpFlueGas.sulphur, 4),
        inertAsh: roundVal(tmpFlueGas.inertAsh, 4),
        o2: roundVal(tmpFlueGas.o2, 4),
        moisture: roundVal(tmpFlueGas.moisture, 4),
        nitrogen: roundVal(tmpFlueGas.nitrogen, 4)
      });
    }
  }
  calculate() {
    this.stackLossForm.controls.combustionAirTemperature.patchValue(this.stackLossForm.controls.ambientAirTemp.value);
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

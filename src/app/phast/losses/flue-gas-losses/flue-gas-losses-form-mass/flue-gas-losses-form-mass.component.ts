import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { FlueGasCompareService } from "../flue-gas-compare.service";
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { PhastService } from "../../../phast.service";
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-flue-gas-losses-form-mass',
  templateUrl: './flue-gas-losses-form-mass.component.html',
  styleUrls: ['./flue-gas-losses-form-mass.component.css']
})
export class FlueGasLossesFormMassComponent implements OnInit {
  @Input()
  flueGasLossForm: FormGroup;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  lossIndex: number;
  @Input()
  settings: Settings;
  @Output('inputError')
  inputError = new EventEmitter<boolean>();

  @ViewChild('materialModal') public materialModal: ModalDirective;

  moistureInAirCompositionError: string = null;
  unburnedCarbonInAshError: string = null;
  firstChange: boolean = true;
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

  constructor(private suiteDbService: SuiteDbService, private flueGasCompareService: FlueGasCompareService,
    private lossesService: LossesService, private phastService: PhastService) { }

  ngOnInit() {
    this.options = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    if (this.flueGasLossForm) {
      if (this.flueGasLossForm.controls.gasTypeId.value && this.flueGasLossForm.controls.gasTypeId.value != '') {
        if (this.flueGasLossForm.controls.carbon.value == '') {
          this.setProperties();
        }
      }
    }
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.setCalcMethod();
    this.checkInputError(true);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (!this.baselineSelected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    } else {
      this.firstChange = false;
    }
  }

  focusOut() {
    this.changeField.emit('default');
  }
  disableForm() {
    this.flueGasLossForm.controls.gasTypeId.disable();
    this.flueGasLossForm.controls.oxygenCalculationMethod.disable();
    // this.flueGasLossForm.disable();
  }

  enableForm() {
    this.flueGasLossForm.controls.gasTypeId.enable();
    this.flueGasLossForm.controls.oxygenCalculationMethod.enable();
    // this.flueGasLossForm.enable();
  }

  checkForm() {
    this.calcExcessAir();
    this.calculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  changeMethod() {
    this.flueGasLossForm.patchValue({
      o2InFlueGas: 0,
      excessAirPercentage: 0
    });
    this.setCalcMethod();
  }

  setCalcMethod() {
    if (this.flueGasLossForm.controls.oxygenCalculationMethod.value == 'Excess Air') {
      this.calcMethodExcessAir = true;
    } else {
      this.calcMethodExcessAir = false;
    }
    this.calcExcessAir();
  }

  calcExcessAir() {
    let input = {
      carbon: this.flueGasLossForm.controls.carbon.value,
      hydrogen: this.flueGasLossForm.controls.hydrogen.value,
      sulphur: this.flueGasLossForm.controls.sulphur.value,
      inertAsh: this.flueGasLossForm.controls.inertAsh.value,
      o2: this.flueGasLossForm.controls.o2.value,
      moisture: this.flueGasLossForm.controls.moisture.value,
      nitrogen: this.flueGasLossForm.controls.nitrogen.value,
      moistureInAirCombustion: this.flueGasLossForm.controls.moistureInAirComposition.value,
      o2InFlueGas: this.flueGasLossForm.controls.o2InFlueGas.value,
      excessAir: this.flueGasLossForm.controls.excessAirPercentage.value
    };
    this.calculationWarning = null;
    if (!this.calcMethodExcessAir) {
      if (input.o2InFlueGas < 0 || input.o2InFlueGas > 20.99999) {
        this.calculationExcessAir = 0.0;
        this.calculationWarning = 'Oxygen levels in Flue Gas must be greater than or equal to 0 and less than 21 percent';
      } else {
        this.calculationExcessAir = this.phastService.flueGasByMassCalculateExcessAir(input);
      }
      this.flueGasLossForm.patchValue({
        excessAirPercentage: this.calculationExcessAir
      });
    } else {
      if (input.excessAir < 0) {
        this.calculationFlueGasO2 = 0.0;

        this.calculationWarning = 'Excess Air must be greater than 0 percent';
      } else {
        this.calculationFlueGasO2 = this.phastService.flueGasByMassCalculateO2(input);
      }
      this.flueGasLossForm.patchValue({
        o2InFlueGas: this.calculationFlueGasO2
      });
    }
  }

  setProperties() {
    let tmpFlueGas = this.suiteDbService.selectSolidLiquidFlueGasMaterialById(this.flueGasLossForm.controls.gasTypeId.value);
    this.flueGasLossForm.patchValue({
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

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  startSavePolling() {
    this.checkForm();
    this.saveEmit.emit(true);
  }

  checkInputError(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.flueGasLossForm.controls.moistureInAirComposition.value < 0 || this.flueGasLossForm.controls.moistureInAirComposition.value > 100) {
      this.moistureInAirCompositionError = 'Moisture in Combustion Air must be equal or greater than 0 and less than or equal to 100%';
    } else {
      this.moistureInAirCompositionError = null;
    }
    if (this.flueGasLossForm.controls.unburnedCarbonInAsh.value < 0 || this.flueGasLossForm.controls.unburnedCarbonInAsh.value > 100) {
      this.unburnedCarbonInAshError = 'Unburned Carbon in Ash must be equal or greater than 0 and less than or equal to 100%';
    } else {
      this.unburnedCarbonInAshError = null;
    }

    if (this.moistureInAirCompositionError || this.unburnedCarbonInAshError) {
      this.inputError.emit(true);
      this.flueGasCompareService.inputError.next(true);
    } else {
      this.inputError.emit(false);
      this.flueGasCompareService.inputError.next(false);
    }
  }

  showMaterialModal() {
    this.showModal = true;
    this.lossesService.modalOpen.next(this.showModal);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.options = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
      let newMaterial = this.options.filter(material => { return material.substance == event.substance });
      if (newMaterial.length != 0) {
        this.flueGasLossForm.patchValue({
          gasTypeId: newMaterial[0].id
        })
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.showModal = false;
    this.lossesService.modalOpen.next(this.showModal);
    this.checkForm();
  }

  canCompare() {
    if (this.flueGasCompareService.baselineFlueGasLoss && this.flueGasCompareService.modifiedFlueGasLoss) {
      if (this.flueGasCompareService.compareLossType(this.lossIndex) == false) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  compareMassGasTypeId() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassGasTypeId(this.lossIndex);
    } else {
      return false;
    }
  }

  compareMassFlueGasTemperature() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassFlueGasTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareMassExcessAirPercentage() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassExcessAirPercentage(this.lossIndex);
    } else {
      return false;
    }
  }
  compareMassCombustionAirTemperature() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassCombustionAirTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareMassFuelTemperature() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassFuelTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareMassAshDischargeTemperature() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassAshDischargeTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareMassMoistureInAirComposition() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassMoistureInAirComposition(this.lossIndex);
    } else {
      return false;
    }
  }
  compareMassUnburnedCarbonInAsh() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassUnburnedCarbonInAsh(this.lossIndex);
    } else {
      return false;
    }
  }

  compareMassOxygenCalculationMethod() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassOxygenCalculationMethod(this.lossIndex);
    } else {
      return false;
    }  }
}

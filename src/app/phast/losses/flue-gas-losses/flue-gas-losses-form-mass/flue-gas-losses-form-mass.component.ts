import { Component, OnInit, Input, EventEmitter, Output, ViewChild, SimpleChanges } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { PhastService } from "../../../phast.service";
import { UntypedFormGroup } from '@angular/forms';
import { BaseGasDensity } from '../../../../shared/models/fans';
import { FlueGasByMass, FlueGasWarnings, MaterialInputProperties } from '../../../../shared/models/phast/losses/flueGas';
import { FlueGasFormService } from '../../../../calculator/furnaces/flue-gas/flue-gas-form.service';
import { SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';
import { Subscription } from 'rxjs';
import { SolidLiquidMaterialDbService } from '../../../../indexedDb/solid-liquid-material-db.service';
import { FlueGasCompareService } from '../flue-gas-compare.service';
import { roundVal } from '../../../../shared/helperFunctions';

@Component({
  selector: 'app-flue-gas-losses-form-mass',
  templateUrl: './flue-gas-losses-form-mass.component.html',
  styleUrls: ['./flue-gas-losses-form-mass.component.css'],
  standalone: false
})
export class FlueGasLossesFormMassComponent implements OnInit {
  @Input()
  flueGasLossForm: UntypedFormGroup;
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
  @Input()
  inSetup: boolean;
  @Input()
  isBaseline: boolean;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  @ViewChild('moistureModal', { static: false }) public moistureModal: ModalDirective;

  warnings: FlueGasWarnings;
  options: Array<SolidLiquidFlueGasMaterial> = [];
  showModal: boolean = false;
  showMoisture: boolean = false;
  baseGasDensity: BaseGasDensity = {
    barometricPressure: 29.92,
    dewPoint: 0,
    dryBulbTemp: 68,
    gasDensity: 0.07516579558441701,
    gasType: "AIR",
    inputType: "relativeHumidity",
    relativeHumidity: 0,
    specificGravity: 1,
    specificHeatGas: 0.24,
    specificHeatRatio: 1.4,
    staticPressure: 0,
    wetBulbTemp: 118.999
  }

  calculationMethods: Array<'Excess Air' | 'Oxygen in Flue Gas'> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];

  hasDeletedCustomMaterial: boolean = false;
  editExistingMaterial: boolean;
  existingMaterial: SolidLiquidFlueGasMaterial;
  calculationExcessAir = 0.0;
  calculationFlueGasO2 = 0.0;
  idString: string;

  optionsSub: Subscription;
  constructor(
    private flueGasFormService: FlueGasFormService,
    private flueGasCompareService: FlueGasCompareService,
    private lossesService: LossesService, private phastService: PhastService,
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService) { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.lossIndex;
    }
    else {
      this.idString = '_baseline_' + this.lossIndex;
    }

    this.optionsSub = this.solidLiquidMaterialDbService.dbSolidLiquidFlueGasMaterials.subscribe(val => {
      this.options = val;
    });

    if (this.flueGasLossForm && this.flueGasLossForm.controls.gasTypeId.valid) {
      if (this.flueGasLossForm.controls.carbon.invalid) {
        this.setProperties();
      } else {
        this.checkForDeletedMaterial();
      }
    }
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.calcExcessAir();
    this.checkWarnings();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.baselineSelected) {
      if (!changes.baselineSelected.firstChange) {
        if (!this.baselineSelected) {
          this.disableForm();
        } else {
          this.enableForm();
        }
      }
    }
  }

  ngOnDestroy() {
    this.optionsSub.unsubscribe();
  }

  focusOut() {
    this.changeField.emit('default');
  }
  disableForm() {
    this.flueGasLossForm.controls.gasTypeId.disable();
    this.flueGasLossForm.controls.oxygenCalculationMethod.disable();
  }

  enableForm() {
    this.flueGasLossForm.controls.gasTypeId.enable();
    this.flueGasLossForm.controls.oxygenCalculationMethod.enable();
  }


  focusField(str: string) {
    this.changeField.emit(str);
  }

  changeMethod() {
    this.flueGasLossForm.patchValue({
      o2InFlueGas: 0,
      excessAirPercentage: 0
    });
    this.calcExcessAir();
  }

  calcExcessAir() {
    let input: MaterialInputProperties = {
      carbon: this.flueGasLossForm.controls.carbon.value,
      hydrogen: this.flueGasLossForm.controls.hydrogen.value,
      sulphur: this.flueGasLossForm.controls.sulphur.value,
      inertAsh: this.flueGasLossForm.controls.inertAsh.value,
      o2: this.flueGasLossForm.controls.o2.value,
      moisture: this.flueGasLossForm.controls.moisture.value,
      nitrogen: this.flueGasLossForm.controls.nitrogen.value,
      moistureInAirCombustion: this.flueGasLossForm.controls.moistureInAirCombustion.value,
      o2InFlueGas: this.flueGasLossForm.controls.o2InFlueGas.value,
      excessAir: this.flueGasLossForm.controls.excessAirPercentage.value
    };

    if (this.flueGasLossForm.controls.oxygenCalculationMethod.value === 'Oxygen in Flue Gas') {
      if (input.o2InFlueGas < 0 || input.o2InFlueGas > 20.99999) {
        this.calculationExcessAir = 0.0;
      } else {
        this.calculationExcessAir = this.phastService.flueGasByMassCalculateExcessAir(input);
      }
      this.flueGasLossForm.patchValue({
        excessAirPercentage: this.calculationExcessAir
      });
    } else if (this.flueGasLossForm.controls.oxygenCalculationMethod.value === 'Excess Air') {
      if (input.excessAir < 0) {
        this.calculationFlueGasO2 = 0.0;
      } else {
        // bandaid
        if (input.moistureInAirCombustion === undefined) {
          input.moistureInAirCombustion = null;
        }
        this.calculationFlueGasO2 = this.phastService.flueGasByMassCalculateO2(input);
      }
      this.flueGasLossForm.patchValue({
        o2InFlueGas: this.calculationFlueGasO2
      });
    }
    this.save();
  }

  checkForDeletedMaterial() {
    let selectedMaterial: SolidLiquidFlueGasMaterial = this.options.find(option => { return option.id === this.flueGasLossForm.controls.gasTypeId.value });
    if (!selectedMaterial) {
      this.hasDeletedCustomMaterial = true;
      this.restoreMaterial();
    }
    this.save();
  }

  async restoreMaterial() {
    let customMaterial: SolidLiquidFlueGasMaterial = {
      carbon: this.flueGasLossForm.controls.carbon.value,
      hydrogen: this.flueGasLossForm.controls.hydrogen.value,
      inertAsh: this.flueGasLossForm.controls.inertAsh.value,
      moisture: this.flueGasLossForm.controls.moisture.value,
      nitrogen: this.flueGasLossForm.controls.nitrogen.value,
      o2: this.flueGasLossForm.controls.o2.value,
      sulphur: this.flueGasLossForm.controls.sulphur.value,
      heatingValue: this.flueGasLossForm.controls.heatingValue.value,
      substance: "Custom Material"
    };
    await this.solidLiquidMaterialDbService.addMaterial(customMaterial);
    let newMaterial: SolidLiquidFlueGasMaterial = this.options.find(material => { return material.substance === customMaterial.substance; });
    this.flueGasLossForm.patchValue({
      gasTypeId: newMaterial.id
    });
  }

  setProperties() {
    let tmpFlueGas: SolidLiquidFlueGasMaterial = this.options.find(option => { return option.id === this.flueGasLossForm.controls.gasTypeId.value });
    if (tmpFlueGas) {
      this.flueGasLossForm.patchValue({
        carbon: roundVal(tmpFlueGas.carbon, 4),
        hydrogen: roundVal(tmpFlueGas.hydrogen, 4),
        sulphur: roundVal(tmpFlueGas.sulphur, 4),
        inertAsh: roundVal(tmpFlueGas.inertAsh, 4),
        o2: roundVal(tmpFlueGas.o2, 4),
        moisture: roundVal(tmpFlueGas.moisture, 4),
        nitrogen: roundVal(tmpFlueGas.nitrogen, 4),
        heatingValue: tmpFlueGas.heatingValue
      });
    }
    this.save();
  }

  save() {
    this.flueGasLossForm = this.flueGasFormService.setValidators(this.flueGasLossForm);
    this.checkWarnings();

    // backend method needs moistureInAirCombustion to be ''
    // moistureInAirCombustion is "" before saveEmit and undefined after
    this.saveEmit.emit(true);

    // this.calculate should emit a loss object, though still working with this boolean
    this.calculate.emit(true);
  }

  checkWarnings() {
    let tmpLoss: FlueGasByMass = this.flueGasFormService.buildByMassLossFromForm(this.flueGasLossForm).flueGasByMass;
    this.warnings = this.flueGasFormService.checkFlueGasByMassWarnings(tmpLoss, this.settings);
    let hasWarning: boolean = this.flueGasFormService.checkWarningsExist(this.warnings);
    this.inputError.emit(hasWarning);
  }

  showMaterialModal(editExistingMaterial: boolean) {
    this.editExistingMaterial = editExistingMaterial;
    if (editExistingMaterial === true) {
      this.existingMaterial = {
        carbon: this.flueGasLossForm.controls.carbon.value,
        hydrogen: this.flueGasLossForm.controls.hydrogen.value,
        inertAsh: this.flueGasLossForm.controls.inertAsh.value,
        moisture: this.flueGasLossForm.controls.moisture.value,
        nitrogen: this.flueGasLossForm.controls.nitrogen.value,
        o2: this.flueGasLossForm.controls.o2.value,
        sulphur: this.flueGasLossForm.controls.sulphur.value,
        heatingValue: this.flueGasLossForm.controls.heatingValue.value,
        id: this.flueGasLossForm.controls.gasTypeId.value,
        substance: "Custom Material"
      };
    }
    this.showModal = true;
    this.lossesService.modalOpen.next(this.showModal);
    this.materialModal.show();
  }

  showMoistureModal() {
    this.showMoisture = true;
    this.lossesService.modalOpen.next(this.showMoisture);
    this.moistureModal.show();
  }

  hideMaterialModal(newMaterialId: number) {
    if (newMaterialId != undefined) {
      let newMaterial: SolidLiquidFlueGasMaterial = this.options.find(material => { return material.id === newMaterialId; });
      if (newMaterial) {
        this.flueGasLossForm.patchValue({
          gasTypeId: newMaterial.id
        });
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.dismissMessage();
    this.showModal = false;
    this.lossesService.modalOpen.next(this.showModal);
  }

  hideMoistureModal(moistureInAirCombustion?: number) {
    if (moistureInAirCombustion) {
      moistureInAirCombustion = Number(moistureInAirCombustion.toFixed(2));
      this.flueGasLossForm.controls.moistureInAirCombustion.patchValue(moistureInAirCombustion);
    }
    this.moistureModal.hide();
    this.showMoisture = false;
    this.lossesService.modalOpen.next(this.showMoisture);
    this.save();
  }

  canCompare() {
    if (this.flueGasCompareService.baselineFlueGasLoss && this.flueGasCompareService.modifiedFlueGasLoss && !this.inSetup) {
      if (this.flueGasCompareService.compareLossType(this.lossIndex) === false) {
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

  compareMassAmbientAirTemp() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassAmbientAirTemp(this.lossIndex);
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
  compareMassMoistureInAirCombustion() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassMoistureInAirCombustion(this.lossIndex);
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
    }
  }

  dismissMessage() {
    this.hasDeletedCustomMaterial = false;
  }
}


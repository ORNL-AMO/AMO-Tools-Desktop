import { Component, OnInit, Input, EventEmitter, Output, ViewChild, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { FlueGasCompareService } from "../flue-gas-compare.service";
import { ModalDirective } from 'ngx-bootstrap/modal';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { FlueGasByVolume, FlueGasWarnings } from '../../../../shared/models/phast/losses/flueGas';
import { FlueGasFormService } from '../../../../calculator/furnaces/flue-gas/flue-gas-form.service';
import { FlueGasMaterial } from '../../../../shared/models/materials';
import { FlueGasMaterialDbService } from '../../../../indexedDb/flue-gas-material-db.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-flue-gas-losses-form-volume',
  templateUrl: './flue-gas-losses-form-volume.component.html',
  styleUrls: ['./flue-gas-losses-form-volume.component.css']
})
export class FlueGasLossesFormVolumeComponent implements OnInit {
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
  @Input()
  inSetup: boolean;
  @Input()
  isBaseline: boolean;

  @ViewChild('moistureModal', { static: false }) public moistureModal: ModalDirective;
  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  @Output('inputError')
  inputError = new EventEmitter<boolean>();

  firstChange: boolean = true;
  options: Array<FlueGasMaterial>;
  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];

  warnings: FlueGasWarnings;
  showModal: boolean = false;
  idString: string;
  showMoisture: boolean = false;
  hasDeletedCustomMaterial: boolean = false;
  editExistingMaterial: boolean;
  existingMaterial: FlueGasMaterial;

  constructor(private suiteDbService: SuiteDbService,
    private flueGasCompareService: FlueGasCompareService,
    private flueGasFormService: FlueGasFormService,
    private lossesService: LossesService,
    private flueGasMaterialDbService: FlueGasMaterialDbService) { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.lossIndex;
    }
    else {
      this.idString = '_baseline_' + this.lossIndex;
    }
    this.options = this.suiteDbService.selectGasFlueGasMaterials();
    if (this.flueGasLossForm) {
      if (this.flueGasLossForm.controls.gasTypeId.value && this.flueGasLossForm.controls.gasTypeId.value !== '') {
        if (this.flueGasLossForm.controls.CH4.value === '' || !this.flueGasLossForm.controls.CH4.value) {
          this.setProperties();
        } else {
          this.checkForDeletedMaterial();
        }
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
          this.options = this.suiteDbService.selectGasFlueGasMaterials();
          this.enableForm();
        }
      }
    }
  }

  focusOut() {
    this.changeField.emit('default');
  }

  disableForm() {
    this.flueGasLossForm.controls.gasTypeId.disable();
    this.flueGasLossForm.controls.oxygenCalculationMethod.disable();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  enableForm() {
    this.flueGasLossForm.controls.gasTypeId.enable();
    this.flueGasLossForm.controls.oxygenCalculationMethod.enable();
  }

  changeMethod() {
    this.flueGasLossForm.patchValue({
      o2InFlueGas: 0,
      excessAirPercentage: 0
    });
    this.calcExcessAir();
    this.save();
  }

  calcExcessAir() {
    if (this.flueGasLossForm.controls.oxygenCalculationMethod.value === 'Oxygen in Flue Gas') {
      this.flueGasLossForm.patchValue({
        excessAirPercentage: 0
      });
    }
    else if (this.flueGasLossForm.controls.oxygenCalculationMethod.value === 'Excess Air') {
       this.flueGasLossForm.patchValue({
        o2InFlueGas: 0
      });
    }
    this.save();
  }

  checkWarnings() {
    let tmpLoss: FlueGasByVolume = this.flueGasFormService.buildByVolumeLossFromForm(this.flueGasLossForm).flueGasByVolume;
    this.warnings = this.flueGasFormService.checkFlueGasByVolumeWarnings(tmpLoss, this.settings);
    let hasWarning: boolean = this.flueGasFormService.checkWarningsExist(this.warnings);
    this.inputError.emit(hasWarning);
  }

  checkForDeletedMaterial() {
    let selectedMaterial: FlueGasMaterial = this.suiteDbService.selectGasFlueGasMaterialById(this.flueGasLossForm.controls.gasTypeId.value);
    if (!selectedMaterial) {
      this.hasDeletedCustomMaterial = true;
      this.restoreMaterial();
    } 
    this.save();
  }

  async restoreMaterial() {
    let customMaterial: FlueGasMaterial = {
      C2H6: this.flueGasLossForm.controls.C2H6.value,
      C3H8: this.flueGasLossForm.controls.C3H8.value,
      C4H10_CnH2n: this.flueGasLossForm.controls.C4H10_CnH2n.value,
      CH4: this.flueGasLossForm.controls.CH4.value,
      CO: this.flueGasLossForm.controls.CO.value,
      CO2: this.flueGasLossForm.controls.CO2.value,
      H2: this.flueGasLossForm.controls.H2.value,
      H2O: this.flueGasLossForm.controls.H2O.value,
      N2: this.flueGasLossForm.controls.N2.value,
      O2: this.flueGasLossForm.controls.O2.value,
      SO2: this.flueGasLossForm.controls.SO2.value,
      heatingValue: this.flueGasLossForm.controls.heatingValue.value,
      heatingValueVolume: this.flueGasLossForm.controls.heatingValueVolume.value,
      specificGravity: this.flueGasLossForm.controls.specificGravity.value,
      substance: "Custom Material"
    };
    let suiteDbResult = this.suiteDbService.insertGasFlueGasMaterial(customMaterial);
    if (suiteDbResult === true) {
      await firstValueFrom(this.flueGasMaterialDbService.addWithObservable(customMaterial));
    }
    this.options = this.suiteDbService.selectGasFlueGasMaterials();
    let newMaterial: FlueGasMaterial = this.options.find(material => { return material.substance === customMaterial.substance; });
    this.flueGasLossForm.patchValue({
      gasTypeId: newMaterial.id
    });
  }

  setProperties() {
    let tmpFlueGas: FlueGasMaterial = this.suiteDbService.selectGasFlueGasMaterialById(this.flueGasLossForm.controls.gasTypeId.value);
    if (tmpFlueGas) {
      this.flueGasLossForm.patchValue({
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
        O2: this.roundVal(tmpFlueGas.O2, 4),
        specificGravity: this.roundVal(tmpFlueGas.specificGravity, 4),
        heatingValue: this.roundVal(tmpFlueGas.heatingValue, 4),
        heatingValueVolume: this.roundVal(tmpFlueGas.heatingValueVolume, 4)
      });
    }
    this.save();
  }
  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  save() {
    this.flueGasLossForm = this.flueGasFormService.setValidators(this.flueGasLossForm);
    this.checkWarnings();
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }

  showMaterialModal(editExistingMaterial: boolean) {
    this.editExistingMaterial = editExistingMaterial;
    if (editExistingMaterial === true) {
      this.existingMaterial = {
        C2H6: this.flueGasLossForm.controls.C2H6.value,
        C3H8: this.flueGasLossForm.controls.C3H8.value,
        C4H10_CnH2n: this.flueGasLossForm.controls.C4H10_CnH2n.value,
        CH4: this.flueGasLossForm.controls.CH4.value,
        CO: this.flueGasLossForm.controls.CO.value,
        CO2: this.flueGasLossForm.controls.CO2.value,
        H2: this.flueGasLossForm.controls.H2.value,
        H2O: this.flueGasLossForm.controls.H2O.value,
        N2: this.flueGasLossForm.controls.N2.value,
        O2: this.flueGasLossForm.controls.O2.value,
        SO2: this.flueGasLossForm.controls.SO2.value,
        heatingValue: this.flueGasLossForm.controls.heatingValue.value,
        heatingValueVolume: this.flueGasLossForm.controls.heatingValueVolume.value,
        specificGravity: this.flueGasLossForm.controls.specificGravity.value,
        id: this.flueGasLossForm.controls.gasTypeId.value,
        substance: "Custom Material"
      };
    }
    this.showModal = true;
    this.lossesService.modalOpen.next(this.showModal);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.options = this.suiteDbService.selectGasFlueGasMaterials();
      let newMaterial = this.options.filter(material => { return material.substance === event.substance; });
      if (newMaterial.length !== 0) {
        this.flueGasLossForm.patchValue({
          gasTypeId: newMaterial[0].id
        });
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.showModal = false;
    this.dismissMessage();
    this.lossesService.modalOpen.next(this.showModal);
    this.save();
  }

  
  showMoistureModal() {
    this.showMoisture = true;
    this.lossesService.modalOpen.next(this.showMoisture);
    this.moistureModal.show();
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
  compareVolumeGasTypeId() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareVolumeGasTypeId(this.lossIndex);
    } else {
      return false;
    }
  }
  compareVolumeFlueGasTemperature() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareVolumeFlueGasTemperature(this.lossIndex);
    } else {
      return false;
    }
  }

  compareVolumeAmbientAirTemp() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareVolumeAmbientAirTemp(this.lossIndex);
    } else {
      return false;
    }
  }

  compareVolumeMoistureInAirCombustion() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareVolumeMoistureInAirCombustion(this.lossIndex);
    } else {
      return false;
    }
  }

  compareVolumeExcessAirPercentage() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareVolumeExcessAirPercentage(this.lossIndex);
    } else {
      return false;
    }
  }

  compareVolumeO2InFlueGas() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareVolumeO2InFlueGas(this.lossIndex);
    } else {
      return false;
    }
  }

  compareVolumeCombustionAirTemperature() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareVolumeCombustionAirTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareVolumeFuelTemperature() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareVolumeFuelTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareVolumeOxygenCalculationMethod() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareVolumeOxygenCalculationMethod(this.lossIndex);
    } else {
      return false;
    }
  }

  dismissMessage() {
    this.hasDeletedCustomMaterial = false;
  }
}

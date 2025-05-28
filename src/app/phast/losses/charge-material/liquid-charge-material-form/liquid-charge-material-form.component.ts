import { Component, OnInit, Input, EventEmitter, Output, ViewChild, SimpleChanges } from '@angular/core';
import { ChargeMaterialCompareService } from '../charge-material-compare.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { UntypedFormGroup } from '@angular/forms';
import { LiquidLoadChargeMaterial } from '../../../../shared/models/materials';
import { LiquidChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { LiquidMaterialFormService, LiquidMaterialWarnings } from '../../../../calculator/furnaces/charge-material/liquid-material-form/liquid-material-form.service';
import { SqlDbApiService } from '../../../../tools-suite-api/sql-db-api.service';
import { firstValueFrom } from 'rxjs';
import { LiquidLoadMaterialDbService } from '../../../../indexedDb/liquid-load-material-db.service';
@Component({
    selector: 'app-liquid-charge-material-form',
    templateUrl: './liquid-charge-material-form.component.html',
    styleUrls: ['./liquid-charge-material-form.component.css'],
    standalone: false
})
export class LiquidChargeMaterialFormComponent implements OnInit {
  @Input()
  chargeMaterialForm: UntypedFormGroup;
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

  materialTypes: any;
  selectedMaterial: any;

  hasDeletedCustomMaterial: boolean = false;
  editExistingMaterial: boolean;
  existingMaterial: LiquidLoadChargeMaterial;
  warnings: LiquidMaterialWarnings;
  showModal: boolean = false;
  idString: string;
  constructor(private sqlDbApiService: SqlDbApiService, private liquidMaterialFormService: LiquidMaterialFormService, private chargeMaterialCompareService: ChargeMaterialCompareService, private lossesService: LossesService, private convertUnitsService: ConvertUnitsService, private liquidLoadMaterialDbService: LiquidLoadMaterialDbService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.baselineSelected) {
      if (!changes.baselineSelected.firstChange) {
        if (!this.baselineSelected) {
          this.disableForm();
        } else {
          this.materialTypes = this.sqlDbApiService.selectLiquidLoadChargeMaterials();
          this.enableForm();
        }
      }
    }
  }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = 'phast_modification_solid_' + this.lossIndex;
    }
    else {
      this.idString = 'phast_baseline_solid_' + this.lossIndex;
    }
    this.materialTypes = this.sqlDbApiService.selectLiquidLoadChargeMaterials();
    if (this.chargeMaterialForm) {
      if (this.chargeMaterialForm.controls.materialId.value && this.chargeMaterialForm.controls.materialId.value !== '') {
        if (this.chargeMaterialForm.controls.materialLatentHeat.value === '') {
          this.setProperties();
        } else {
          this.checkForDeletedMaterial();
        }
      }
    }
    this.checkWarnings();
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }

  ngOnDestroy() {
    this.lossesService.modalOpen.next(false);
  }

  disableForm() {
    this.chargeMaterialForm.controls.materialId.disable();
    this.chargeMaterialForm.controls.endothermicOrExothermic.disable();
  }

  enableForm() {
    this.chargeMaterialForm.controls.materialId.enable();
    this.chargeMaterialForm.controls.endothermicOrExothermic.enable();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }

  checkForDeletedMaterial() {
    let selectedMaterial: LiquidLoadChargeMaterial = this.sqlDbApiService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (!selectedMaterial) {
      this.hasDeletedCustomMaterial = true;
      this.restoreMaterial();
    } 
    this.save();
  }

  async restoreMaterial() {
    let customMaterial: LiquidLoadChargeMaterial = {
      substance: "Custom Material",
      latentHeat: this.chargeMaterialForm.controls.materialLatentHeat.value,
      specificHeatLiquid: this.chargeMaterialForm.controls.materialSpecificHeatLiquid.value,
      specificHeatVapor: this.chargeMaterialForm.controls.materialSpecificHeatVapor.value,
      vaporizationTemperature: this.chargeMaterialForm.controls.materialVaporizingTemperature.value
    };
    let suiteDbResult = this.sqlDbApiService.insertLiquidLoadChargeMaterial(customMaterial);
    if (suiteDbResult === true) {
      await firstValueFrom(this.liquidLoadMaterialDbService.addWithObservable(customMaterial));
    }
    this.materialTypes = this.sqlDbApiService.selectLiquidLoadChargeMaterials();
    let newMaterial: LiquidLoadChargeMaterial = this.materialTypes.find(material => { return material.substance === customMaterial.substance; });
    this.chargeMaterialForm.patchValue({
      materialId: newMaterial.id
    });
  }


  setProperties() {
    let selectedMaterial: LiquidLoadChargeMaterial = this.sqlDbApiService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (selectedMaterial) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        selectedMaterial.vaporizationTemperature = this.convertUnitsService.value(this.roundVal(selectedMaterial.vaporizationTemperature, 4)).from('F').to('C');
        selectedMaterial.latentHeat = this.convertUnitsService.value(selectedMaterial.latentHeat).from('btuLb').to('kJkg');
        selectedMaterial.specificHeatLiquid = this.convertUnitsService.value(selectedMaterial.specificHeatLiquid).from('btulbF').to('kJkgC');
        selectedMaterial.specificHeatVapor = this.convertUnitsService.value(selectedMaterial.specificHeatVapor).from('btulbF').to('kJkgC');
      }
      this.chargeMaterialForm.patchValue({
        materialLatentHeat: this.roundVal(selectedMaterial.latentHeat, 4),
        materialSpecificHeatLiquid: this.roundVal(selectedMaterial.specificHeatLiquid, 4),
        materialSpecificHeatVapor: this.roundVal(selectedMaterial.specificHeatVapor, 4),
        materialVaporizingTemperature: this.roundVal(selectedMaterial.vaporizationTemperature, 4)
      });
    }
    this.save();
  }

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  checkWarnings() {
    let tmpMaterial: LiquidChargeMaterial = this.liquidMaterialFormService.buildLiquidChargeMaterial(this.chargeMaterialForm).liquidChargeMaterial;
    this.warnings = this.liquidMaterialFormService.checkLiquidWarnings(tmpMaterial);
    let hasWarning: boolean = this.warnings.dischargeTempWarning !== null || this.warnings.inletOverVaporizingWarning !== null || this.warnings.outletOverVaporizingWarning !== null;
    this.inputError.emit(hasWarning);
  }

  save() {
    this.chargeMaterialForm = this.liquidMaterialFormService.setInitialTempValidator(this.chargeMaterialForm);
    this.checkWarnings();
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }

  checkSpecificHeatDiffLiquid() {
    let material: LiquidLoadChargeMaterial = this.sqlDbApiService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.specificHeatLiquid).from('btulbF').to('kJkgC');
        material.specificHeatLiquid = this.roundVal(val, 4);
      }
      if (material.specificHeatLiquid !== this.chargeMaterialForm.controls.materialSpecificHeatLiquid.value) {
        return true;
      } else {
        return false;
      }
    }
  }

  checkVaporizingTempDiff() {
    let material: LiquidLoadChargeMaterial = this.sqlDbApiService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.vaporizationTemperature).from('F').to('C');
        material.vaporizationTemperature = this.roundVal(val, 4);
      }
      if (material.vaporizationTemperature !== this.chargeMaterialForm.controls.materialVaporizingTemperature.value) {
        return true;
      } else {
        return false;
      }
    }
  }

  checkLatentHeatDiff() {
    let material: LiquidLoadChargeMaterial = this.sqlDbApiService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.latentHeat).from('btuLb').to('kJkg');
        material.latentHeat = this.roundVal(val, 4);
      }
      if (material.latentHeat !== this.chargeMaterialForm.controls.materialLatentHeat.value) {
        return true;
      } else {
        return false;
      }
    }
  }

  checkSpecificHeatVaporDiff() {
    let material: LiquidLoadChargeMaterial = this.sqlDbApiService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.specificHeatVapor).from('btulbF').to('kJkgC');
        material.specificHeatVapor = this.roundVal(val, 4);
      }
      if (material.specificHeatVapor !== this.chargeMaterialForm.controls.materialSpecificHeatVapor.value) {
        return true;
      } else {
        return false;
      }
    }
  }
  checkFeedRateDiff() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareLiquidChargeFeedRate(this.lossIndex);
    } else {
      return false;
    }
  }
  canCompare() {
    if (this.chargeMaterialCompareService.baselineMaterials && this.chargeMaterialCompareService.modifiedMaterials && !this.inSetup) {
      if (this.chargeMaterialCompareService.compareMaterialType(this.lossIndex) === false) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  checkInitialTempDiff() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareLiquidInitialTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  checkDischargeTempDiff() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareLiquidDischargeTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  checkChargeReactedDiff() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareLiquidPercentReacted(this.lossIndex);
    } else {
      return false;
    }
  }
  checkReactionHeatDiff() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareLiquidReactionHeat(this.lossIndex);
    } else {
      return false;
    }
  }
  checkExothermicDiff() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareLiquidThermicReaction(this.lossIndex);
    } else {
      return false;
    }
  }
  checkAdditionalHeatDiff() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareLiquidAdditionalHeat(this.lossIndex);
    } else {
      return false;
    }
  }
  checkLiquidVaporizedDiff() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareLiquidPercentVaporized(this.lossIndex);
    } else {
      return false;
    }
  }
  checkMaterialDiff() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareLiquidMaterialId(this.lossIndex);
    } else {
      return false;
    }
  }
  showMaterialModal(editExistingMaterial: boolean) {
    this.editExistingMaterial = editExistingMaterial;
    if(editExistingMaterial === true) {
      this.existingMaterial = {
        id: this.chargeMaterialForm.controls.materialId.value,
        latentHeat: this.chargeMaterialForm.controls.materialLatentHeat.value,
        specificHeatLiquid: this.chargeMaterialForm.controls.materialSpecificHeatLiquid.value,
        specificHeatVapor: this.chargeMaterialForm.controls.materialSpecificHeatVapor.value,
        vaporizationTemperature: this.chargeMaterialForm.controls.materialVaporizingTemperature.value,
        substance: "Custom Material"
      };
    }
    this.showModal = true;
    this.lossesService.modalOpen.next(true);
    this.materialModal.show();
  }
  hideMaterialModal(event?: any) {
    if (event) {
      this.materialTypes = this.sqlDbApiService.selectLiquidLoadChargeMaterials();
      let newMaterial = this.materialTypes.filter(material => { return material.substance === event.substance; });
      if (newMaterial.length !== 0) {
        this.chargeMaterialForm.patchValue({
          materialId: newMaterial[0].id
        });
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.showModal = false;
    this.dismissMessage();
    this.lossesService.modalOpen.next(false);
  }

  dismissMessage() {
    this.hasDeletedCustomMaterial = false;
  }
}

import { Component, OnInit, Input, EventEmitter, Output, ViewChild, SimpleChanges } from '@angular/core';
import { ChargeMaterialCompareService } from '../charge-material-compare.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { UntypedFormGroup } from '@angular/forms';
import { SolidLoadChargeMaterial } from '../../../../shared/models/materials';
import { SolidChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { SolidMaterialFormService, SolidMaterialWarnings } from '../../../../calculator/furnaces/charge-material/solid-material-form/solid-material-form.service';
import { SqlDbApiService } from '../../../../tools-suite-api/sql-db-api.service';
import { SolidLoadMaterialDbService } from '../../../../indexedDb/solid-load-material-db.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-solid-charge-material-form',
  templateUrl: './solid-charge-material-form.component.html',
  styleUrls: ['./solid-charge-material-form.component.css']
})
export class SolidChargeMaterialFormComponent implements OnInit {
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

  firstChange: boolean = true;

  hasDeletedCustomMaterial: boolean = false;
  editExistingMaterial: boolean;
  existingMaterial: SolidLoadChargeMaterial;
  materialTypes: Array<SolidLoadChargeMaterial>;
  showModal: boolean = false;
  warnings: SolidMaterialWarnings;
  idString: string;
  constructor(
    private chargeMaterialCompareService: ChargeMaterialCompareService,
    private sqlDbApiService: SqlDbApiService, 
    private solidMaterialFormService: SolidMaterialFormService,
    private lossesService: LossesService,
    private convertUnitsService: ConvertUnitsService,
    private solidLoadMaterialDbService: SolidLoadMaterialDbService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.baselineSelected) {
      if (!changes.baselineSelected.firstChange) {
        if (!this.baselineSelected) {
          this.disableForm();
        } else {
          this.materialTypes = this.sqlDbApiService.selectSolidLoadChargeMaterials();
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
    //get material types from ToolSuiteDb
    this.materialTypes = this.sqlDbApiService.selectSolidLoadChargeMaterials();
    if (this.chargeMaterialForm) {
      if (this.chargeMaterialForm.controls.materialId.value && this.chargeMaterialForm.controls.materialId.value !== '') {
        if (this.chargeMaterialForm.controls.materialLatentHeatOfFusion.value === '') {
          this.setProperties();
        } else {
          this.checkForDeletedMaterial();
        }
      }
    }
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.checkWarnings();
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
    let selectedMaterial: SolidLoadChargeMaterial = this.sqlDbApiService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (!selectedMaterial) {
      this.hasDeletedCustomMaterial = true;
      this.restoreMaterial();
    }
    this.save();
  }

  async restoreMaterial() {
    let customMaterial: SolidLoadChargeMaterial = {
      latentHeat: this.chargeMaterialForm.controls.materialLatentHeatOfFusion.value,
      meltingPoint: this.chargeMaterialForm.controls.materialMeltingPoint.value,
      specificHeatLiquid: this.chargeMaterialForm.controls.materialHeatOfLiquid.value,
      specificHeatSolid: this.chargeMaterialForm.controls.materialSpecificHeatOfSolidMaterial.value,
      substance: "Custom Material"
    };
    let suiteDbResult = this.sqlDbApiService.insertSolidLoadChargeMaterial(customMaterial);
    if (suiteDbResult === true) {
      await firstValueFrom(this.solidLoadMaterialDbService.addWithObservable(customMaterial));
    }
    this.materialTypes = this.sqlDbApiService.selectSolidLoadChargeMaterials();
    let newMaterial: SolidLoadChargeMaterial = this.materialTypes.find(material => { return material.substance === customMaterial.substance; });
    this.chargeMaterialForm.patchValue({
      materialId: newMaterial.id
    });
  }

  setProperties() {
    let selectedMaterial: SolidLoadChargeMaterial = this.sqlDbApiService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (selectedMaterial) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        selectedMaterial.latentHeat = this.convertUnitsService.value(selectedMaterial.latentHeat).from('btuLb').to('kJkg');
        selectedMaterial.meltingPoint = this.convertUnitsService.value(selectedMaterial.meltingPoint).from('F').to('C');
        selectedMaterial.specificHeatLiquid = this.convertUnitsService.value(selectedMaterial.specificHeatLiquid).from('btulbF').to('kJkgC');
        selectedMaterial.specificHeatSolid = this.convertUnitsService.value(selectedMaterial.specificHeatSolid).from('btulbF').to('kJkgC');
      }
      this.chargeMaterialForm.patchValue({
        materialLatentHeatOfFusion: this.roundVal(selectedMaterial.latentHeat, 4),
        materialMeltingPoint: this.roundVal(selectedMaterial.meltingPoint, 4),
        materialHeatOfLiquid: this.roundVal(selectedMaterial.specificHeatLiquid, 4),
        materialSpecificHeatOfSolidMaterial: this.roundVal(selectedMaterial.specificHeatSolid, 4)
      });
    }
    this.save();
  }

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  checkWarnings() {
    let tmpMaterial: SolidChargeMaterial = this.solidMaterialFormService.buildSolidChargeMaterial(this.chargeMaterialForm).solidChargeMaterial;
    this.warnings = this.solidMaterialFormService.checkSolidWarnings(tmpMaterial);
    let hasWarning: boolean = this.warnings.dischargeTempWarning !== null;
    this.inputError.emit(hasWarning);
  }

  save() {
    this.chargeMaterialForm = this.solidMaterialFormService.setInitialTempValidator(this.chargeMaterialForm);
    this.checkWarnings();
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }

  checkSpecificHeatOfSolid() {
    let material: SolidLoadChargeMaterial = this.sqlDbApiService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        material.specificHeatSolid = this.convertUnitsService.value(material.specificHeatSolid).from('btulbF').to('kJkgC');
      }
      material.specificHeatSolid = this.roundVal(material.specificHeatSolid, 4);
      if (material.specificHeatSolid !== this.chargeMaterialForm.controls.materialSpecificHeatOfSolidMaterial.value) {
        return true;
      } else {
        return false;
      }
    }
  }
  checkLatentHeatOfFusion() {
    let material: SolidLoadChargeMaterial = this.sqlDbApiService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.latentHeat).from('btuLb').to('kJkg');
        material.latentHeat = this.roundVal(val, 4);
      }
      if (material.latentHeat !== this.chargeMaterialForm.controls.materialLatentHeatOfFusion.value) {
        return true;
      } else {
        return false;
      }
    }
  }
  checkHeatOfLiquid() {
    let material: SolidLoadChargeMaterial = this.sqlDbApiService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.specificHeatLiquid).from('btulbF').to('kJkgC');
        material.specificHeatLiquid = this.roundVal(val, 4);
      }
      if (material.specificHeatLiquid !== this.chargeMaterialForm.controls.materialHeatOfLiquid.value) {
        return true;
      } else {
        return false;
      }
    }
  }
  checkMeltingPoint() {
    let material: SolidLoadChargeMaterial = this.sqlDbApiService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.meltingPoint).from('F').to('C');
        material.meltingPoint = this.roundVal(val, 4);
      }
      if (material.meltingPoint !== this.chargeMaterialForm.controls.materialMeltingPoint.value) {
        return true;
      } else {
        return false;
      }
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
  compareSolidMaterialId() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareSolidMaterialId(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSolidThermicReactionType() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareSolidThermicReactionType(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSolidSpecificHeatSolid() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareSolidSpecificHeatSolid(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSolidLatentHeat() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareSolidLatentHeat(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSolidSpecificHeatLiquid() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareSolidSpecificHeatLiquid(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSolidMeltingPoint() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareSolidMeltingPoint(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSolidChargeFeedRate() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareSolidChargeFeedRate(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSolidWaterContentCharged() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareSolidWaterContentCharged(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSolidWaterContentDischarged() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareSolidWaterContentDischarged(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSolidInitialTemperature() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareSolidInitialTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSolidDischargeTemperature() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareSolidDischargeTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSolidWaterVaporDischargeTemperature() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareSolidWaterVaporDischargeTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSolidChargeMelted() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareSolidChargeMelted(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSolidChargeReacted() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareSolidChargeReacted(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSolidReactionHeat() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareSolidReactionHeat(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSolidAdditionalHeat() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareSolidAdditionalHeat(this.lossIndex);
    } else {
      return false;
    }
  }

  showMaterialModal(editExistingMaterial: boolean) {
    this.editExistingMaterial = editExistingMaterial;
    if(editExistingMaterial === true) {
      this.existingMaterial = {
        id: this.chargeMaterialForm.controls.materialId.value,
        latentHeat: this.chargeMaterialForm.controls.materialLatentHeatOfFusion.value,
        meltingPoint: this.chargeMaterialForm.controls.materialMeltingPoint.value,
        specificHeatLiquid: this.chargeMaterialForm.controls.materialHeatOfLiquid.value,
        specificHeatSolid: this.chargeMaterialForm.controls.materialSpecificHeatOfSolidMaterial.value,
        substance: "Custom Material"
      };
    }
    this.showModal = true;
    this.lossesService.modalOpen.next(true);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.materialTypes = this.sqlDbApiService.selectSolidLoadChargeMaterials();
      let newMaterial: SolidLoadChargeMaterial = this.materialTypes.find(material => { return material.substance === event.substance; });
      if (newMaterial) {
        this.chargeMaterialForm.patchValue({
          materialId: newMaterial.id
        });
        this.setProperties();
      }
    }
    this.showModal = false;
    this.dismissMessage();
    this.materialModal.hide();
    this.lossesService.modalOpen.next(false);
  }

  dismissMessage() {
    this.hasDeletedCustomMaterial = false;
  }
}

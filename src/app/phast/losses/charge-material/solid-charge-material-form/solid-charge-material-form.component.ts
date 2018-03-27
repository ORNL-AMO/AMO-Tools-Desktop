import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { ChargeMaterialCompareService } from '../charge-material-compare.service';
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { SolidLoadChargeMaterial } from '../../../../shared/models/materials';

@Component({
  selector: 'app-solid-charge-material-form',
  templateUrl: './solid-charge-material-form.component.html',
  styleUrls: ['./solid-charge-material-form.component.css']
})
export class SolidChargeMaterialFormComponent implements OnInit {
  @Input()
  chargeMaterialForm: FormGroup;
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

  firstChange: boolean = true;

  specificHeatError: string = null;
  latentHeatError: string = null;
  heatOfLiquidError: string = null;
  feedRateError: string = null;
  waterChargedError: string = null;
  waterDischargedError: string = null;
  chargeMeltedError: string = null;
  chargeSolidReactedError: string = null;
  heatOfReactionError: string = null;
  materialTypes: any;
  selectedMaterialId: any;
  selectedMaterial: any;
  dischargeTempError: string = null;
  showModal: boolean = false;
  constructor(private suiteDbService: SuiteDbService, private chargeMaterialCompareService: ChargeMaterialCompareService, private windowRefService: WindowRefService, private lossesService: LossesService, private convertUnitsService: ConvertUnitsService) {
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

  ngOnInit() {
    //get material types from ToolSuiteDb
    this.materialTypes = this.suiteDbService.selectSolidLoadChargeMaterials();
    if (this.chargeMaterialForm) {
      if (this.chargeMaterialForm.controls.materialId.value && this.chargeMaterialForm.controls.materialId.value != '') {
        if (this.chargeMaterialForm.controls.materialLatentHeatOfFusion.value == '') {
          this.setProperties();
        }
      }
    }
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.checkInputError(true);
  }

  ngOnDestroy() {
    this.lossesService.modalOpen.next(false);
  }

  disableForm() {
    this.chargeMaterialForm.disable();
  }

  enableForm() {
    this.chargeMaterialForm.enable();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  focusOut() {
    this.changeField.emit('default');
  }

  setProperties() {
    let selectedMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (this.settings.unitsOfMeasure == 'Metric') {
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
    })
    this.startSavePolling();
  }

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }
  checkInputError(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.chargeMaterialForm.controls.materialSpecificHeatOfSolidMaterial.value < 0) {
      this.specificHeatError = 'Average Specific Heat must be equal or greater than 0';
    } else {
      this.specificHeatError = null;
    }
    if (this.chargeMaterialForm.controls.materialLatentHeatOfFusion.value < 0) {
      this.latentHeatError = 'Latent Heat of Fusion must be equal or greater than 0';
    } else {
      this.latentHeatError = null;
    }
    if (this.chargeMaterialForm.controls.materialHeatOfLiquid.value < 0) {
      this.heatOfLiquidError = 'Specific heat of liquid from molten material must be equal or greater than 0';
    } else {
      this.heatOfLiquidError = null;
    }
    if (this.chargeMaterialForm.controls.feedRate.value < 0) {
      this.feedRateError = 'Charge Feed Rate must be grater than 0';
    } else {
      this.feedRateError = null;
    }
    if (this.chargeMaterialForm.controls.waterContentAsCharged.value < 0 || this.chargeMaterialForm.controls.waterContentAsCharged.value > 100) {
      this.waterChargedError = 'Water Content as Charged must be equal or greater than 0 and less than or equal to 100%';
    } else {
      this.waterChargedError = null;
    }
    if (this.chargeMaterialForm.controls.waterContentAsDischarged.value < 0 || this.chargeMaterialForm.controls.waterContentAsDischarged.value > 100) {
      this.waterDischargedError = 'Water Content as Discharged must be equal or greater than 0 and less than or equal to 100%';
    } else {
      this.waterDischargedError = null;
    }
    if (this.chargeMaterialForm.controls.percentChargeMelted.value < 0 || this.chargeMaterialForm.controls.percentChargeMelted.value > 100) {
      this.chargeMeltedError = 'Charge Melted must be equal or greater than 0 and less than or equal to 100%';
    } else {
      this.chargeMeltedError = null;
    }
    if (this.chargeMaterialForm.controls.percentChargeReacted.value < 0 || this.chargeMaterialForm.controls.percentChargeReacted.value > 100) {
      this.chargeSolidReactedError = 'Charge Reacted must be equal or greater than 0 and less than or equal to 100%';
    } else {
      this.chargeSolidReactedError = null;
    }
    if (this.chargeMaterialForm.controls.heatOfReaction.value < 0) {
      this.heatOfReactionError = 'Heat of Reaction cannot be less than zero. For exothermic reactions, change "Endothermic/Exothermic"';
    } else {
      this.heatOfReactionError = null;
    }

    if ((this.chargeMaterialForm.controls.chargeMaterialDischargeTemperature.value > this.chargeMaterialForm.controls.materialMeltingPoint.value) && this.chargeMaterialForm.controls.percentChargeMelted.value == 0) {
      this.dischargeTempError = 'The discharge temperature is higher than the melting point, please enter proper percentage for charge melted.';
    } else if ((this.chargeMaterialForm.controls.chargeMaterialDischargeTemperature.value < this.chargeMaterialForm.controls.materialMeltingPoint.value) && this.chargeMaterialForm.controls.percentChargeMelted.value > 0) {
      this.dischargeTempError = 'The discharge temperature is lower than the melting point, the percentage for charge melted should be 0%.';
    } else {
      this.dischargeTempError = null;
    }

    if (this.specificHeatError || this.latentHeatError || this.heatOfLiquidError || this.feedRateError || this.waterChargedError || this.chargeMeltedError || this.chargeSolidReactedError || this.heatOfReactionError || this.dischargeTempError) {
      this.inputError.emit(true);
      this.chargeMaterialCompareService.inputError.next(true);
    } else {
      this.inputError.emit(false);
      this.chargeMaterialCompareService.inputError.next(false);
    }
  }

  startSavePolling() {
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }

  checkSpecificHeatOfSolid() {
    let material: SolidLoadChargeMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure == 'Metric') {
        material.specificHeatSolid = this.convertUnitsService.value(material.specificHeatSolid).from('btulbF').to('kJkgC')
      }
      material.specificHeatSolid = this.roundVal(material.specificHeatSolid, 4);
      if (material.specificHeatSolid != this.chargeMaterialForm.controls.materialSpecificHeatOfSolidMaterial.value) {
        return true;
      } else {
        return false;
      }
    }
  }
  checkLatentHeatOfFusion() {
    let material: SolidLoadChargeMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure == 'Metric') {
        let val = this.convertUnitsService.value(material.latentHeat).from('btuLb').to('kJkg')
        material.latentHeat = this.roundVal(val, 4);
      }
      if (material.latentHeat != this.chargeMaterialForm.controls.materialLatentHeatOfFusion.value) {
        return true;
      } else {
        return false;
      }
    }
  }
  checkHeatOfLiquid() {
    let material: SolidLoadChargeMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure == 'Metric') {
        let val = this.convertUnitsService.value(material.specificHeatLiquid).from('btulbF').to('kJkgC')
        material.specificHeatLiquid = this.roundVal(val, 4);
      }
      if (material.specificHeatLiquid != this.chargeMaterialForm.controls.materialHeatOfLiquid.value) {
        return true;
      } else {
        return false;
      }
    }
  }
  checkMeltingPoint() {
    let material: SolidLoadChargeMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure == 'Metric') {
        let val = this.convertUnitsService.value(material.meltingPoint).from('F').to('C')
        material.meltingPoint = this.roundVal(val, 4);
      }
      if (material.meltingPoint != this.chargeMaterialForm.controls.materialMeltingPoint.value) {
        return true;
      } else {
        return false;
      }
    }
  }
  canCompare() {
    if (this.chargeMaterialCompareService.baselineMaterials && this.chargeMaterialCompareService.modifiedMaterials) {
      if (this.chargeMaterialCompareService.compareMaterialType(this.lossIndex) == false) {
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

  showMaterialModal() {
    this.showModal = true;
    this.lossesService.modalOpen.next(true);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.materialTypes = this.suiteDbService.selectSolidLoadChargeMaterials();
      let newMaterial = this.materialTypes.filter(material => { return material.substance == event.substance })
      if (newMaterial.length != 0) {
        this.chargeMaterialForm.patchValue({
          materialId: newMaterial[0].id
        })
        this.setProperties();
      }
    }
    this.showModal = false;
    this.materialModal.hide();
    this.lossesService.modalOpen.next(false);
  }
}

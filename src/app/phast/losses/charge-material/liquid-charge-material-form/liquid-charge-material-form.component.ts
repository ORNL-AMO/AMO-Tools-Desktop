import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { ChargeMaterialCompareService } from '../charge-material-compare.service';
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { LiquidLoadChargeMaterial } from '../../../../shared/models/materials';

@Component({
  selector: 'app-liquid-charge-material-form',
  templateUrl: './liquid-charge-material-form.component.html',
  styleUrls: ['./liquid-charge-material-form.component.css']
})
export class LiquidChargeMaterialFormComponent implements OnInit {
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
  @Input()
  inSetup: boolean;

  @ViewChild('materialModal') public materialModal: ModalDirective;

  firstChange: boolean = true;
  materialTypes: any;
  selectedMaterial: any;

  initialTempError: string = null;
  dischargeTempError: string = null;
  specificHeatLiquidError: string = null;
  specificHeatVaporError: string = null;
  feedLiquidRateError: string = null;
  chargeVaporError: string = null;
  chargeReactedError: string = null;
  heatOfReactionError: string = null;
  materialLatentHeatError: string = null;
  inletOverVaporizingError: string = null;
  outletOverVaporizingError: string = null;
  showModal: boolean = false;
  constructor(private suiteDbService: SuiteDbService, private chargeMaterialCompareService: ChargeMaterialCompareService, private windowRefService: WindowRefService, private lossesService: LossesService, private convertUnitsService: ConvertUnitsService) { }

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
    this.materialTypes = this.suiteDbService.selectLiquidLoadChargeMaterials();
    if (this.chargeMaterialForm) {
      if (this.chargeMaterialForm.controls.materialId.value && this.chargeMaterialForm.controls.materialId.value != '') {
        if (this.chargeMaterialForm.controls.materialLatentHeat.value == '') {
          this.setProperties();
        }
      }
    }
    this.checkInputError(true);
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

    // this.chargeMaterialForm.disable();
  }

  enableForm() {
    this.chargeMaterialForm.controls.materialId.enable();
    this.chargeMaterialForm.controls.endothermicOrExothermic.enable();
    // this.chargeMaterialForm.enable();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }

  setProperties() {
    let selectedMaterial = this.suiteDbService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (this.settings.unitsOfMeasure == 'Metric') {
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
    if (this.chargeMaterialForm.controls.materialSpecificHeatLiquid.value < 0) {
      this.specificHeatLiquidError = 'Specific Heat of Liquid must be equal or greater than 0';
    } else {
      this.specificHeatLiquidError = null;
    }
    if (this.chargeMaterialForm.controls.materialSpecificHeatVapor.value < 0) {
      this.specificHeatVaporError = 'Specific Heat of Vapor must be equal or greater than 0';
    } else {
      this.specificHeatVaporError = null;
    }
    if (this.chargeMaterialForm.controls.feedRate.value < 0) {
      this.feedLiquidRateError = 'Charge Feed Rate must be greater than 0';
    } else {
      this.feedLiquidRateError = null;
    }
    if (this.chargeMaterialForm.controls.liquidVaporized.value < 0 || this.chargeMaterialForm.controls.liquidVaporized.value > 100) {
      this.chargeVaporError = 'Charge Liquid Vaporized must be equal or greater than 0 and less than or equal to 100%';
    } else {
      this.chargeVaporError = null;
    }
    if (this.chargeMaterialForm.controls.liquidReacted.value < 0 || this.chargeMaterialForm.controls.liquidReacted.value > 100) {
      this.chargeReactedError = 'Charge Liquid Reacted must be equal or greater than 0 and less than or equal to 100%';
    } else {
      this.chargeReactedError = null;
    }
    if (this.chargeMaterialForm.controls.heatOfReaction.value < 0) {
      this.heatOfReactionError = 'Heat of Reaction cannot be less than zero. For exothermic reactions, change "Endothermic/Exothermic"';
    } else {
      this.heatOfReactionError = null;
    }
    if (this.chargeMaterialForm.controls.materialLatentHeat.value < 0) {
      this.materialLatentHeatError = 'Latent Heat of Vaporization must be equal or greater than 0';
    } else {
      this.materialLatentHeatError = null;
    }

    if ((this.chargeMaterialForm.controls.dischargeTemperature > this.chargeMaterialForm.controls.materialVaporizingTemperature.value) && this.chargeMaterialForm.controls.liquidVaporized.value == 0) {
      this.dischargeTempError = 'The discharge temperature is higher than the Vaporizing Temperature, please enter proper percentage for charge vaporized.';
    } else if ((this.chargeMaterialForm.controls.dischargeTemperature < this.chargeMaterialForm.controls.materialVaporizingTemperature.value) && this.chargeMaterialForm.controls.liquidVaporized.value > 0) {
      this.dischargeTempError = 'The discharge temperature is lower than the vaporizing temperature, the percentage for charge liquid vaporized should be 0%.';
    } else {
      this.dischargeTempError = null;
    }

    if (this.chargeMaterialForm.controls.initialTemperature.value > this.chargeMaterialForm.controls.dischargeTemperature.value) {
      this.initialTempError = "Initial Temperature cannot be greater than Outlet Temperature";
    }
    else {
      this.initialTempError = null;
    }

    if (this.chargeMaterialForm.controls.initialTemperature.value > this.chargeMaterialForm.controls.materialVaporizingTemperature.value && this.chargeMaterialForm.controls.liquidVaporized.value <= 0) {
      this.inletOverVaporizingError = "The initial temperature is higher than the vaporization point, please enter proper percentage for charge vaporized.";
    }
    else {
      this.inletOverVaporizingError = null;
    }
    if (this.chargeMaterialForm.controls.dischargeTemperature.value > this.chargeMaterialForm.controls.materialVaporizingTemperature.value && this.chargeMaterialForm.controls.liquidVaporized.value <= 0) {
      this.outletOverVaporizingError = "The discharge temperature is higher than the vaporization point, please enter proper percentage for charge vaporized.";
    }
    else {
      this.outletOverVaporizingError = null;
    }

    if (this.initialTempError || this.specificHeatLiquidError || this.specificHeatVaporError || this.feedLiquidRateError || this.chargeVaporError || this.chargeReactedError || this.heatOfReactionError || this.materialLatentHeatError || this.dischargeTempError) {
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
  checkSpecificHeatDiffLiquid() {
    let material: LiquidLoadChargeMaterial = this.suiteDbService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure == 'Metric') {
        let val = this.convertUnitsService.value(material.specificHeatLiquid).from('btulbF').to('kJkgC');
        material.specificHeatLiquid = this.roundVal(val, 4);
      }
      if (material.specificHeatLiquid != this.chargeMaterialForm.controls.materialSpecificHeatLiquid.value) {
        return true;
      } else {
        return false;
      }
    }
  }

  checkVaporizingTempDiff() {
    let material: LiquidLoadChargeMaterial = this.suiteDbService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure == 'Metric') {
        let val = this.convertUnitsService.value(material.vaporizationTemperature).from('F').to('C');
        material.vaporizationTemperature = this.roundVal(val, 4);
      }
      if (material.vaporizationTemperature != this.chargeMaterialForm.controls.materialVaporizingTemperature.value) {
        return true;
      } else {
        return false;
      }
    }
  }

  checkLatentHeatDiff() {
    let material: LiquidLoadChargeMaterial = this.suiteDbService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure == 'Metric') {
        let val = this.convertUnitsService.value(material.latentHeat).from('btuLb').to('kJkg');
        material.latentHeat = this.roundVal(val, 4);
      }
      if (material.latentHeat != this.chargeMaterialForm.controls.materialLatentHeat.value) {
        return true;
      } else {
        return false;
      }
    }
  }

  checkSpecificHeatVaporDiff() {
    let material: LiquidLoadChargeMaterial = this.suiteDbService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure == 'Metric') {
        let val = this.convertUnitsService.value(material.specificHeatVapor).from('btulbF').to('kJkgC');
        material.specificHeatVapor = this.roundVal(val, 4);
      }
      if (material.specificHeatVapor != this.chargeMaterialForm.controls.materialSpecificHeatVapor.value) {
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
      if (this.chargeMaterialCompareService.compareMaterialType(this.lossIndex) == false) {
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
  checkLiquidVaporizedDiff(){
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareLiquidPercentVaporized(this.lossIndex);
    } else {
      return false;
    }
  }
  checkMaterialDiff(){
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareLiquidMaterialId(this.lossIndex);
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
      this.materialTypes = this.suiteDbService.selectLiquidLoadChargeMaterials();
      let newMaterial = this.materialTypes.filter(material => { return material.substance == event.substance })
      if (newMaterial.length != 0) {
        this.chargeMaterialForm.patchValue({
          materialId: newMaterial[0].id
        })
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.showModal = false;
    this.lossesService.modalOpen.next(false);
  }
}

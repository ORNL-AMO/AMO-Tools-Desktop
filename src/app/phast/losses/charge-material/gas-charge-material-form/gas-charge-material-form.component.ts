import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { ChargeMaterialCompareService } from '../charge-material-compare.service';
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { PhastService } from "../../../phast.service";
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { GasLoadChargeMaterial } from '../../../../shared/models/materials';
import { IndexedDbService } from '../../../../indexedDb/indexed-db.service';
@Component({
  selector: 'app-gas-charge-material-form',
  templateUrl: './gas-charge-material-form.component.html',
  styleUrls: ['./gas-charge-material-form.component.css']
})
export class GasChargeMaterialFormComponent implements OnInit {
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
  showModal: boolean = false;

  initialTempError: string = null;
  dischargeTempError: string = null;
  specificHeatGasError: string = null;
  feedGasRateError: string = null;
  gasMixVaporError: string = null;
  specificHeatGasVaporError: string = null;
  feedGasReactedError: string = null;
  heatOfReactionError: string = null;
  constructor(private suiteDbService: SuiteDbService, private chargeMaterialCompareService: ChargeMaterialCompareService, private windowRefService: WindowRefService, private lossesService: LossesService, private convertUnitsService: ConvertUnitsService, private indexedDbService: IndexedDbService) { }

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
    this.materialTypes = this.suiteDbService.selectGasLoadChargeMaterials();
    if (this.chargeMaterialForm) {
      if (this.chargeMaterialForm.controls.materialId.value && this.chargeMaterialForm.controls.materialId.value != '') {
        if (this.chargeMaterialForm.controls.materialSpecificHeat.value == '') {
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

  checkMaterialValues() {
    let material: GasLoadChargeMaterial = this.suiteDbService.selectGasLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure == 'Metric') {
        let val = this.convertUnitsService.value(material.specificHeatVapor).from('btulbF').to('kJkgC')
        material.specificHeatVapor = this.roundVal(val, 4);
      }
      if (material.specificHeatVapor != this.chargeMaterialForm.controls.materialSpecificHeat.value) {
        return true;
      } else {
        return false;
      }
    }
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
    let selectedMaterial = this.suiteDbService.selectGasLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (this.settings.unitsOfMeasure == 'Metric') {
      selectedMaterial.specificHeatVapor = this.convertUnitsService.value(selectedMaterial.specificHeatVapor).from('btulbF').to('kJkgC');
    }
    this.chargeMaterialForm.patchValue({
      materialSpecificHeat: this.roundVal(selectedMaterial.specificHeatVapor, 4)
    });
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
    if (this.chargeMaterialForm.controls.materialSpecificHeat.value < 0) {
      this.specificHeatGasError = 'Specific Heat of Gas must be equal or greater than 0';
    } else {
      this.specificHeatGasError = null;
    }
    if (this.chargeMaterialForm.controls.feedRate.value < 0) {
      this.feedGasRateError = 'Feed Rate for Gas Mixture must be greater than 0';
    } else {
      this.feedGasRateError = null;
    }
    if (this.chargeMaterialForm.controls.vaporInGas.value < 0 || this.chargeMaterialForm.controls.vaporInGas.value > 100) {
      this.gasMixVaporError = 'Vapor in Gas Mixture must be equal or greater  than 0 and less than or equal to 100%';
    } else {
      this.gasMixVaporError = null;
    }
    if (this.chargeMaterialForm.controls.specificHeatOfVapor.value < 0) {
      this.specificHeatGasVaporError = 'Specific Heat of Vapor must be equal or greater than 0';
    } else {
      this.specificHeatGasVaporError = null;
    }
    if (this.chargeMaterialForm.controls.gasReacted.value < 0 || this.chargeMaterialForm.controls.gasReacted.value > 100) {
      this.feedGasReactedError = 'Feed Gas Reacted must be equal or greater than 0 and less than or equal to 100%';
    } else {
      this.feedGasReactedError = null;
    }
    if (this.chargeMaterialForm.controls.heatOfReaction.value < 0) {
      this.heatOfReactionError = 'Heat of Reaction cannot be less than zero. For exothermic reactions, change "Endothermic/Exothermic"';
    } else {
      this.heatOfReactionError = null;
    }

    if (this.chargeMaterialForm.controls.initialTemperature.value > this.chargeMaterialForm.controls.dischargeTemperature.value) {
      this.initialTempError = "Initial Temperature cannot be greater than Outlet Temperature";
    }
    else {
      this.initialTempError = null;
    }

    if (this.initialTempError || this.specificHeatGasError || this.feedGasRateError || this.gasMixVaporError || this.specificHeatGasVaporError || this.feedGasReactedError || this.heatOfReactionError) {
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
  compareGasMaterialId() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareGasMaterialId(this.lossIndex);
    } else {
      return false;
    }
  }
  compareGasThermicReactionType() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareGasThermicReactionType(this.lossIndex);
    } else {
      return false;
    }
  }
  compareGasSpecificHeatGas() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareGasSpecificHeatGas(this.lossIndex);
    } else {
      return false;
    }
  }
  compareGasFeedRate() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareGasFeedRate(this.lossIndex);
    } else {
      return false;
    }
  }
  compareGasPercentVapor() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareGasPercentVapor(this.lossIndex);
    } else {
      return false;
    }
  }
  compareGasInitialTemperature() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareGasInitialTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareGasDischargeTemperature() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareGasDischargeTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareGasSpecificHeatVapor() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareGasSpecificHeatVapor(this.lossIndex);
    } else {
      return false;
    }
  }
  compareGasPercentReacted() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareGasPercentReacted(this.lossIndex);
    } else {
      return false;
    }
  }
  compareGasReactionHeat() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareGasReactionHeat(this.lossIndex);
    } else {
      return false;
    }
  }
  compareGasAdditionalHeat() {
    if (this.canCompare()) {
      return this.chargeMaterialCompareService.compareGasAdditionalHeat(this.lossIndex);
    } else {
      return false;
    }
  }

  showMaterialModal() {
    this.showModal = true;
    this.lossesService.modalOpen.next(this.showModal);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.materialTypes = this.suiteDbService.selectGasLoadChargeMaterials();
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
    this.lossesService.modalOpen.next(this.showModal);
    this.calculate.emit(true);
  }
}

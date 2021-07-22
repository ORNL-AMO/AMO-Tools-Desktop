import { Component, OnInit, Input, EventEmitter, Output, ViewChild, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { ChargeMaterialCompareService } from '../charge-material-compare.service';
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { GasLoadChargeMaterial } from '../../../../shared/models/materials';

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
  @Input()
  inSetup: boolean;
  @Input()
  isBaseline: boolean;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;

  materialTypes: Array<GasLoadChargeMaterial>;
  showModal: boolean = false;
  idString: string;
  constructor(private suiteDbService: SuiteDbService, private chargeMaterialCompareService: ChargeMaterialCompareService, private lossesService: LossesService, private convertUnitsService: ConvertUnitsService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.isBaseline) {
      this.idString = 'phast_modification_solid_' + this.lossIndex;
    }
    else {
      this.idString = 'phast_baseline_solid_' + this.lossIndex;
    }
    if (changes.baselineSelected) {
      if (!changes.baselineSelected.firstChange) {
        if (!this.baselineSelected) {
          this.disableForm();
        } else {
          this.materialTypes = this.suiteDbService.selectGasLoadChargeMaterials();
          this.enableForm();
        }
      }
    }
  }
  ngOnInit() {
    this.materialTypes = this.suiteDbService.selectGasLoadChargeMaterials();
    if (this.chargeMaterialForm) {
      if (this.chargeMaterialForm.controls.materialId.value && this.chargeMaterialForm.controls.materialId.value !== '') {
        if (this.chargeMaterialForm.controls.materialSpecificHeat.value === '') {
          this.setProperties();
        }
      }
    }
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }

  ngOnDestroy() {
    this.lossesService.modalOpen.next(false);
  }

  checkMaterialValues() {
    let material: GasLoadChargeMaterial = this.suiteDbService.selectGasLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.specificHeatVapor).from('btulbF').to('kJkgC');
        material.specificHeatVapor = this.roundVal(val, 4);
      }
      if (material.specificHeatVapor !== this.chargeMaterialForm.controls.materialSpecificHeat.value) {
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
    let selectedMaterial: GasLoadChargeMaterial = this.suiteDbService.selectGasLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (selectedMaterial) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        selectedMaterial.specificHeatVapor = this.convertUnitsService.value(selectedMaterial.specificHeatVapor).from('btulbF').to('kJkgC');
      }
      this.chargeMaterialForm.patchValue({
        materialSpecificHeat: this.roundVal(selectedMaterial.specificHeatVapor, 4)
      });
    }
    this.save();
  }

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  save() {
    this.saveEmit.emit(true);
    this.calculate.emit(true);
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
    this.lossesService.modalOpen.next(this.showModal);
    this.calculate.emit(true);
  }
}

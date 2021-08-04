import { Component, OnInit, Input, EventEmitter, Output, ViewChild, SimpleChanges } from '@angular/core';
import { FixtureLossesCompareService } from "../fixture-losses-compare.service";
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { SolidLoadChargeMaterial } from '../../../../shared/models/materials';

@Component({
  selector: 'app-fixture-losses-form',
  templateUrl: './fixture-losses-form.component.html',
  styleUrls: ['./fixture-losses-form.component.css']
})
export class FixtureLossesFormComponent implements OnInit {
  @Input()
  lossesForm: FormGroup;
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

  materials: Array<SolidLoadChargeMaterial>;
  showModal: boolean = false;
  idString: string;
  constructor(private fixtureLossesCompareService: FixtureLossesCompareService, private suiteDbService: SuiteDbService, private lossesService: LossesService, private convertUnitsService: ConvertUnitsService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.baselineSelected) {
      if (!changes.baselineSelected.firstChange) {
        if (!this.baselineSelected) {
          this.disableForm();
        } else {
          this.materials = this.suiteDbService.selectSolidLoadChargeMaterials();
          this.enableForm();
        }
      }
    }
  }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.lossIndex;
    }
    else {
      this.idString = '_baseline_' + this.lossIndex;
    }
    this.materials = this.suiteDbService.selectSolidLoadChargeMaterials();
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }

  disableForm() {
    this.lossesForm.controls.materialName.disable();
  }

  enableForm() {
    this.lossesForm.controls.materialName.enable();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  focusOut() {
    this.changeField.emit('default');
  }

  setSpecificHeat() {
    let tmpMaterial: SolidLoadChargeMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.lossesForm.controls.materialName.value);
    if (tmpMaterial) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        tmpMaterial.specificHeatSolid = this.convertUnitsService.value(tmpMaterial.specificHeatSolid).from('btulbF').to('kJkgC');
      }
      this.lossesForm.patchValue({
        specificHeat: this.roundVal(tmpMaterial.specificHeatSolid, 3)
      });
    }
    this.save();
  }
  checkSpecificHeat() {
    if (this.lossesForm.controls.materialName.value) {
      let material: SolidLoadChargeMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.lossesForm.controls.materialName.value);
      if (material) {
        let val = material.specificHeatSolid;
        if (this.settings.unitsOfMeasure === 'Metric') {
          val = this.convertUnitsService.value(val).from('btulbF').to('kJkgC');
        }
        material.specificHeatSolid = this.roundVal(val, 3);
        if (material.specificHeatSolid !== this.lossesForm.controls.specificHeat.value) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  save() {
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }
  
  setProperties() {
    let selectedMaterial: SolidLoadChargeMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.lossesForm.controls.materialName.value);
    if (selectedMaterial) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        selectedMaterial.specificHeatSolid = this.convertUnitsService.value(selectedMaterial.specificHeatSolid).from('btulbF').to('kJkgC');
      }

      this.lossesForm.patchValue({
        specificHeat: this.roundVal(selectedMaterial.specificHeatSolid, 4)
      });
    }
    this.calculate.emit(true);
  }
  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }
  showMaterialModal() {
    this.showModal = true;
    this.lossesService.modalOpen.next(true);
    this.materialModal.show();
  }
  hideMaterialModal(event?: any) {
    if (event) {
      this.materials = this.suiteDbService.selectSolidLoadChargeMaterials();
      let newMaterial: SolidLoadChargeMaterial = this.materials.find(material => { return material.substance === event.substance; });
      if (newMaterial) {
        this.lossesForm.patchValue({
          materialName: newMaterial.id
        });
        this.setProperties();
      }
    }
    this.showModal = false;
    this.materialModal.hide();
    this.lossesService.modalOpen.next(false);
  }
  canCompare() {
    if (this.fixtureLossesCompareService.baselineFixtureLosses && this.fixtureLossesCompareService.modifiedFixtureLosses && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }
  compareFeedRate(): boolean {
    if (this.canCompare()) {
      return this.fixtureLossesCompareService.compareFeedRate(this.lossIndex);
    } else {
      return false;
    }
  }
  compareInitialTemperature(): boolean {
    if (this.canCompare()) {
      return this.fixtureLossesCompareService.compareInitialTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareFinalTemperature(): boolean {
    if (this.canCompare()) {
      return this.fixtureLossesCompareService.compareFinalTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareCorrectionFactor(): boolean {
    if (this.canCompare()) {
      return this.fixtureLossesCompareService.compareCorrectionFactor(this.lossIndex);
    } else {
      return false;
    }
  }
  compareMaterialName(): boolean {
    if (this.canCompare()) {
      return this.fixtureLossesCompareService.compareMaterialName(this.lossIndex);
    } else {
      return false;
    }
  }


}

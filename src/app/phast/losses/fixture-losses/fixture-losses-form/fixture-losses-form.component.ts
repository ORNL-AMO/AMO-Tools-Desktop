import { Component, OnInit, Input, EventEmitter, Output, ViewChild, SimpleChanges } from '@angular/core';
import { FixtureLossesCompareService } from "../fixture-losses-compare.service";
import { ModalDirective } from 'ngx-bootstrap/modal';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { UntypedFormGroup } from '@angular/forms';
import { SolidLoadChargeMaterial } from '../../../../shared/models/materials';
import { SolidLoadMaterialDbService } from '../../../../indexedDb/solid-load-material-db.service';
import { firstValueFrom } from 'rxjs';
import { roundVal } from '../../../../shared/helperFunctions';

@Component({
  selector: 'app-fixture-losses-form',
  templateUrl: './fixture-losses-form.component.html',
  styleUrls: ['./fixture-losses-form.component.css'],
  standalone: false
})
export class FixtureLossesFormComponent implements OnInit {
  @Input()
  lossesForm: UntypedFormGroup;
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

  hasDeletedCustomMaterial: boolean = false;
  editExistingMaterial: boolean;
  existingMaterial: SolidLoadChargeMaterial;
  materials: Array<SolidLoadChargeMaterial> = [];
  showModal: boolean = false;
  idString: string;
  constructor(private fixtureLossesCompareService: FixtureLossesCompareService, private lossesService: LossesService, private convertUnitsService: ConvertUnitsService, private solidLoadMaterialDbService: SolidLoadMaterialDbService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.baselineSelected) {
      if (!changes.baselineSelected.firstChange) {
        if (!this.baselineSelected) {
          this.disableForm();
        } else {
          this.setMaterials(false);
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
    this.setMaterials(true);
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }

  async setMaterials(onInit) {
    this.materials = await firstValueFrom(this.solidLoadMaterialDbService.getAllWithObservable())
    if (this.lossesForm) {
      if (this.lossesForm.controls.materialName.value && this.lossesForm.controls.materialName.value !== '') {
        if (this.lossesForm.controls.specificHeat.value === '') {
          await this.setProperties();
        } else if (onInit) {
          this.checkForDeletedMaterial();
        }
      }
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

  checkSpecificHeat() {
    if (this.lossesForm.controls.materialName.value) {
      let material: SolidLoadChargeMaterial = this.getSelectedMaterial();
      if (material) {
        let specificHeatSolid: number = material.specificHeatSolid;
        if (this.settings.unitsOfMeasure === 'Metric') {
          specificHeatSolid = this.convertUnitsService.value(specificHeatSolid).from('btulbF').to('kJkgC');
        }
        specificHeatSolid = roundVal(specificHeatSolid, 4);
        if (specificHeatSolid !== this.lossesForm.controls.specificHeat.value) {
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

  checkForDeletedMaterial() {
    let selectedMaterial: SolidLoadChargeMaterial = this.getSelectedMaterial();
    if (!selectedMaterial) {
      this.hasDeletedCustomMaterial = true;
      this.restoreMaterial();
    }
  }

  async restoreMaterial() {
    let customMaterial: SolidLoadChargeMaterial = {
      latentHeat: this.lossesForm.controls.latentHeat.value,
      meltingPoint: this.lossesForm.controls.meltingPoint.value,
      specificHeatLiquid: this.lossesForm.controls.specificHeatLiquid.value,
      specificHeatSolid: this.lossesForm.controls.specificHeat.value,
      substance: "Custom Fixture Material"
    };
    await firstValueFrom(this.solidLoadMaterialDbService.addWithObservable(customMaterial));
    await this.setMaterials(false);
    let newMaterial: SolidLoadChargeMaterial = this.materials.find(material => { return material.substance === customMaterial.substance; });
    this.lossesForm.patchValue({
      materialName: newMaterial.id
    });
    await this.save();
  }

  async setProperties() {
    let selectedMaterial: SolidLoadChargeMaterial = this.getSelectedMaterial();
    if (selectedMaterial) {
      let specificHeatSolid: number = selectedMaterial.specificHeatSolid;
      let latentHeat: number = selectedMaterial.latentHeat;
      let meltingPoint: number = selectedMaterial.meltingPoint;
      let specificHeatLiquid: number = selectedMaterial.specificHeatLiquid;
      if (this.settings.unitsOfMeasure === 'Metric') {
        specificHeatSolid = this.convertUnitsService.value(specificHeatSolid).from('btulbF').to('kJkgC');
        latentHeat = this.convertUnitsService.value(latentHeat).from('btuLb').to('kJkg');
        meltingPoint = this.convertUnitsService.value(meltingPoint).from('F').to('C');
        specificHeatLiquid = this.convertUnitsService.value(specificHeatLiquid).from('btulbF').to('kJkgC');
      }

      this.lossesForm.patchValue({
        specificHeat: roundVal(specificHeatSolid, 4),
        meltingPoint: meltingPoint,
        specificHeatLiquid: specificHeatLiquid,
        latentHeat: latentHeat
      });
    }
    await this.save();
  }

  showMaterialModal(editExistingMaterial: boolean) {
    this.editExistingMaterial = editExistingMaterial;
    if (editExistingMaterial === true) {
      this.existingMaterial = {
        id: this.lossesForm.controls.materialName.value,
        latentHeat: this.lossesForm.controls.latentHeat.value,
        meltingPoint: this.lossesForm.controls.meltingPoint.value,
        specificHeatLiquid: this.lossesForm.controls.specificHeatLiquid.value,
        specificHeatSolid: this.lossesForm.controls.specificHeat.value,
        substance: "Custom Fixture Material"
      };
    }
    this.showModal = true;
    this.lossesService.modalOpen.next(true);
    this.materialModal.show();
  }
  async hideMaterialModal(event?: any) {
    if (event) {
      await this.setMaterials(false);
      let newMaterial: SolidLoadChargeMaterial = this.materials.find(material => { return material.substance === event.substance; });
      if (newMaterial) {
        this.lossesForm.patchValue({
          materialName: newMaterial.id
        });
        this.setProperties();
      }
    }
    this.showModal = false;
    this.dismissMessage();
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
  dismissMessage() {
    this.hasDeletedCustomMaterial = false;
  }

  getSelectedMaterial(): SolidLoadChargeMaterial {
    let selectedMaterial: SolidLoadChargeMaterial = this.materials.find(material => {
      return material.id == this.lossesForm.controls.materialName.value
    });
    return selectedMaterial;

  }
}

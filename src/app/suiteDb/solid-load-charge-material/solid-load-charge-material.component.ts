import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { SolidLoadChargeMaterial } from '../../shared/models/materials';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { SqlDbApiService } from '../../tools-suite-api/sql-db-api.service';
import { SolidLoadMaterialDbService } from '../../indexedDb/solid-load-material-db.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-solid-load-charge-material',
  templateUrl: './solid-load-charge-material.component.html',
  styleUrls: ['./solid-load-charge-material.component.css']
})
export class SolidLoadChargeMaterialComponent implements OnInit {

  @Output('closeModal')
  closeModal = new EventEmitter<SolidLoadChargeMaterial>();
  @Input()
  settings: Settings;
  @Input()
  editExistingMaterial: boolean;
  @Input()
  existingMaterial: SolidLoadChargeMaterial;
  @Input()
  deletingMaterial: boolean;
  @Output('hideModal')
  hideModal = new EventEmitter();

  newMaterial: SolidLoadChargeMaterial = {
    substance: 'New Material',
    latentHeat: 0,
    meltingPoint: 0,
    specificHeatLiquid: 0,
    specificHeatSolid: 0,
  };
  changeField: string = 'selectedMaterial';
  selectedMaterial: SolidLoadChargeMaterial;
  allMaterials: Array<SolidLoadChargeMaterial>;
  allCustomMaterials: Array<SolidLoadChargeMaterial>;
  isValidMaterialName: boolean = true;
  nameError: string = null;
  canAdd: boolean;
  idbEditMaterialId: number;
  sdbEditMaterialId: number;
  currentField: string = 'selectedMaterial';
  constructor(private sqlDbApiService: SqlDbApiService, private settingsDbService: SettingsDbService, private solidLoadMaterialDbService: SolidLoadMaterialDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.getByDirectoryId(1);
    }
    if (this.editExistingMaterial) {
      this.setAllMaterials();
    }
    else {
      this.canAdd = true;
      this.allMaterials = this.sqlDbApiService.selectSolidLoadChargeMaterials();
      this.checkMaterialName();
    }
  }

  async setAllMaterials() {
    this.allMaterials = this.sqlDbApiService.selectSolidLoadChargeMaterials();
    this.allCustomMaterials = await firstValueFrom(this.solidLoadMaterialDbService.getAllWithObservable());
    this.sdbEditMaterialId = _.find(this.allMaterials, (material) => { return this.existingMaterial.substance === material.substance; }).id;
    this.idbEditMaterialId = _.find(this.allCustomMaterials, (material) => { return this.existingMaterial.substance === material.substance; }).id;
    this.setExisting();
  }

  async addMaterial() {
    if (this.canAdd) {
      this.canAdd = false;
      if (this.settings.unitsOfMeasure === 'Metric') {
        this.newMaterial.meltingPoint = this.convertUnitsService.value(this.newMaterial.meltingPoint).from('C').to('F');
        this.newMaterial.specificHeatLiquid = this.convertUnitsService.value(this.newMaterial.specificHeatLiquid).from('kJkgC').to('btulbF');
        this.newMaterial.specificHeatSolid = this.convertUnitsService.value(this.newMaterial.specificHeatSolid).from('kJkgC').to('btulbF');
        this.newMaterial.latentHeat = this.convertUnitsService.value(this.newMaterial.latentHeat).from('kJkg').to('btuLb');
      }
      let suiteDbResult = this.sqlDbApiService.insertSolidLoadChargeMaterial(this.newMaterial);
      if (suiteDbResult === true) {
        await firstValueFrom(this.solidLoadMaterialDbService.addWithObservable(this.newMaterial));
        this.closeModal.emit(this.newMaterial);
      }
    }
  }

  async updateMaterial() {
    if (this.settings.unitsOfMeasure === 'Metric') {
      this.newMaterial.meltingPoint = this.convertUnitsService.value(this.newMaterial.meltingPoint).from('C').to('F');
      this.newMaterial.specificHeatLiquid = this.convertUnitsService.value(this.newMaterial.specificHeatLiquid).from('kJkgC').to('btulbF');
      this.newMaterial.specificHeatSolid = this.convertUnitsService.value(this.newMaterial.specificHeatSolid).from('kJkgC').to('btulbF');
      this.newMaterial.latentHeat = this.convertUnitsService.value(this.newMaterial.latentHeat).from('kJkg').to('btuLb');
    }
    this.newMaterial.id = this.sdbEditMaterialId;
    let suiteDbResult = this.sqlDbApiService.updateSolidLoadChargeMaterial(this.newMaterial);
    if (suiteDbResult === true) {
      //need to set id for idb to put updates
      this.newMaterial.id = this.idbEditMaterialId;
      await firstValueFrom(this.solidLoadMaterialDbService.updateWithObservable(this.newMaterial))
      this.closeModal.emit(this.newMaterial);
    }
  }

  async deleteMaterial() {
    if (this.deletingMaterial && this.existingMaterial) {
      let suiteDbResult = this.sqlDbApiService.deleteSolidLoadChargeMaterial(this.sdbEditMaterialId);
      if (suiteDbResult === true) {
        await firstValueFrom(this.solidLoadMaterialDbService.deleteByIdWithObservable(this.idbEditMaterialId));
        this.closeModal.emit(this.newMaterial);
      }
    }
  }

  setExisting() {
    if (this.editExistingMaterial && this.existingMaterial) {
      if (this.settings.unitsOfMeasure === "Metric") {
        this.newMaterial = {
          id: this.existingMaterial.id,
          substance: this.existingMaterial.substance,
          latentHeat: this.convertUnitsService.value(this.existingMaterial.latentHeat).from('btuLb').to('kJkg'),
          meltingPoint: this.convertUnitsService.value(this.existingMaterial.meltingPoint).from('F').to('C'),
          specificHeatLiquid: this.convertUnitsService.value(this.existingMaterial.specificHeatLiquid).from('btulbF').to('kJkgC'),
          specificHeatSolid: this.convertUnitsService.value(this.existingMaterial.specificHeatSolid).from('btulbF').to('kJkgC'),
        };
      }
      else {
        this.newMaterial = {
          id: this.existingMaterial.id,
          substance: this.existingMaterial.substance,
          latentHeat: this.existingMaterial.latentHeat,
          meltingPoint: this.existingMaterial.meltingPoint,
          specificHeatLiquid: this.existingMaterial.specificHeatLiquid,
          specificHeatSolid: this.existingMaterial.specificHeatSolid,
        };
      }
    }
    else if (this.selectedMaterial) {
      if (this.settings.unitsOfMeasure === "Metric") {
        this.newMaterial = {
          substance: this.selectedMaterial.substance + ' (mod)',
          latentHeat: this.convertUnitsService.value(this.selectedMaterial.latentHeat).from('btuLb').to('kJkg'),
          meltingPoint: this.convertUnitsService.value(this.selectedMaterial.meltingPoint).from('F').to('C'),
          specificHeatLiquid: this.convertUnitsService.value(this.selectedMaterial.specificHeatLiquid).from('btulbF').to('kJkgC'),
          specificHeatSolid: this.convertUnitsService.value(this.selectedMaterial.specificHeatSolid).from('btulbF').to('kJkgC'),
        };
      }
      else {
        this.newMaterial = {
          substance: this.selectedMaterial.substance + ' (mod)',
          latentHeat: this.selectedMaterial.latentHeat,
          meltingPoint: this.selectedMaterial.meltingPoint,
          specificHeatLiquid: this.selectedMaterial.specificHeatLiquid,
          specificHeatSolid: this.selectedMaterial.specificHeatSolid,
        };
      }
      this.checkMaterialName();
    }
  }

  checkEditMaterialName() {
    let test = _.filter(this.allMaterials, (material) => {
      if (material.id !== this.sdbEditMaterialId) {
        return material.substance.toLowerCase().trim() === this.newMaterial.substance.toLowerCase().trim();
      }
    });

    if (test.length > 0) {
      this.nameError = 'This name is in use by another material';
      this.isValidMaterialName = false;
    }
    else if (this.newMaterial.substance.toLowerCase().trim() === '') {
      this.nameError = 'The material must have a name';
      this.isValidMaterialName = false;
    }
    else {
      this.isValidMaterialName = true;
      this.nameError = null;
    }
  }

  checkMaterialName() {
    let test = _.filter(this.allMaterials, (material) => { return material.substance.toLowerCase().trim() === this.newMaterial.substance.toLowerCase().trim(); });
    if (test.length > 0) {
      this.nameError = 'Cannot have same name as existing material';
      this.isValidMaterialName = false;
    } else {
      this.isValidMaterialName = true;
      this.nameError = null;
    }
  }

  focusField(str: string) {
    this.currentField = str;
  }

  hideMaterialModal() {
    this.hideModal.emit();
  }


}

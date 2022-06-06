import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { LiquidLoadChargeMaterial } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
 
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { LiquidLoadMaterialDbService } from '../../indexedDb/liquid-load-material-db.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-liquid-load-charge-material',
  templateUrl: './liquid-load-charge-material.component.html',
  styleUrls: ['./liquid-load-charge-material.component.css']
})
export class LiquidLoadChargeMaterialComponent implements OnInit {
  @Output('closeModal')
  closeModal = new EventEmitter<LiquidLoadChargeMaterial>();
  @Input()
  settings: Settings;
  @Input()
  editExistingMaterial: boolean;
  @Input()
  existingMaterial: LiquidLoadChargeMaterial;
  @Input()
  deletingMaterial: boolean;
  @Output('hideModal')
  hideModal = new EventEmitter();


  newMaterial: LiquidLoadChargeMaterial = {
    latentHeat: 0,
    specificHeatLiquid: 0,
    specificHeatVapor: 0,
    substance: 'New Material',
    vaporizationTemperature: 0
  };
  currentField: string = 'selectedMaterial';
  selectedMaterial: LiquidLoadChargeMaterial;
  allMaterials: Array<LiquidLoadChargeMaterial>;
  allCustomMaterials: Array<LiquidLoadChargeMaterial>;
  isValidMaterialName: boolean = true;
  nameError: string = null;
  canAdd: boolean;
  idbEditMaterialId: number;
  sdbEditMaterialId: number;
  constructor(private suiteDbService: SuiteDbService, private settingsDbService: SettingsDbService, private liquidLoadMaterialDbService: LiquidLoadMaterialDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.getByDirectoryId(1);
    }

    if (this.editExistingMaterial) {
     this.setAllMaterials();
    }
    else {
      this.canAdd = true;
      this.allMaterials = this.suiteDbService.selectLiquidLoadChargeMaterials();
      this.checkMaterialName();
    }
  }

  async setAllMaterials() {
    this.allMaterials = this.suiteDbService.selectLiquidLoadChargeMaterials();
    this.allCustomMaterials = await firstValueFrom(this.liquidLoadMaterialDbService.getAllWithObservable());
    this.sdbEditMaterialId = _.find(this.allMaterials, (material) => { return this.existingMaterial.substance == material.substance }).id;
    this.idbEditMaterialId = _.find(this.allCustomMaterials, (material) => { return this.existingMaterial.substance == material.substance }).id; this.setExisting();
  }

  async addMaterial() {
    if (this.canAdd) {
      this.canAdd = false;
      if (this.settings.unitsOfMeasure == 'Metric') {
        this.newMaterial.vaporizationTemperature = this.convertUnitsService.value(this.newMaterial.vaporizationTemperature).from('C').to('F');
        this.newMaterial.latentHeat = this.convertUnitsService.value(this.newMaterial.latentHeat).from('kJkgC').to('btulbF');
        this.newMaterial.specificHeatLiquid = this.convertUnitsService.value(this.newMaterial.specificHeatLiquid).from('kJkgC').to('btulbF');
        this.newMaterial.specificHeatVapor = this.convertUnitsService.value(this.newMaterial.specificHeatVapor).from('kJkgC').to('btulbF');
      }
      let suiteDbResult = this.suiteDbService.insertLiquidLoadChargeMaterial(this.newMaterial);
      if (suiteDbResult == true) {
        await firstValueFrom(this.liquidLoadMaterialDbService.addWithObservable(this.newMaterial))
        this.closeModal.emit(this.newMaterial);
      }
    }
  }

  async updateMaterial() {
    if (this.settings.unitsOfMeasure == 'Metric') {
      this.newMaterial.vaporizationTemperature = this.convertUnitsService.value(this.newMaterial.vaporizationTemperature).from('C').to('F');
      this.newMaterial.latentHeat = this.convertUnitsService.value(this.newMaterial.latentHeat).from('kJkgC').to('btulbF');
      this.newMaterial.specificHeatLiquid = this.convertUnitsService.value(this.newMaterial.specificHeatLiquid).from('kJkgC').to('btulbF');
      this.newMaterial.specificHeatVapor = this.convertUnitsService.value(this.newMaterial.specificHeatVapor).from('kJkgC').to('btulbF');
    }
    this.newMaterial.id = this.sdbEditMaterialId;
    let suiteDbResult = this.suiteDbService.updateLiquidLoadChargeMaterial(this.newMaterial);
    if (suiteDbResult == true) {
      //need to set id for idb to put updates
      this.newMaterial.id = this.idbEditMaterialId;
      await firstValueFrom(this.liquidLoadMaterialDbService.updateWithObservable(this.newMaterial));
      this.closeModal.emit(this.newMaterial);
    }
  }

  async deleteMaterial() {
    if (this.deletingMaterial && this.existingMaterial) {
      let suiteDbResult = this.suiteDbService.deleteLiquidLoadChargeMaterial(this.sdbEditMaterialId);
      if (suiteDbResult == true) {
        await firstValueFrom(this.liquidLoadMaterialDbService.deleteByIdWithObservable(this.idbEditMaterialId));
        this.closeModal.emit(this.newMaterial);
      }
    }
  }

  setExisting() {
    if (this.editExistingMaterial && this.existingMaterial) {
      if (this.settings.unitsOfMeasure == 'Metric') {
        this.newMaterial = {
          id: this.existingMaterial.id,
          substance: this.existingMaterial.substance,
          latentHeat: this.convertUnitsService.value(this.existingMaterial.latentHeat).from('btulbF').to('kJkgC'),
          specificHeatLiquid: this.convertUnitsService.value(this.existingMaterial.specificHeatLiquid).from('btulbF').to('kJkgC'),
          specificHeatVapor: this.convertUnitsService.value(this.existingMaterial.specificHeatVapor).from('btulbF').to('kJkgC'),
          vaporizationTemperature: this.convertUnitsService.value(this.existingMaterial.vaporizationTemperature).from('F').to('C')
        }
      }
      else {
        this.newMaterial = {
          id: this.existingMaterial.id,
          substance: this.existingMaterial.substance,
          latentHeat: this.existingMaterial.latentHeat,
          specificHeatLiquid: this.existingMaterial.specificHeatLiquid,
          specificHeatVapor: this.existingMaterial.specificHeatVapor,
          vaporizationTemperature: this.existingMaterial.vaporizationTemperature
        }
      }
    }
    else if (this.selectedMaterial) {
      if (this.settings.unitsOfMeasure == 'Metric') {
        this.newMaterial = {
          substance: this.selectedMaterial.substance + ' (mod)',
          latentHeat: this.convertUnitsService.value(this.selectedMaterial.latentHeat).from('btulbF').to('kJkgC'),
          specificHeatLiquid: this.convertUnitsService.value(this.selectedMaterial.specificHeatLiquid).from('btulbF').to('kJkgC'),
          specificHeatVapor: this.convertUnitsService.value(this.selectedMaterial.specificHeatVapor).from('btulbF').to('kJkgC'),
          vaporizationTemperature: this.convertUnitsService.value(this.selectedMaterial.vaporizationTemperature).from('F').to('C')
        }
      }
      else {
        this.newMaterial = {
          substance: this.selectedMaterial.substance + ' (mod)',
          latentHeat: this.selectedMaterial.latentHeat,
          specificHeatLiquid: this.selectedMaterial.specificHeatLiquid,
          specificHeatVapor: this.selectedMaterial.specificHeatVapor,
          vaporizationTemperature: this.selectedMaterial.vaporizationTemperature
        }
      }
      this.checkMaterialName();
    }
  }

  checkEditMaterialName() {
    let test = _.filter(this.allMaterials, (material) => {
      if (material.id != this.sdbEditMaterialId) {
        return material.substance.toLowerCase().trim() == this.newMaterial.substance.toLowerCase().trim();
      }
    });

    if (test.length > 0) {
      this.nameError = 'This name is in use by another material';
      this.isValidMaterialName = false;
    }
    else if (this.newMaterial.substance.toLowerCase().trim() == '') {
      this.nameError = 'The material must have a name';
      this.isValidMaterialName = false;
    }
    else {
      this.isValidMaterialName = true;
      this.nameError = null;
    }
  }

  checkMaterialName() {
    let test = _.filter(this.allMaterials, (material) => { return material.substance.toLowerCase().trim() == this.newMaterial.substance.toLowerCase().trim() })
    if (test.length > 0) {
      this.nameError = 'Cannot have same name as existing material';
      this.isValidMaterialName = false;
    }
    else if (this.newMaterial.substance.toLowerCase().trim() == '') {
      this.nameError = 'The material must have a name';
      this.isValidMaterialName = false;
    }
    else {
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

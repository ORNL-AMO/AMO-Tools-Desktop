import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { AtmosphereSpecificHeat } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AtmosphereDbService } from '../../indexedDb/atmosphere-db.service';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-atmosphere-specific-heat-material',
  templateUrl: './atmosphere-specific-heat-material.component.html',
  styleUrls: ['./atmosphere-specific-heat-material.component.css']
})
export class AtmosphereSpecificHeatMaterialComponent implements OnInit {
  @Output('closeModal')
  closeModal = new EventEmitter<AtmosphereSpecificHeat>();
  @Input()
  settings: Settings;
  @Input()
  editExistingMaterial: boolean;
  @Input()
  existingMaterial: AtmosphereSpecificHeat;
  @Input()
  deletingMaterial: boolean;
  @Output('hideModal')
  hideModal = new EventEmitter();

  newMaterial: AtmosphereSpecificHeat = {
    substance: 'New Material',
    specificHeat: 0
  };
  selectedMaterial: AtmosphereSpecificHeat;
  allMaterials: Array<AtmosphereSpecificHeat>;
  allCustomMaterials: Array<AtmosphereSpecificHeat>;
  isValidMaterialName: boolean = true;
  nameError: string = null;
  canAdd: boolean;
  currentField: string = "selectedMaterial";
  idbEditMaterialId: number;
  sdbEditMaterialId: number;
  constructor(private suiteDbService: SuiteDbService, private settingsDbService: SettingsDbService, private atmosphereDbService: AtmosphereDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.getByDirectoryId(1);
    }

    if (this.editExistingMaterial) {
     this.setAllMaterials();
    }
    else {
      this.canAdd = true;
      this.allMaterials = this.suiteDbService.selectAtmosphereSpecificHeat();
      this.checkMaterialName();
    }
  }

  async setAllMaterials() {
    this.allMaterials = this.suiteDbService.selectAtmosphereSpecificHeat();
    this.allCustomMaterials = await firstValueFrom(this.atmosphereDbService.getAllWithObservable());
    this.sdbEditMaterialId = _.find(this.allMaterials, (material) => { return this.existingMaterial.substance === material.substance; }).id;
    this.idbEditMaterialId = _.find(this.allCustomMaterials, (material) => { return this.existingMaterial.substance === material.substance; }).id;
    this.setExisting();
  }

  async addMaterial() {
    if (this.canAdd) {
      this.canAdd = false;
      if (this.settings.unitsOfMeasure === 'Metric') {
        this.newMaterial.specificHeat = this.convertUnitsService.value(this.newMaterial.specificHeat).from('kJkgC').to('btulbF');
      }
      let suiteDbResult = this.suiteDbService.insertAtmosphereSpecificHeat(this.newMaterial);
      if (suiteDbResult === true) {
        let material: AtmosphereSpecificHeat = await firstValueFrom(this.atmosphereDbService.addWithObservable(this.newMaterial))
        this.closeModal.emit(this.newMaterial);
      }
    }
  }

  async updateMaterial() {
    if (this.settings.unitsOfMeasure === 'Metric') {
      this.newMaterial.specificHeat = this.convertUnitsService.value(this.newMaterial.specificHeat).from('kJkgC').to('btulbF');
    }
    this.newMaterial.id = this.sdbEditMaterialId;
    let suiteDbResult = this.suiteDbService.updateAtmosphereSpecificHeat(this.newMaterial);
    if (suiteDbResult === true) {
      //need to set id for idb to put updates
      this.newMaterial.id = this.idbEditMaterialId;
      await firstValueFrom(this.atmosphereDbService.updateWithObservable(this.newMaterial))
      this.closeModal.emit(this.newMaterial);
    }
  }

  async deleteMaterial() {
    if (this.deletingMaterial && this.existingMaterial) {
      let suiteDbResult = this.suiteDbService.deleteAtmosphereSpecificHeat(this.sdbEditMaterialId);
      if (suiteDbResult === true) {
        await firstValueFrom(this.atmosphereDbService.deleteByIdWithObservable(this.idbEditMaterialId));
        this.closeModal.emit(this.newMaterial);
      }
    }
  }

  setExisting() {
    if (this.editExistingMaterial && this.existingMaterial) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        this.newMaterial = {
          id: this.existingMaterial.id,
          substance: this.existingMaterial.substance,
          specificHeat: this.convertUnitsService.value(this.existingMaterial.specificHeat).from('btulbF').to('kJkgC')
        };
      }
      else {
        this.newMaterial = {
          id: this.existingMaterial.id,
          substance: this.existingMaterial.substance,
          specificHeat: this.existingMaterial.specificHeat
        };
      }
    }
    else if (this.selectedMaterial) {

      if (this.settings.unitsOfMeasure === 'Metric') {
        this.newMaterial = {
          substance: this.selectedMaterial.substance + ' (mod)',
          specificHeat: this.convertUnitsService.value(this.selectedMaterial.specificHeat).from('btulbF').to('kJkgC')
        };
      }
      else {
        this.newMaterial = {
          substance: this.selectedMaterial.substance + ' (mod)',
          specificHeat: this.selectedMaterial.specificHeat
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

  focusField(str: string) {
    this.currentField = str;
  }

  hideMaterialModal() {
    this.hideModal.emit();
  }


}

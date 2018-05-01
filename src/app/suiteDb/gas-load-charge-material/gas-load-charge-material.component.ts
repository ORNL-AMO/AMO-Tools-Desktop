import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { GasLoadChargeMaterial } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
@Component({
  selector: 'app-gas-load-charge-material',
  templateUrl: './gas-load-charge-material.component.html',
  styleUrls: ['./gas-load-charge-material.component.css']
})
export class GasLoadChargeMaterialComponent implements OnInit {
  @Output('closeModal')
  closeModal = new EventEmitter<GasLoadChargeMaterial>();
  @Input()
  settings: Settings;
  @Input()
  editExistingMaterial: boolean;
  @Input()
  existingMaterial: GasLoadChargeMaterial;
  @Output('hideModal')
  hideModal = new EventEmitter();


  newMaterial: GasLoadChargeMaterial = {
    substance: 'New Material',
    specificHeatVapor: 0.0
  };
  currentField: string = 'selectedMaterial';
  selectedMaterial: GasLoadChargeMaterial;
  allMaterials: Array<GasLoadChargeMaterial>;
  allCustomMaterials: Array<GasLoadChargeMaterial>;
  isValidMaterialName: boolean = true;
  nameError: string = null;
  canAdd: boolean;
  constructor(private suiteDbService: SuiteDbService, private settingsDbService: SettingsDbService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.getByDirectoryId(1);
    }

    if (this.editExistingMaterial) {
      console.log("we are editing");
      this.allMaterials = this.suiteDbService.selectGasLoadChargeMaterials();
      this.indexedDbService.getAllGasLoadChargeMaterial().then(idbResults => {
        this.allCustomMaterials = idbResults;
        this.editMaterial();
        this.setExisting();
        console.log('allMaterials.length = ' + this.allMaterials.length);
        console.log('allCustomMaterials.length = ' + this.allCustomMaterials.length);
        for (let i = 0; i < this.allCustomMaterials.length; i++) {
          console.log('allCustomMaterials[' + i + '].name,id = ' + this.allCustomMaterials[i].substance + ', ' + this.allCustomMaterials[i].id);
        }
        for (let i = 0; i < this.allMaterials.length; i++) {
          console.log('allMaterials[' + i + '].name,id = ' + this.allMaterials[i].substance + ', ' + this.allMaterials[i].id);
        }
      });
    }
    else {
      this.canAdd = true;
      this.allMaterials = this.suiteDbService.selectGasLoadChargeMaterials();
      this.checkMaterialName();
      // this.selectedMaterial = this.allMaterials[0];
    }
  }

  editMaterial() {
    if (this.existingMaterial !== null && this.existingMaterial !== undefined) {
      console.log('editMaterial() in modal');
      console.log('existingMaterial.id = ' + this.existingMaterial.id);
      console.log('existingMaterial.substance = ' + this.existingMaterial.substance);
    }
  }

  addMaterial() {
    if (this.canAdd) {
      this.canAdd = false;
      if (this.settings.unitsOfMeasure == 'Metric') {
        this.newMaterial.specificHeatVapor = this.convertUnitsService.value(this.newMaterial.specificHeatVapor).from('kJkgC').to('btulbF');
      }
      let suiteDbResult = this.suiteDbService.insertGasLoadChargeMaterial(this.newMaterial);
      if (suiteDbResult == true) {
        this.indexedDbService.addGasLoadChargeMaterial(this.newMaterial).then(idbResults => {
          this.closeModal.emit(this.newMaterial);
        })
      }
    }
  }

  updateMaterial() {
    console.log('updateMaterial()');
    this.closeModal.emit(this.newMaterial);
  }

  setExisting() {
    if (this.editExistingMaterial && this.existingMaterial) {
      if (this.settings.unitsOfMeasure == 'Metric') {
        this.newMaterial = {
          id: this.existingMaterial.id,
          substance: this.existingMaterial.substance,
          specificHeatVapor: this.convertUnitsService.value(this.existingMaterial.specificHeatVapor).from('btulbF').to('kJkgC')
        }
      }
      else {
        this.newMaterial = {
          id: this.existingMaterial.id,
          substance: this.existingMaterial.substance,
          specificHeatVapor: this.existingMaterial.specificHeatVapor
        }
      }
    }
    else if (this.selectedMaterial) {
      if (this.settings.unitsOfMeasure == 'Metric') {
        this.newMaterial = {
          substance: this.selectedMaterial.substance + ' (mod)',
          specificHeatVapor: this.convertUnitsService.value(this.selectedMaterial.specificHeatVapor).from('btulbF').to('kJkgC')
        }
      }
      else {
        this.newMaterial = {
          substance: this.selectedMaterial.substance + ' (mod)',
          specificHeatVapor: this.selectedMaterial.specificHeatVapor
        }
      }
      this.checkMaterialName();
    }
  }

  checkEditMaterialName() {
    let tmp = ((this.allMaterials.length - this.allCustomMaterials.length) - 1) + this.existingMaterial.id;
    let test = _.filter(this.allMaterials, (material) => {
      if (material.id != this.allMaterials[tmp].id) {
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

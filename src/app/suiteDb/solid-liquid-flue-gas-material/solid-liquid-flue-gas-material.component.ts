import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { SolidLiquidFlueGasMaterial } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { PhastService } from '../../phast/phast.service';
import { ConvertUnitsService } from "../../shared/convert-units/convert-units.service";
@Component({
  selector: 'app-solid-liquid-flue-gas-material',
  templateUrl: './solid-liquid-flue-gas-material.component.html',
  styleUrls: ['./solid-liquid-flue-gas-material.component.css']
})
export class SolidLiquidFlueGasMaterialComponent implements OnInit {
  @Output('closeModal')
  closeModal = new EventEmitter<SolidLiquidFlueGasMaterial>();
  @Input()
  settings: Settings;
  @Input()
  editExistingMaterial: boolean;
  @Input()
  existingMaterial: SolidLiquidFlueGasMaterial;
  @Input()
  deletingMaterial: boolean;
  @Output('hideModal')
  hideModal = new EventEmitter();

  newMaterial: SolidLiquidFlueGasMaterial = {
    substance: 'New Fuel',
    carbon: 0,
    hydrogen: 0,
    inertAsh: 0,
    moisture: 0,
    nitrogen: 0,
    o2: 0,
    sulphur: 0,
    heatingValue: 0
  };
  selectedMaterial: SolidLiquidFlueGasMaterial;
  allMaterials: Array<SolidLiquidFlueGasMaterial>;
  allCustomMaterials: Array<SolidLiquidFlueGasMaterial>;
  isValid: boolean;
  nameError: string = null;
  canAdd: boolean;
  isNameValid: boolean;
  currentField: string = 'selectedMaterial';
  difference: number = 0;
  differenceError: boolean = false;
  idbEditMaterialId: number;
  sdbEditMaterialId: number;
  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private phastService: PhastService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (this.editExistingMaterial) {
      this.allMaterials = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
      this.indexedDbService.getSolidLiquidFlueGasMaterials().then(idbResults => {
        this.allCustomMaterials = idbResults;
        this.sdbEditMaterialId = _.find(this.allMaterials, (material) => { return this.existingMaterial.substance == material.substance }).id;
        this.idbEditMaterialId = _.find(this.allCustomMaterials, (material) => { return this.existingMaterial.substance == material.substance }).id;
        this.setExisting();
        this.setHHV();
      });

    }
    else {
      this.canAdd = true;
      this.allMaterials = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
      this.checkMaterialName();
      this.setHHV();
    }
  }

  addMaterial() {
    if (this.canAdd) {
      this.convertDecimals();
      this.canAdd = false;
      if (this.settings.unitsOfMeasure === 'Metric') {
        this.newMaterial.heatingValue = this.convertUnitsService.value(this.newMaterial.heatingValue).from('kJkg').to('btuLb');
      }
      let suiteDbResult = this.suiteDbService.insertSolidLiquidFlueGasMaterial(this.newMaterial);
      if (suiteDbResult == true) {
        this.indexedDbService.addSolidLiquidFlueGasMaterial(this.newMaterial).then(idbResults => {
          this.closeModal.emit(this.newMaterial);
        })
      }
    }
  }

  updateMaterial() {
    this.convertDecimals();
    if (this.settings.unitsOfMeasure === 'Metric') {
      this.newMaterial.heatingValue = this.convertUnitsService.value(this.newMaterial.heatingValue).from('kJkg').to('btuLb');
    }
    this.newMaterial.id = this.sdbEditMaterialId;
    let suiteDbResult = this.suiteDbService.updateSolidLiquidFlueGasMaterial(this.newMaterial);
    if (suiteDbResult == true) {
      //need to set id for idb to put updates
      this.newMaterial.id = this.idbEditMaterialId;
      this.indexedDbService.putSolidLiquidFlueGasMaterial(this.newMaterial).then(val => {
        this.closeModal.emit(this.newMaterial);
      });
    }
  }

  deleteMaterial() {
    if (this.deletingMaterial && this.existingMaterial) {
      let suiteDbResult = this.suiteDbService.deleteSolidLiquidFlueGasMaterial(this.sdbEditMaterialId);
      if (suiteDbResult == true) {
        this.indexedDbService.deleteSolidLiquidFlueGasMaterial(this.idbEditMaterialId).then(val => {
          this.closeModal.emit(this.newMaterial);
        });
      }
    }
  }

  convertDecimals() {
      this.newMaterial = {
        substance: this.newMaterial.substance,
        carbon: this.newMaterial.carbon/100,
        hydrogen: this.newMaterial.hydrogen/100,
        inertAsh: this.newMaterial.inertAsh/100,
        moisture: this.newMaterial.moisture/100,
        nitrogen: this.newMaterial.nitrogen/100,
        o2: this.newMaterial.o2/100,
        sulphur: this.newMaterial.sulphur/100,
        heatingValue: this.newMaterial.heatingValue
      }
  }

  setExisting() {
    if (this.editExistingMaterial && this.existingMaterial) {
      this.newMaterial = {
        id: this.existingMaterial.id,
        substance: this.existingMaterial.substance,
        carbon: this.existingMaterial.carbon*100,
        hydrogen: this.existingMaterial.hydrogen*100,
        inertAsh: this.existingMaterial.inertAsh*100,
        moisture: this.existingMaterial.moisture*100,
        nitrogen: this.existingMaterial.nitrogen*100,
        o2: this.existingMaterial.o2*100,
        sulphur: this.existingMaterial.sulphur*100,
        heatingValue: 0
      }
      this.setHHV();
      this.checkEditMaterialName();
    }
    else if (this.selectedMaterial) {
      this.newMaterial = {
        substance: this.selectedMaterial.substance + ' (mod)',
        carbon: this.selectedMaterial.carbon*100,
        hydrogen: this.selectedMaterial.hydrogen*100,
        inertAsh: this.selectedMaterial.inertAsh*100,
        moisture: this.selectedMaterial.moisture*100,
        nitrogen: this.selectedMaterial.nitrogen*100,
        o2: this.selectedMaterial.o2*100,
        sulphur: this.selectedMaterial.sulphur*100,
        heatingValue: 0
      }
      this.setHHV();
      this.checkMaterialName();
    }
  }

  setHHV() {
    const tmpHeatingVals = this.phastService.flueGasByMassCalculateHeatingValue(this.newMaterial);
    this.getDiff();
    if (isNaN(tmpHeatingVals) === false) {
      this.isValid = true;
      this.newMaterial.heatingValue = tmpHeatingVals;
      if (this.settings.unitsOfMeasure === 'Metric') {
        this.newMaterial.heatingValue = this.convertUnitsService.value(tmpHeatingVals).from('btuLb').to('kJkg');
      }
    } else {
      this.isValid = false;
      this.newMaterial.heatingValue = 0;
    }
  }

  getDiff() {
    this.difference = 100 - this.newMaterial.carbon - this.newMaterial.hydrogen - this.newMaterial.inertAsh - this.newMaterial.moisture - this.newMaterial.nitrogen - this.newMaterial.o2 - this.newMaterial.sulphur;
    if (this.difference > .4 || this.difference < -.4) {
      this.differenceError = true;
    } else {
      this.differenceError = false;
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
      this.isNameValid = false;
    }
    else if (this.newMaterial.substance.toLowerCase().trim() == '') {
      this.nameError = 'The material must have a name';
      this.isNameValid = false;
    }
    else {
      this.isNameValid = true;
      this.nameError = null;
    }
  }

  checkMaterialName() {
    let test = _.filter(this.allMaterials, (material) => { return material.substance.toLowerCase().trim() == this.newMaterial.substance.toLowerCase().trim() })
    if (test.length > 0) {
      this.nameError = 'Cannot have same name as existing material';
      this.isNameValid = false;
    } else {
      this.isNameValid = true;
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

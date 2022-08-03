import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { SolidLiquidFlueGasMaterial } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
 
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { PhastService } from '../../phast/phast.service';
import { ConvertUnitsService } from "../../shared/convert-units/convert-units.service";
import { SolidLiquidMaterialDbService } from '../../indexedDb/solid-liquid-material-db.service';
import { firstValueFrom } from 'rxjs';
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
    heatingValue: 0,
    ambientAirTempF: 65
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
  constructor(private suiteDbService: SuiteDbService, private solidLiquidMaterialDbService: SolidLiquidMaterialDbService, private phastService: PhastService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (this.editExistingMaterial) {
      this.setAllMaterials();
    }
    else {
      this.canAdd = true;
      this.allMaterials = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
      this.checkMaterialName();
      this.setHHV();
    }
  }

  async setAllMaterials() {
    this.allMaterials = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    this.allCustomMaterials = await firstValueFrom(this.solidLiquidMaterialDbService.getAllWithObservable());
    this.sdbEditMaterialId = _.find(this.allMaterials, (material) => { return this.existingMaterial.substance == material.substance }).id;
    this.idbEditMaterialId = _.find(this.allCustomMaterials, (material) => { return this.existingMaterial.substance == material.substance }).id;
    this.setExisting();
    this.setHHV();
  }

  async addMaterial() {
    if (this.canAdd) {
      this.convertDecimals();
      this.canAdd = false;
      if (this.settings.unitsOfMeasure === 'Metric') {
        this.newMaterial.heatingValue = this.convertUnitsService.value(this.newMaterial.heatingValue).from('kJkg').to('btuLb');
        this.newMaterial.ambientAirTempF = this.convertUnitsService.value(this.newMaterial.ambientAirTempF).from('C').to('F');
      }
      let suiteDbResult = this.suiteDbService.insertSolidLiquidFlueGasMaterial(this.newMaterial);
      if (suiteDbResult == true) {
        await firstValueFrom(this.solidLiquidMaterialDbService.addWithObservable(this.newMaterial))
        this.closeModal.emit(this.newMaterial);
      }
    }
  }

 async updateMaterial() {
    this.convertDecimals();
    if (this.settings.unitsOfMeasure === 'Metric') {
      this.newMaterial.heatingValue = this.convertUnitsService.value(this.newMaterial.heatingValue).from('kJkg').to('btuLb');
      this.newMaterial.ambientAirTempF = this.convertUnitsService.value(this.newMaterial.ambientAirTempF).from('C').to('F');
    }
    this.newMaterial.id = this.sdbEditMaterialId;
    let suiteDbResult = this.suiteDbService.updateSolidLiquidFlueGasMaterial(this.newMaterial);
    if (suiteDbResult == true) {
      //need to set id for idb to put updates
      this.newMaterial.id = this.idbEditMaterialId;
      await firstValueFrom(this.solidLiquidMaterialDbService.updateWithObservable(this.newMaterial));
      this.closeModal.emit(this.newMaterial);
    }
  }

 async deleteMaterial() {
    if (this.deletingMaterial && this.existingMaterial) {
      let suiteDbResult = this.suiteDbService.deleteSolidLiquidFlueGasMaterial(this.sdbEditMaterialId);
      if (suiteDbResult == true) {
        await firstValueFrom(this.solidLiquidMaterialDbService.deleteByIdWithObservable(this.idbEditMaterialId));
        this.closeModal.emit(this.newMaterial);
      }
    }
  }

  convertDecimals() {
    this.newMaterial = {
      substance: this.newMaterial.substance,
      carbon: this.fromPercent(this.newMaterial.carbon),
      hydrogen: this.fromPercent(this.newMaterial.hydrogen),
      inertAsh: this.fromPercent(this.newMaterial.inertAsh),
      moisture: this.fromPercent(this.newMaterial.moisture),
      nitrogen: this.fromPercent(this.newMaterial.nitrogen),
      o2: this.fromPercent(this.newMaterial.o2),
      sulphur: this.fromPercent(this.newMaterial.sulphur),
      heatingValue: this.newMaterial.heatingValue,
      ambientAirTempF: this.newMaterial.ambientAirTempF,
    }
  }

  fromPercent(num: number) {
    return Number((num / 100).toFixed(6));
  }
  
  setExisting() {
    if (this.editExistingMaterial && this.existingMaterial) {
      this.newMaterial = {
        id: this.existingMaterial.id,
        substance: this.existingMaterial.substance,
        carbon: this.toPercent(this.existingMaterial.carbon),
        hydrogen: this.toPercent(this.existingMaterial.hydrogen),
        inertAsh: this.toPercent(this.existingMaterial.inertAsh),
        moisture: this.toPercent(this.existingMaterial.moisture),
        nitrogen: this.toPercent(this.existingMaterial.nitrogen),
        o2: this.toPercent(this.existingMaterial.o2),
        sulphur: this.toPercent(this.existingMaterial.sulphur),
        heatingValue: 0,
        ambientAirTempF: this.existingMaterial.ambientAirTempF
      }
      this.setHHV();
      this.checkEditMaterialName();
    }
    else if (this.selectedMaterial) {
      this.newMaterial = {
        substance: this.selectedMaterial.substance + ' (mod)',
        carbon: this.toPercent(this.selectedMaterial.carbon),
        hydrogen: this.toPercent(this.selectedMaterial.hydrogen),
        inertAsh: this.toPercent(this.selectedMaterial.inertAsh),
        moisture: this.toPercent(this.selectedMaterial.moisture),
        nitrogen: this.toPercent(this.selectedMaterial.nitrogen),
        o2: this.toPercent(this.selectedMaterial.o2),
        sulphur: this.toPercent(this.selectedMaterial.sulphur),
        heatingValue: 0,
        ambientAirTempF: 65
      }
      this.setHHV();
      this.checkMaterialName();
    }
  }

  toPercent(num: number) {
    return Number((num * 100).toFixed(4));
  }

  setHHV() {
    const tmpHeatingVals = this.phastService.flueGasByMassCalculateHeatingValue(this.newMaterial);
    this.getDiff();
    if (isNaN(tmpHeatingVals) === false) {
      this.isValid = true;
      this.newMaterial.heatingValue = tmpHeatingVals;
      if (this.settings.unitsOfMeasure === 'Metric') {
        this.newMaterial.heatingValue = this.convertUnitsService.value(tmpHeatingVals).from('btuLb').to('kJkg');
        this.newMaterial.ambientAirTempF = this.convertUnitsService.value(this.newMaterial.ambientAirTempF).from('F').to('C');
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

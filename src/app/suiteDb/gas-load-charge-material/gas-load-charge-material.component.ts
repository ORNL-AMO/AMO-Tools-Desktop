import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { GasLoadChargeMaterial } from '../../shared/models/materials';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { firstValueFrom } from 'rxjs';
import { GasLoadMaterialDbService } from '../../indexedDb/gas-load-material-db.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-gas-load-charge-material',
  templateUrl: './gas-load-charge-material.component.html',
  styleUrls: ['./gas-load-charge-material.component.css'],
  standalone: false
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
  @Input()
  deletingMaterial: boolean;
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
  idbEditMaterialId: number;
  constructor(private settingsDbService: SettingsDbService, private gasLoadMaterialDbService: GasLoadMaterialDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.getByDirectoryId(1);
    }
    this.getMaterials();

  }

  async getMaterials() {
    this.allMaterials = await firstValueFrom(this.gasLoadMaterialDbService.getAllWithObservable());
    if (this.editExistingMaterial) {
      this.setAllMaterials();
    }
    else {
      this.canAdd = true;
      this.checkMaterialName();
    }
  }

  async setAllMaterials() {
    this.allCustomMaterials = await firstValueFrom(this.gasLoadMaterialDbService.getAllWithObservable());
    //id used by IDb
    this.idbEditMaterialId = _.find(this.allCustomMaterials, (material) => { return this.existingMaterial?.substance == material.substance })?.id;
    this.setExisting();
  }

  async addMaterial() {
    if (this.canAdd) {
      this.canAdd = false;
      if (this.settings.unitsOfMeasure == 'Metric') {
        this.newMaterial.specificHeatVapor = this.convertUnitsService.value(this.newMaterial.specificHeatVapor).from('kJkgC').to('btulbF');
      }
      await firstValueFrom(this.gasLoadMaterialDbService.addWithObservable(this.newMaterial));
      let materials: GasLoadChargeMaterial[] = await firstValueFrom(this.gasLoadMaterialDbService.getAllWithObservable());
      this.gasLoadMaterialDbService.dbGasLoadChargeMaterials.next(materials);
      this.closeModal.emit(this.newMaterial);
    }
  }

  async updateMaterial() {
    if (this.settings.unitsOfMeasure == 'Metric') {
      this.newMaterial.specificHeatVapor = this.convertUnitsService.value(this.newMaterial.specificHeatVapor).from('kJkgC').to('btulbF');
    }
    //need to set id for idb to put updates
    this.newMaterial.id = this.idbEditMaterialId;
    await firstValueFrom(this.gasLoadMaterialDbService.updateWithObservable(this.newMaterial))
    let materials: GasLoadChargeMaterial[] = await firstValueFrom(this.gasLoadMaterialDbService.getAllWithObservable());
    this.gasLoadMaterialDbService.dbGasLoadChargeMaterials.next(materials);
    this.closeModal.emit(this.newMaterial);
  }

  async deleteMaterial() {
    if (this.deletingMaterial && this.existingMaterial) {
      await firstValueFrom(this.gasLoadMaterialDbService.deleteByIdWithObservable(this.idbEditMaterialId));
      let materials: GasLoadChargeMaterial[] = await firstValueFrom(this.gasLoadMaterialDbService.getAllWithObservable());
      this.gasLoadMaterialDbService.dbGasLoadChargeMaterials.next(materials);
      this.closeModal.emit(this.newMaterial);
    }
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
    let test = _.filter(this.allMaterials, (material) => {
      if (material.id != this.idbEditMaterialId) {
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

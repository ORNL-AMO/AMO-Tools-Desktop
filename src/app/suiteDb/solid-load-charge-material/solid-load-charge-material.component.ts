import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { SolidLoadChargeMaterial } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

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
  isValidMaterialName: boolean = true;
  nameError: string = null;
  canAdd: boolean;
  currentField: string = 'selectedMaterial';
  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.canAdd = true;
    this.allMaterials = this.suiteDbService.selectSolidLoadChargeMaterials();
    this.checkMaterialName();
    // this.selectedMaterial = this.allMaterials[0];
    if (!this.settings) {
      this.indexedDbService.getSettings(1).then(results => {
        this.settings = results;
      })
    }
  }

  addMaterial() {
    if (this.canAdd) {
      this.canAdd = false;
      if (this.settings.unitsOfMeasure == 'Metric') {
        this.newMaterial.meltingPoint = this.convertUnitsService.value(this.newMaterial.meltingPoint).from('C').to('F');
        this.newMaterial.specificHeatLiquid = this.convertUnitsService.value(this.newMaterial.specificHeatLiquid).from('kJkgC').to('btulbF');
        this.newMaterial.specificHeatSolid = this.convertUnitsService.value(this.newMaterial.specificHeatSolid).from('kJkgC').to('btulbF');
        this.newMaterial.latentHeat = this.convertUnitsService.value(this.newMaterial.latentHeat).from('kJkg').to('btuLb');
      }
      let suiteDbResult = this.suiteDbService.insertSolidLoadChargeMaterial(this.newMaterial);
      if (suiteDbResult == true) {
        this.indexedDbService.addSolidLoadChargeMaterial(this.newMaterial).then(idbResults => {
          this.closeModal.emit(this.newMaterial);
        })
      }
    }
  }


  setExisting() {
    if (this.selectedMaterial) {
      if (this.settings.unitsOfMeasure == "Metric") {
        this.newMaterial = {
          substance: this.selectedMaterial.substance + ' (mod)',
          latentHeat: this.convertUnitsService.value(this.selectedMaterial.latentHeat).from('btuLb').to('kJkg'),
          meltingPoint: this.convertUnitsService.value(this.selectedMaterial.meltingPoint).from('F').to('C'),
          specificHeatLiquid: this.convertUnitsService.value(this.selectedMaterial.specificHeatLiquid).from('btulbF').to('kJkgC'),
          specificHeatSolid: this.convertUnitsService.value(this.selectedMaterial.specificHeatSolid).from('btulbF').to('kJkgC'),
        }
      }
      else {
        this.newMaterial = {
          substance: this.selectedMaterial.substance + ' (mod)',
          latentHeat: this.selectedMaterial.latentHeat,
          meltingPoint: this.selectedMaterial.meltingPoint,
          specificHeatLiquid: this.selectedMaterial.specificHeatLiquid,
          specificHeatSolid: this.selectedMaterial.specificHeatSolid,
        }
      }


      this.checkMaterialName();
    }
  }


  checkMaterialName() {
    let test = _.filter(this.allMaterials, (material) => { return material.substance.toLowerCase().trim() == this.newMaterial.substance.toLowerCase().trim() })
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

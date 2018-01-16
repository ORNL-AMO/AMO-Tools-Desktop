import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { LiquidLoadChargeMaterial } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { PhastService } from '../../phast/phast.service';

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
  isValidMaterialName: boolean = true;
  nameError: string = null;
  canAdd: boolean;
  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.canAdd = true;
    this.allMaterials = this.suiteDbService.selectLiquidLoadChargeMaterials();
    this.checkMaterialName();
    //this.selectedMaterial = this.allMaterials[0];
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

        this.newMaterial.vaporizationTemperature = this.convertUnitsService.value(this.newMaterial.vaporizationTemperature).from('C').to('F');
        this.newMaterial.latentHeat = this.convertUnitsService.value(this.newMaterial.latentHeat).from('kJkgC').to('btulbF');
        this.newMaterial.specificHeatLiquid = this.convertUnitsService.value(this.newMaterial.specificHeatLiquid).from('kJkgC').to('btulbF');
        this.newMaterial.specificHeatVapor = this.convertUnitsService.value(this.newMaterial.specificHeatVapor).from('kJkgC').to('btulbF');
      }
      let suiteDbResult = this.suiteDbService.insertLiquidLoadChargeMaterial(this.newMaterial);
      if (suiteDbResult == true) {
        this.indexedDbService.addLiquidLoadChargeMaterial(this.newMaterial).then(idbResults => {
          this.closeModal.emit(this.newMaterial);
        })
      }
    }
  }



  setExisting() {
    if (this.selectedMaterial) {
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

import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { GasLoadChargeMaterial } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
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
  @Output('hideModal')
  hideModal = new EventEmitter();


  newMaterial: GasLoadChargeMaterial = {
    substance: 'New Material',
    specificHeatVapor: 0.0
  };
  currentField: string = 'selectedMaterial';
  selectedMaterial: GasLoadChargeMaterial;
  allMaterials: Array<GasLoadChargeMaterial>;
  isValidMaterialName: boolean = true;
  nameError: string = null;
  canAdd: boolean;
  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.canAdd = true;
    this.allMaterials = this.suiteDbService.selectGasLoadChargeMaterials();
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


  setExisting() {
    if (this.selectedMaterial) {

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

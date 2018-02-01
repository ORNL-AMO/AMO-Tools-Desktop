import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { AtmosphereSpecificHeat } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
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
  @Output('hideModal')
  hideModal = new EventEmitter();

  newMaterial: AtmosphereSpecificHeat = {
    substance: 'New Material',
    specificHeat: 0
  };
  selectedMaterial: AtmosphereSpecificHeat;
  allMaterials: Array<AtmosphereSpecificHeat>;
  isValidMaterialName: boolean = true;
  nameError: string = null;
  canAdd: boolean;
  currentField: string = "selectedMaterial";
  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.canAdd = true;
    this.allMaterials = this.suiteDbService.selectAtmosphereSpecificHeat();
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
        this.newMaterial.specificHeat = this.convertUnitsService.value(this.newMaterial.specificHeat).from('kJkgC').to('btulbF');
      }
      let suiteDbResult = this.suiteDbService.insertAtmosphereSpecificHeat(this.newMaterial);
      if (suiteDbResult == true) {
        this.indexedDbService.addAtmosphereSpecificHeat(this.newMaterial).then(idbResults => {
          this.closeModal.emit(this.newMaterial);
        })
      }
    }
  }


  //debug
  setExisting() {
    if (this.selectedMaterial) {

      if (this.settings.unitsOfMeasure == 'Metric') {
        this.newMaterial = {
          substance: this.selectedMaterial.substance + ' (mod)',
          specificHeat: this.convertUnitsService.value(this.selectedMaterial.specificHeat).from('btulbF').to('kJkgC')
        }
      }
      else {
        this.newMaterial = {
          substance: this.selectedMaterial.substance + ' (mod)',
          specificHeat: this.selectedMaterial.specificHeat
        }
      }


    }
    this.checkMaterialName();
  }

  //real version
  // setExisting() {
  //   if (this.selectedMaterial) {
  //     this.newMaterial = {
  //       substance: this.selectedMaterial.substance + ' (mod)',
  //       specificHeat: this.selectedMaterial.specificHeat
  //     }
  //   }
  //   this.checkMaterialName();
  // }


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

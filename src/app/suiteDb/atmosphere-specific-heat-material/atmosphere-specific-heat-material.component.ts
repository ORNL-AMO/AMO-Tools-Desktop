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

  newMaterial: AtmosphereSpecificHeat = {
    substance: 'New Material',
    specificHeat: 0
  };
  selectedMaterial: AtmosphereSpecificHeat;
  allMaterials: Array<AtmosphereSpecificHeat>;
  isValidMaterialName: boolean = true;
  nameError: string = null;
  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
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

  setExisting() {
    if (this.selectedMaterial) {
      this.newMaterial = {
        substance: this.selectedMaterial.substance + ' (mod)',
        specificHeat: this.selectedMaterial.specificHeat
      }
    }
  }


  checkMaterialName() {
    let test = _.filter(this.allMaterials, (material) => { return material.substance == this.newMaterial.substance })
    if (test.length > 0) {
      this.nameError = 'Cannot have same name as existing material';
      this.isValidMaterialName = false;
    } else {
      this.isValidMaterialName = true;
      this.nameError = null;
    }
  }


}

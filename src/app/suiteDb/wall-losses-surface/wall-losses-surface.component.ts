import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { WallLossesSurface } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-wall-losses-surface',
  templateUrl: './wall-losses-surface.component.html',
  styleUrls: ['./wall-losses-surface.component.css']
})
export class WallLossesSurfaceComponent implements OnInit {
  @Output('closeModal')
  closeModal = new EventEmitter<WallLossesSurface>();
  @Input()
  settings: Settings;

  newMaterial: WallLossesSurface = {
    surface: 'New Surface',
    conditionFactor: 0
  };
  selectedMaterial: WallLossesSurface;
  allMaterials: Array<WallLossesSurface>;
  isValidMaterialName: boolean = true;
  nameError: string = null;
  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.allMaterials = this.suiteDbService.selectWallLossesSurface();
    this.checkMaterialName();
    // this.selectedMaterial = this.allMaterials[0];
    if (!this.settings) {
      this.indexedDbService.getSettings(1).then(results => {
        this.settings = results;
      })
    }
  }

  addMaterial() {
    let suiteDbResult = this.suiteDbService.insertWallLossesSurface(this.newMaterial);
    if (suiteDbResult == true) {
      this.indexedDbService.addWallLossesSurface(this.newMaterial).then(idbResults => {
        this.closeModal.emit(this.newMaterial);
      })
    }
  }

  setExisting() {
    if (this.selectedMaterial) {
      this.newMaterial = {
        surface: this.selectedMaterial.surface + ' (mod)',
        conditionFactor: this.selectedMaterial.conditionFactor
      }
    }
  }


  checkMaterialName() {
    let test = _.filter(this.allMaterials, (material) => { return material.surface == this.newMaterial.surface })
    if (test.length > 0) {
      this.nameError = 'Cannot have same name as existing surface';
      this.isValidMaterialName = false;
    } else {
      this.isValidMaterialName = true;
      this.nameError = null;
    }
  }

}

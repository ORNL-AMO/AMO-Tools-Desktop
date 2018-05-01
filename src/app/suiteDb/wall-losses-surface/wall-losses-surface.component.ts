import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { WallLossesSurface } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';

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
  @Input()
  editExistingMaterial: boolean;
  @Input()
  existingMaterial: WallLossesSurface;
  @Output('hideModal')
  hideModal = new EventEmitter();

  newMaterial: WallLossesSurface = {
    surface: 'New Surface',
    conditionFactor: 0
  };
  selectedMaterial: WallLossesSurface;
  allMaterials: Array<WallLossesSurface>;
  allCustomMaterials: Array<WallLossesSurface>;
  isValidMaterialName: boolean = true;
  nameError: string = null;
  canAdd: boolean;
  currentField: string = 'selectedMaterial';
  idbEditMaterialId: number;
  sdbEditMaterialId: number;
  constructor(private suiteDbService: SuiteDbService, private settingsDbService: SettingsDbService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.getByDirectoryId(1);
    }

    if (this.editExistingMaterial) {
      this.allMaterials = this.suiteDbService.selectWallLossesSurface();
      this.indexedDbService.getWallLossesSurface().then(idbResults => {
        this.allCustomMaterials = idbResults;
        this.sdbEditMaterialId = _.find(this.allMaterials, (material) => { return this.existingMaterial.surface == material.surface }).id;
        this.idbEditMaterialId = _.find(this.allCustomMaterials, (material) => { return this.existingMaterial.surface == material.surface }).id;
        this.setExisting();
      });
    }
    else {
      this.canAdd = true;
      this.allMaterials = this.suiteDbService.selectWallLossesSurface();
      this.checkMaterialName();
    }
  }

  addMaterial() {
    if (this.canAdd) {
      this.canAdd = false;
      let suiteDbResult = this.suiteDbService.insertWallLossesSurface(this.newMaterial);
      if (suiteDbResult == true) {
        this.indexedDbService.addWallLossesSurface(this.newMaterial).then(idbResults => {
          this.closeModal.emit(this.newMaterial);
        })
      }
    }
  }

  updateMaterial() {
    this.newMaterial.id = this.sdbEditMaterialId;
    let suiteDbResult = this.suiteDbService.updateWallLossesSurface(this.newMaterial);
    if (suiteDbResult == true) {
      //need to set id for idb to put updates
      this.newMaterial.id = this.idbEditMaterialId;
      this.indexedDbService.putWallLossesSurface(this.newMaterial).then(val => {
        this.closeModal.emit(this.newMaterial);
      });
    }
  }

  setExisting() {
    if (this.editExistingMaterial && this.existingMaterial) {
      this.newMaterial = {
        id: this.existingMaterial.id,
        surface: this.existingMaterial.surface,
        conditionFactor: this.existingMaterial.conditionFactor
      }
    }
    else if (this.selectedMaterial) {
      this.newMaterial = {
        surface: this.selectedMaterial.surface + ' (mod)',
        conditionFactor: this.selectedMaterial.conditionFactor
      }
      this.checkMaterialName();
    }
  }

  checkEditMaterialName() {
    let test = _.filter(this.allMaterials, (material) => {
      if (material.id != this.sdbEditMaterialId) {
        return material.surface.toLowerCase().trim() == this.newMaterial.surface.toLowerCase().trim();
      }
    });

    if (test.length > 0) {
      this.nameError = 'This name is in use by another material';
      this.isValidMaterialName = false;
    }
    else if (this.newMaterial.surface.toLowerCase().trim() == '') {
      this.nameError = 'The material must have a name';
      this.isValidMaterialName = false;
    }
    else {
      this.isValidMaterialName = true;
      this.nameError = null;
    }
  }


  checkMaterialName() {
    let test = _.filter(this.allMaterials, (material) => { return material.surface.toLowerCase().trim() == this.newMaterial.surface.toLowerCase().trim() })
    if (test.length > 0) {
      this.nameError = 'Cannot have same name as existing surface';
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

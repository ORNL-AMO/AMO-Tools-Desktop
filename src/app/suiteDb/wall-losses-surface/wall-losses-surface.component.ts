import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { WallLossesSurface } from '../../shared/models/materials';
import * as _ from 'lodash';
import { SqlDbApiService } from '../../tools-suite-api/sql-db-api.service';
import { Settings } from '../../shared/models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { firstValueFrom } from 'rxjs';
import { WallLossesSurfaceDbService } from '../../indexedDb/wall-losses-surface-db.service';

@Component({
    selector: 'app-wall-losses-surface',
    templateUrl: './wall-losses-surface.component.html',
    styleUrls: ['./wall-losses-surface.component.css'],
    standalone: false
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
  @Input()
  deletingMaterial: boolean;
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
  constructor(
    private sqlDbApiService: SqlDbApiService, private settingsDbService: SettingsDbService, private wallLossesSurfaceDbService: WallLossesSurfaceDbService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.getByDirectoryId(1);
    }

    if (this.editExistingMaterial) {
      this.allMaterials = this.sqlDbApiService.selectWallLossesSurface();
      this.getAllMaterials();
    }
    else {
      this.canAdd = true;
      this.allMaterials = this.sqlDbApiService.selectWallLossesSurface();
      this.checkMaterialName();
    }
  }

  async getAllMaterials() {
    this.allCustomMaterials = await firstValueFrom(this.wallLossesSurfaceDbService.getAllWithObservable());
    this.sdbEditMaterialId = _.find(this.allMaterials, (material) => { return this.existingMaterial.surface === material.surface; }).id;
    this.idbEditMaterialId = _.find(this.allCustomMaterials, (material) => { return this.existingMaterial.surface === material.surface; }).id;
    this.setExisting();
  }

  async addMaterial() {
    if (this.canAdd) {
      this.canAdd = false;
      let suiteDbResult = this.sqlDbApiService.insertWallLossesSurface(this.newMaterial);
      if (suiteDbResult === true) {
        await firstValueFrom(this.wallLossesSurfaceDbService.addWithObservable(this.newMaterial));
        let materials: WallLossesSurface[] = await firstValueFrom(this.wallLossesSurfaceDbService.getAllWithObservable());
        this.wallLossesSurfaceDbService.dbWallLossesSurfaceMaterials.next(materials);
        this.closeModal.emit(this.newMaterial);

      }
    }
  }

 async updateMaterial() {
    this.newMaterial.id = this.sdbEditMaterialId;
    let suiteDbResult = this.sqlDbApiService.updateWallLossesSurface(this.newMaterial);
    if (suiteDbResult === true) {
      //need to set id for idb to put updates
      this.newMaterial.id = this.idbEditMaterialId;
      await firstValueFrom(this.wallLossesSurfaceDbService.updateWithObservable(this.newMaterial));
      let materials: WallLossesSurface[] = await firstValueFrom(this.wallLossesSurfaceDbService.getAllWithObservable());
      this.wallLossesSurfaceDbService.dbWallLossesSurfaceMaterials.next(materials);
      this.closeModal.emit(this.newMaterial);
    }
  }

  async deleteMaterial() {
    if (this.deletingMaterial && this.existingMaterial) {
      let suiteDbResult = this.sqlDbApiService.deleteWallLossesSurface(this.sdbEditMaterialId);
      if (suiteDbResult === true) {
        await firstValueFrom(this.wallLossesSurfaceDbService.deleteByIdWithObservable(this.idbEditMaterialId));
        let materials: WallLossesSurface[] = await firstValueFrom(this.wallLossesSurfaceDbService.getAllWithObservable());
        this.wallLossesSurfaceDbService.dbWallLossesSurfaceMaterials.next(materials);
        this.closeModal.emit(this.newMaterial);
      }
    }
  }

  setExisting() {
    if (this.editExistingMaterial && this.existingMaterial) {
      this.newMaterial = {
        id: this.existingMaterial.id,
        surface: this.existingMaterial.surface,
        conditionFactor: this.existingMaterial.conditionFactor
      };
    }
    else if (this.selectedMaterial) {
      this.newMaterial = {
        surface: this.selectedMaterial.surface + ' (mod)',
        conditionFactor: this.selectedMaterial.conditionFactor
      };
      this.checkMaterialName();
    }
  }

  checkEditMaterialName() {
    let test = _.filter(this.allMaterials, (material) => {
      if (material.id !== this.sdbEditMaterialId) {
        return material.surface.toLowerCase().trim() === this.newMaterial.surface.toLowerCase().trim();
      }
    });

    if (test.length > 0) {
      this.nameError = 'This name is in use by another material';
      this.isValidMaterialName = false;
    }
    else if (this.newMaterial.surface.toLowerCase().trim() === '') {
      this.nameError = 'The material must have a name';
      this.isValidMaterialName = false;
    }
    else {
      this.isValidMaterialName = true;
      this.nameError = null;
    }
  }


  checkMaterialName() {
    let test = _.filter(this.allMaterials, (material) => { return material.surface.toLowerCase().trim() === this.newMaterial.surface.toLowerCase().trim(); });
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

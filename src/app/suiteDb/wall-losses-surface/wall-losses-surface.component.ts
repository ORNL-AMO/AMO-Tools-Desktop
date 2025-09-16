import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { WallLossesSurface } from '../../shared/models/materials';
import { Settings } from '../../shared/models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { firstValueFrom } from 'rxjs';
import { WallLossesSurfaceDbService } from '../../indexedDb/wall-losses-surface-db.service';
import { CustomMaterialsService } from '../custom-materials/custom-materials.service';

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
  existingMaterial: WallLossesSurface;
  @Input()
  deletingMaterial: boolean;
  @Output('hideModal')
  hideModal = new EventEmitter();

  activeMaterial: WallLossesSurface = {
    surface: 'New Surface',
    conditionFactor: 0
  };
  originalMaterial: WallLossesSurface;
  allMaterials: Array<WallLossesSurface>;
  nameError: string = null;
  currentField: string = 'selectedMaterial';
  idbEditMaterialId: number;
  constructor(private settingsDbService: SettingsDbService,
    private customMaterialsService: CustomMaterialsService,
    private wallLossesSurfaceDbService: WallLossesSurfaceDbService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.getByDirectoryId(1);
    }
    this.initMaterials();
  }

  async initMaterials() {
    this.allMaterials = await firstValueFrom(this.wallLossesSurfaceDbService.getAllWithObservable());
    this.originalMaterial = this.allMaterials?.[0];
    if (this.existingMaterial) {
      this.setActiveMaterial();
    }
  }

  async saveMaterial() {
    if (this.existingMaterial) {
      await firstValueFrom(this.wallLossesSurfaceDbService.updateWithObservable(this.activeMaterial));
    } else {
      let newMaterial = await firstValueFrom(this.wallLossesSurfaceDbService.addWithObservable(this.activeMaterial));
      this.activeMaterial.id = newMaterial.id;
    }
    this.updateMaterialsAndClose();
  }

  async deleteMaterial() {
    await firstValueFrom(this.wallLossesSurfaceDbService.deleteByIdWithObservable(this.activeMaterial.id));
    this.updateMaterialsAndClose();
  }

  async updateMaterialsAndClose() {
    let materials: WallLossesSurface[] = await firstValueFrom(this.wallLossesSurfaceDbService.getAllWithObservable());
    this.wallLossesSurfaceDbService.dbWallLossesSurfaceMaterials.next(materials);
    this.closeModal.emit(this.activeMaterial);
  }

  setActiveMaterial() {
    this.nameError = undefined;
    if (this.existingMaterial) {
      this.activeMaterial = {
        id: this.existingMaterial.id,
        surface: this.existingMaterial.surface,
        conditionFactor: this.existingMaterial.conditionFactor
      };
    } else if (this.originalMaterial) {
      this.activeMaterial = {
        surface: this.originalMaterial.surface + ' (Custom)',
        conditionFactor: this.originalMaterial.conditionFactor
      };
    }
  }

  setMaterialNameError() {
    this.nameError = this.customMaterialsService.getMaterialNameError(this.allMaterials, this.idbEditMaterialId, this.activeMaterial.surface, 'surface');
  }

  focusField(str: string) {
    this.currentField = str;
  }

  hideMaterialModal() {
    this.hideModal.emit();
  }

}

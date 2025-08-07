import { Component, OnInit, Input, ViewChild, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { WallLossesSurface } from '../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomMaterialsService } from '../custom-materials.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { WallLossesSurfaceDbService } from '../../../indexedDb/wall-losses-surface-db.service';

@Component({
    selector: 'app-custom-wall-losses-surfaces',
    templateUrl: './custom-wall-losses-surfaces.component.html',
    styleUrls: ['./custom-wall-losses-surfaces.component.css'],
    standalone: false
})
export class CustomWallLossesSurfacesComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  showModal: boolean;
  @Input()
  importing: boolean;
  @Output()
  emitNumMaterials: EventEmitter<number> = new EventEmitter<number>();
  
  editExistingMaterial: boolean = false;
  existingMaterial: WallLossesSurface;
  deletingMaterial: boolean = false;
  wallLossesSurfaces: Array<WallLossesSurface>;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  selectedSub: Subscription;
  selectAllSub: Subscription;
  constructor(private wallLossesSurfaceDbService: WallLossesSurfaceDbService, private customMaterialService: CustomMaterialsService) { }

  ngOnInit() {
    this.wallLossesSurfaces = new Array<WallLossesSurface>();
    this.getCustomMaterials();
    this.selectedSub = this.customMaterialService.getSelected.subscribe((val) => {
      if (val) {
        this.getSelected();
      }
    });

    this.selectAllSub = this.customMaterialService.selectAll.subscribe(val => {
      this.selectAll(val);
    });
  }

  ngOnDestroy() {
    this.selectAllSub.unsubscribe();
    this.selectedSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.showModal && !changes.showModal.firstChange) {
      if (changes.showModal.currentValue !== changes.showModal.previousValue) {
        this.showMaterialModal();
      }
    }
    if (changes.importing) {
      if (changes.importing.currentValue === false && changes.importing.previousValue === true) {
        this.getCustomMaterials();
      }
    }
  }
  
  async getCustomMaterials() {
    this.wallLossesSurfaces = await firstValueFrom(this.wallLossesSurfaceDbService.getAllCustomMaterials());
    this.emitNumMaterials.emit(this.wallLossesSurfaces.length);
  }

  editMaterial(id: number) {
    this.showMaterialModal(id);
  }

  deleteMaterial(id: number) {
    this.deletingMaterial = true;
    this.showMaterialModal(id);
  }

  async showMaterialModal(id?: number) {
    this.existingMaterial = id ? await firstValueFrom(this.wallLossesSurfaceDbService.getByIdWithObservable(id)) : undefined;
    this.showModal = true;
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    this.materialModal.hide();
    this.showModal = false;
    this.editExistingMaterial = false;
    this.deletingMaterial = false;
    this.getCustomMaterials();
  }

  getSelected() {
    let selected: Array<WallLossesSurface> = this.wallLossesSurfaces.filter((material) => { return material.selected === true; });
    this.customMaterialService.selectedWall = selected;
  }


  selectAll(val: boolean) {
    this.wallLossesSurfaces.forEach(surface => {
      surface.selected = val;
    });
  }
}

import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { WallLossesSurface } from '../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { CustomMaterialsService } from '../custom-materials.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-custom-wall-losses-surfaces',
  templateUrl: './custom-wall-losses-surfaces.component.html',
  styleUrls: ['./custom-wall-losses-surfaces.component.css']
})
export class CustomWallLossesSurfacesComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  showModal: boolean;
  @Input()
  importing: boolean;
  
  editExistingMaterial: boolean = false;
  existingMaterial: WallLossesSurface;
  deletingMaterial: boolean = false;
  wallLossesSurfaces: Array<WallLossesSurface>;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  selectedSub: Subscription;
  selectAllSub: Subscription;
  constructor(private indexedDbService: IndexedDbService, private customMaterialService: CustomMaterialsService) { }

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
  
  getCustomMaterials() {
    this.indexedDbService.getWallLossesSurface().then(idbResults => {
      this.wallLossesSurfaces = idbResults;
    });
  }

  editMaterial(id: number) {
    this.indexedDbService.getWallLossesSurfaceById(id).then(idbResults => {
      this.existingMaterial = idbResults;
      this.editExistingMaterial = true;
      this.showMaterialModal();
    });
  }

  deleteMaterial(id: number) {
    this.indexedDbService.getWallLossesSurfaceById(id).then(idbResults => {
      this.existingMaterial = idbResults;
      this.editExistingMaterial = true;
      this.deletingMaterial = true;
      this.showMaterialModal();
    });
  }

  showMaterialModal() {
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
    let selected: Array<WallLossesSurface> = _.filter(this.wallLossesSurfaces, (material) => { return material.selected === true; });
    this.customMaterialService.selectedWall = selected;
  }


  selectAll(val: boolean) {
    this.wallLossesSurfaces.forEach(surface => {
      surface.selected = val;
    });
  }
}

import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { WallLossesSurface } from '../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap';
import { SuiteDbService } from '../../suite-db.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

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

  editExistingMaterial: boolean = false;
  existingMaterial: WallLossesSurface;
  wallLossesSurfaces: Array<WallLossesSurface>;

  @ViewChild('materialModal') public materialModal: ModalDirective;

  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.getCustomMaterials();
  }

  getCustomMaterials() {
    this.wallLossesSurfaces = new Array<WallLossesSurface>();
    this.indexedDbService.getWallLossesSurface().then(idbResults => {
      this.wallLossesSurfaces = idbResults;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.showModal.firstChange) {
      if (changes.showModal.currentValue != changes.showModal.previousValue) {
        this.showMaterialModal();
      }
    }
  }

  editMaterial(id: number) {
    this.indexedDbService.getWallLossesSurfaceById(id).then(idbResults => {
      this.existingMaterial = idbResults;
      this.editExistingMaterial = true;
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
    this.getCustomMaterials();
  }
}

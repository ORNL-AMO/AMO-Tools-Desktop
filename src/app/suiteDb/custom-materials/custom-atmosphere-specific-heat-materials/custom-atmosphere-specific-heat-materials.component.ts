import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap';
import { AtmosphereSpecificHeat } from '../../../shared/models/materials';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { SuiteDbService } from '../../suite-db.service';

@Component({
  selector: 'app-custom-atmosphere-specific-heat-materials',
  templateUrl: './custom-atmosphere-specific-heat-materials.component.html',
  styleUrls: ['./custom-atmosphere-specific-heat-materials.component.css']
})
export class CustomAtmosphereSpecificHeatMaterialsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  showModal: boolean;

  editExistingMaterial: boolean = false;
  existingMaterial: AtmosphereSpecificHeat;
  deletingMaterial: boolean = false;
  atmosphereSpecificHeatMaterials: Array<AtmosphereSpecificHeat>;

  @ViewChild('materialModal') public materialModal: ModalDirective;

  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.getCustomMaterials();
  }

  getCustomMaterials() {
    this.atmosphereSpecificHeatMaterials = new Array<AtmosphereSpecificHeat>();
    this.indexedDbService.getAtmosphereSpecificHeat().then(idbResults => {
      this.atmosphereSpecificHeatMaterials = idbResults;
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
    this.indexedDbService.getAtmosphereSpecificHeatById(id).then(idbResults => {
      this.existingMaterial = idbResults;
      this.editExistingMaterial = true;
      this.showMaterialModal();
    });
  }

  deleteMaterial(id: number) {
    this.indexedDbService.getAtmosphereSpecificHeatById(id).then(idbResults => {
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
}

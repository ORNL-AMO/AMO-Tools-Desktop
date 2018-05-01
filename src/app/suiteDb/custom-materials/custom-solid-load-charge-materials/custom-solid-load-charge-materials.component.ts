import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SolidLoadChargeMaterial } from '../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap';
import { SuiteDbService } from '../../suite-db.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-custom-solid-load-charge-materials',
  templateUrl: './custom-solid-load-charge-materials.component.html',
  styleUrls: ['./custom-solid-load-charge-materials.component.css']
})
export class CustomSolidLoadChargeMaterialsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  showModal: boolean;

  solidChargeMaterials: Array<SolidLoadChargeMaterial>;
  editExistingMaterial: boolean = false;
  existingMaterial: SolidLoadChargeMaterial;
  @ViewChild('materialModal') public materialModal: ModalDirective;

  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.getCustomMaterials();
  }

  getCustomMaterials() {
    this.solidChargeMaterials = new Array<SolidLoadChargeMaterial>();
    this.indexedDbService.getAllSolidLoadChargeMaterial().then(idbResults => {
      this.solidChargeMaterials = idbResults;
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
    this.indexedDbService.getSolidLoadChargeMaterial(id).then(idbResults => {
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

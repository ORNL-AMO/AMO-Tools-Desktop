import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SolidLiquidFlueGasMaterial } from '../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap';
import { SuiteDbService } from '../../suite-db.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-custom-solid-liquid-flue-gas-materials',
  templateUrl: './custom-solid-liquid-flue-gas-materials.component.html',
  styleUrls: ['./custom-solid-liquid-flue-gas-materials.component.css']
})
export class CustomSolidLiquidFlueGasMaterialsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  showModal: boolean;

  solidLiquidFlueGasMaterials: Array<SolidLiquidFlueGasMaterial>;
  editExistingMaterial: boolean = false;
  deletingMaterial: boolean = false;
  existingMaterial: SolidLiquidFlueGasMaterial;
  @ViewChild('materialModal') public materialModal: ModalDirective;

  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.getCustomMaterials();
  }

  getCustomMaterials() {
    this.solidLiquidFlueGasMaterials = new Array<SolidLiquidFlueGasMaterial>();
    this.indexedDbService.getSolidLiquidFlueGasMaterials().then(idbResults => {
      this.solidLiquidFlueGasMaterials = idbResults;
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
    this.indexedDbService.getSolidLiquidFlueGasMaterialById(id).then(idbResults => {
      this.existingMaterial = idbResults;
      this.editExistingMaterial = true;
      this.showMaterialModal();
    });
  }

  deleteMaterial(id: number) {
    this.indexedDbService.getSolidLiquidFlueGasMaterialById(id).then(idbResults => {
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

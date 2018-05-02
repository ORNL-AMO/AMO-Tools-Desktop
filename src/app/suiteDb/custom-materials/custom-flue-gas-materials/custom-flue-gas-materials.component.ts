import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { FlueGasMaterial } from '../../../shared/models/materials';
import { Settings } from '../../../shared/models/settings';
import { LossesService } from '../../../phast/losses/losses.service';
import { ModalDirective } from 'ngx-bootstrap';
import { SuiteDbService } from '../../suite-db.service';

@Component({
  selector: 'app-custom-flue-gas-materials',
  templateUrl: './custom-flue-gas-materials.component.html',
  styleUrls: ['./custom-flue-gas-materials.component.css']
})
export class CustomFlueGasMaterialsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  showModal: boolean;

  @ViewChild('materialModal') public materialModal: ModalDirective;

  flueGasMaterials: Array<FlueGasMaterial>;
  editExistingMaterial: boolean = false;
  existingMaterial: FlueGasMaterial;
  deletingMaterial: boolean = false;
  options: any;


  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private lossesService: LossesService) { }

  ngOnInit() {
    this.getCustomMaterials();
  }

  getCustomMaterials() {
    this.flueGasMaterials = new Array<FlueGasMaterial>();
    this.indexedDbService.getFlueGasMaterials().then(idbResults => {
      this.flueGasMaterials = idbResults;
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
    this.indexedDbService.getFlueGasMaterialById(id).then(idbResults => {
      this.existingMaterial = idbResults;
      this.editExistingMaterial = true;
      this.showMaterialModal();
    });
  }

  deleteMaterial(id: number) {
    this.indexedDbService.getFlueGasMaterialById(id).then(idbResults => {
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

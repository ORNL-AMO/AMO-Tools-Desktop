import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SolidLiquidFlueGasMaterial } from '../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { CustomMaterialsService } from '../custom-materials.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

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
  @Input()
  importing: boolean;
  
  solidLiquidFlueGasMaterials: Array<SolidLiquidFlueGasMaterial>;
  editExistingMaterial: boolean = false;
  deletingMaterial: boolean = false;
  existingMaterial: SolidLiquidFlueGasMaterial;
  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  selectedSub: Subscription;
  selectAllSub: Subscription;
  constructor(private indexedDbService: IndexedDbService, private customMaterialService: CustomMaterialsService) { }

  ngOnInit() {
    this.solidLiquidFlueGasMaterials = new Array<SolidLiquidFlueGasMaterial>();
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
    this.indexedDbService.getSolidLiquidFlueGasMaterials().then(idbResults => {
      this.solidLiquidFlueGasMaterials = idbResults;
    });
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

  getSelected() {
    let selected: Array<SolidLiquidFlueGasMaterial> = _.filter(this.solidLiquidFlueGasMaterials, (material) => { return material.selected === true; });
    this.customMaterialService.selectedSolidLiquidFlueGas = selected;
  }
  selectAll(val: boolean) {
    this.solidLiquidFlueGasMaterials.forEach(material => {
      material.selected = val;
    });
  }
}

import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { FlueGasMaterial } from '../../../shared/models/materials';
import { Settings } from '../../../shared/models/settings';
import { LossesService } from '../../../phast/losses/losses.service';
import { ModalDirective } from 'ngx-bootstrap';
import { SuiteDbService } from '../../suite-db.service';
import { CustomMaterialsService } from '../custom-materials.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

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
  @Input()
  importing: boolean;

  @ViewChild('materialModal') public materialModal: ModalDirective;

  flueGasMaterials: Array<FlueGasMaterial>;
  editExistingMaterial: boolean = false;
  existingMaterial: FlueGasMaterial;
  deletingMaterial: boolean = false;
  options: any;
  selectedSub: Subscription;
  selectAllSub: Subscription;

  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private lossesService: LossesService, private customMaterialService: CustomMaterialsService) { }

  ngOnInit() {
    this.flueGasMaterials = new Array<FlueGasMaterial>();
    this.getCustomMaterials();
    this.customMaterialService.selectedFlueGas = new Array<FlueGasMaterial>();
    this.selectedSub = this.customMaterialService.getSelected.subscribe((val) => {
      if (val) {
        this.getSelected();
      }
    })
    this.selectAllSub = this.customMaterialService.selectAll.subscribe(val => {
      this.selectAll(val);
    })
  }

  ngOnDestroy(){
    this.selectAllSub.unsubscribe();
    this.selectedSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.showModal && !changes.showModal.firstChange) {
      if (changes.showModal.currentValue != changes.showModal.previousValue) {
        this.showMaterialModal();
      }
    }
    if(changes.importing){
      if(changes.importing.currentValue == false && changes.importing.previousValue == true){
        this.getCustomMaterials();
      }
    }
  }
  
  getCustomMaterials() {
    this.indexedDbService.getFlueGasMaterials().then(idbResults => {
      this.flueGasMaterials = idbResults;
    });
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

  getSelected() {
    let selected: Array<FlueGasMaterial> = _.filter(this.flueGasMaterials, (material) => { return material.selected == true });
    this.customMaterialService.selectedFlueGas = selected;
  }
  selectAll(val: boolean) {
    this.flueGasMaterials.forEach(material => {
      material.selected = val;
    })
  }
}

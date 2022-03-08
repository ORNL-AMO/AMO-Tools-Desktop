import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { GasLoadChargeMaterial } from '../../../shared/models/materials';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { CustomMaterialsService } from '../custom-materials.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-custom-gas-load-charge-materials',
  templateUrl: './custom-gas-load-charge-materials.component.html',
  styleUrls: ['./custom-gas-load-charge-materials.component.css']
})
export class CustomGasLoadChargeMaterialsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  showModal: boolean;
  @Input()
  importing: boolean;

  editExistingMaterial: boolean = false;
  existingMaterial: GasLoadChargeMaterial;
  deletingMaterial: boolean = false;
  gasChargeMaterials: Array<GasLoadChargeMaterial>;
  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  selectedSub: Subscription;
  selectAllSub: Subscription;

  constructor(private indexedDbService: IndexedDbService, private customMaterialService: CustomMaterialsService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.gasChargeMaterials = new Array<GasLoadChargeMaterial>();
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

  convertAllMaterials() {
    for (let i = 0; i < this.gasChargeMaterials.length; i++) {
      this.gasChargeMaterials[i].specificHeatVapor = this.convertUnitsService.value(this.gasChargeMaterials[i].specificHeatVapor).from('btulbF').to('kJkgC');
    }
  }

  getCustomMaterials() {
    this.indexedDbService.getAllGasLoadChargeMaterial().then(idbResults => {
      this.gasChargeMaterials = idbResults;
      if (this.settings.unitsOfMeasure === 'Metric') {
        this.convertAllMaterials();
      }
    });
  }

  editMaterial(id: number) {
    this.indexedDbService.getGasLoadChargeMaterial(id).then(idbResults => {
      this.existingMaterial = idbResults;
      this.editExistingMaterial = true;
      this.showMaterialModal();
    });
  }

  deleteMaterial(id: number) {
    this.indexedDbService.getGasLoadChargeMaterial(id).then(idbResults => {
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
    let selected: Array<GasLoadChargeMaterial> = _.filter(this.gasChargeMaterials, (material) => { return material.selected === true; });
    this.customMaterialService.selectedGasLoadCharge = selected;
  }

  selectAll(val: boolean) {
    this.gasChargeMaterials.forEach(material => {
      material.selected = val;
    });
  }
}

import { Component, OnInit, Input, ViewChild, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SolidLiquidFlueGasMaterial } from '../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomMaterialsService } from '../custom-materials.service';
import * as _ from 'lodash';
import { firstValueFrom, Subscription } from 'rxjs';
import { SolidLiquidMaterialDbService } from '../../../indexedDb/solid-liquid-material-db.service';

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
  @Output()
  emitNumMaterials: EventEmitter<number> = new EventEmitter<number>();
  
  solidLiquidFlueGasMaterials: Array<SolidLiquidFlueGasMaterial>;
  editExistingMaterial: boolean = false;
  deletingMaterial: boolean = false;
  existingMaterial: SolidLiquidFlueGasMaterial;
  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  selectedSub: Subscription;
  selectAllSub: Subscription;
  constructor(private solidLiquidMaterialDbService: SolidLiquidMaterialDbService, private customMaterialService: CustomMaterialsService) { }

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

  async getCustomMaterials() {
    this.solidLiquidFlueGasMaterials = await firstValueFrom(this.solidLiquidMaterialDbService.getAllWithObservable());
    this.emitNumMaterials.emit(this.solidLiquidFlueGasMaterials.length);
  }

  async editMaterial(id: number) {
    this.existingMaterial = await firstValueFrom(this.solidLiquidMaterialDbService.getByIdWithObservable(id));
    this.editExistingMaterial = true;
    this.showMaterialModal();
  }

  async deleteMaterial(id: number) {
    this.existingMaterial = await firstValueFrom(this.solidLiquidMaterialDbService.getByIdWithObservable(id));
    this.editExistingMaterial = true;
    this.deletingMaterial = true;
    this.showMaterialModal();
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

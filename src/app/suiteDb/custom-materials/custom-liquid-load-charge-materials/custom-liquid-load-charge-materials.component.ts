import { Component, OnInit, Input, ViewChild, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
 
import { LiquidLoadChargeMaterial } from '../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomMaterialsService } from '../custom-materials.service';
import * as _ from 'lodash';
import { firstValueFrom, Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { LiquidLoadMaterialDbService } from '../../../indexedDb/liquid-load-material-db.service';
@Component({
    selector: 'app-custom-liquid-load-charge-materials',
    templateUrl: './custom-liquid-load-charge-materials.component.html',
    styleUrls: ['./custom-liquid-load-charge-materials.component.css'],
    standalone: false
})
export class CustomLiquidLoadChargeMaterialsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  showModal: boolean;
  @Input()
  importing: boolean;
  @Output()
  emitNumMaterials: EventEmitter<number> = new EventEmitter<number>();

  liquidChargeMaterials: Array<LiquidLoadChargeMaterial>;
  existingMaterial: LiquidLoadChargeMaterial;
  editExistingMaterial: boolean = false;
  deletingMaterial: boolean = false;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  selectedSub: Subscription;
  selectAllSub: Subscription;

  constructor(private liquidLoadMaterialDbService: LiquidLoadMaterialDbService, private customMaterialService: CustomMaterialsService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.liquidChargeMaterials = new Array<LiquidLoadChargeMaterial>();
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
    for (let i = 0; i < this.liquidChargeMaterials.length; i++) {
      this.liquidChargeMaterials[i].specificHeatLiquid = this.convertUnitsService.value(this.liquidChargeMaterials[i].specificHeatLiquid).from('btulbF').to('kJkgC');
      this.liquidChargeMaterials[i].specificHeatVapor = this.convertUnitsService.value(this.liquidChargeMaterials[i].specificHeatVapor).from('btulbF').to('kJkgC');
      this.liquidChargeMaterials[i].vaporizationTemperature = this.convertUnitsService.value(this.liquidChargeMaterials[i].vaporizationTemperature).from('F').to('C');
      this.liquidChargeMaterials[i].latentHeat = this.convertUnitsService.value(this.liquidChargeMaterials[i].latentHeat).from('btulbF').to('kJkgC');
    }
  }

  async getCustomMaterials() {
    this.liquidChargeMaterials = await firstValueFrom(this.liquidLoadMaterialDbService.getAllCustomMaterials());
    if (this.settings.unitsOfMeasure === 'Metric') {
      this.convertAllMaterials();
    }
    this.emitNumMaterials.emit(this.liquidChargeMaterials.length);
  }

 async editMaterial(id: number) {
   this.existingMaterial = await firstValueFrom(this.liquidLoadMaterialDbService.getByIdWithObservable(id));
   this.editExistingMaterial = true;
   this.showMaterialModal();
  }

  async deleteMaterial(id: number) {
    this.existingMaterial = await firstValueFrom(this.liquidLoadMaterialDbService.getByIdWithObservable(id));
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
    let selected: Array<LiquidLoadChargeMaterial> = _.filter(this.liquidChargeMaterials, (material) => { return material.selected === true; });
    this.customMaterialService.selectedLiquidLoadCharge = selected;
  }
  selectAll(val: boolean) {
    this.liquidChargeMaterials.forEach(material => {
      material.selected = val;
    });
  }
}

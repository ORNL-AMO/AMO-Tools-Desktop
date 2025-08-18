import { Component, OnInit, Input, ViewChild, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AtmosphereSpecificHeat } from '../../../shared/models/materials';
 
import { CustomMaterialsService } from '../custom-materials.service';
import * as _ from 'lodash';
import { firstValueFrom, Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { AtmosphereDbService } from '../../../indexedDb/atmosphere-db.service';
@Component({
    selector: 'app-custom-atmosphere-specific-heat-materials',
    templateUrl: './custom-atmosphere-specific-heat-materials.component.html',
    styleUrls: ['./custom-atmosphere-specific-heat-materials.component.css'],
    standalone: false
})
export class CustomAtmosphereSpecificHeatMaterialsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  showModal: boolean;
  @Input()
  importing: boolean;
  @Output()
  emitNumMaterials: EventEmitter<number> = new EventEmitter<number>();

  editExistingMaterial: boolean = false;
  existingMaterial: AtmosphereSpecificHeat;
  deletingMaterial: boolean = false;
  atmosphereSpecificHeatMaterials: Array<AtmosphereSpecificHeat>;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  selectedSub: Subscription;
  selectAllSub: Subscription;

  constructor(private atmospherDbService: AtmosphereDbService, private customMaterialService: CustomMaterialsService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.atmosphereSpecificHeatMaterials = new Array<AtmosphereSpecificHeat>();
    this.customMaterialService.selectedAtmosphere = new Array();
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
    for (let i = 0; i < this.atmosphereSpecificHeatMaterials.length; i++) {
      this.atmosphereSpecificHeatMaterials[i].specificHeat = this.convertUnitsService.value(this.atmosphereSpecificHeatMaterials[i].specificHeat).from('btulbF').to('kJkgC');
    }
  }

  async getCustomMaterials() {
    this.atmosphereSpecificHeatMaterials = await firstValueFrom(this.atmospherDbService.getAllCustomMaterials());
    if (this.settings.unitsOfMeasure === 'Metric') {
      this.convertAllMaterials();
    }
    this.emitNumMaterials.emit(this.atmosphereSpecificHeatMaterials.length);
  }

  async editMaterial(id: number) {
    this.existingMaterial = await firstValueFrom(this.atmospherDbService.getByIdWithObservable(id));
    this.editExistingMaterial = true;
    this.showMaterialModal();
  }

  async deleteMaterial(id: number) {
    this.existingMaterial = await firstValueFrom(this.atmospherDbService.getByIdWithObservable(id));
    this.editExistingMaterial = true;
    this.deletingMaterial = true;
    this.showMaterialModal();
  }

  showMaterialModal() {
    this.showModal = true;
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    this.customMaterialService.selectedAtmosphere = new Array();
    this.materialModal.hide();
    this.showModal = false;
    this.editExistingMaterial = false;
    this.deletingMaterial = false;
    this.getCustomMaterials();
  }

  getSelected() {
    let selected: Array<AtmosphereSpecificHeat> = _.filter(this.atmosphereSpecificHeatMaterials, (material) => { return material.selected === true; });
    this.customMaterialService.selectedAtmosphere = selected;
  }
  selectAll(val: boolean) {
    this.atmosphereSpecificHeatMaterials.forEach(material => {
      material.selected = val;
    });
  }
}

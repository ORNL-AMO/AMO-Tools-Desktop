import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AtmosphereSpecificHeat } from '../../../shared/models/materials';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { CustomMaterialsService } from '../custom-materials.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
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
  @Input()
  importing: boolean;


  editExistingMaterial: boolean = false;
  existingMaterial: AtmosphereSpecificHeat;
  deletingMaterial: boolean = false;
  atmosphereSpecificHeatMaterials: Array<AtmosphereSpecificHeat>;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  selectedSub: Subscription;
  selectAllSub: Subscription;

  constructor(private indexedDbService: IndexedDbService, private customMaterialService: CustomMaterialsService, private convertUnitsService: ConvertUnitsService) { }

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

  getCustomMaterials() {
    this.indexedDbService.getAtmosphereSpecificHeat().then(idbResults => {
      this.atmosphereSpecificHeatMaterials = idbResults;
      if (this.settings.unitsOfMeasure === 'Metric') {
        this.convertAllMaterials();
      }
    });

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

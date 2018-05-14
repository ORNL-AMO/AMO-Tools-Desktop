import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap';
import { AtmosphereSpecificHeat } from '../../../shared/models/materials';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { SuiteDbService } from '../../suite-db.service';
import { CustomMaterialsService } from '../custom-materials.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
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

  editExistingMaterial: boolean = false;
  existingMaterial: AtmosphereSpecificHeat;
  deletingMaterial: boolean = false;
  atmosphereSpecificHeatMaterials: Array<AtmosphereSpecificHeat>;

  @ViewChild('materialModal') public materialModal: ModalDirective;
  selectedSub: Subscription;
  selectAllSub: Subscription;

  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private customMaterialService: CustomMaterialsService) { }

  ngOnInit() {
    this.customMaterialService.selectedAtmosphere = new Array();
    this.getCustomMaterials();
    this.selectedSub = this.customMaterialService.getSelected.subscribe((val) => {
      if(val){
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
    if (!changes.showModal.firstChange) {
      if (changes.showModal.currentValue != changes.showModal.previousValue) {
        this.showMaterialModal();
      }
    }
  }

  getCustomMaterials() {
    this.atmosphereSpecificHeatMaterials = new Array<AtmosphereSpecificHeat>();
    this.indexedDbService.getAtmosphereSpecificHeat().then(idbResults => {
      this.atmosphereSpecificHeatMaterials = idbResults;
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
    let selected: Array<AtmosphereSpecificHeat> = _.filter(this.atmosphereSpecificHeatMaterials, (material) => { return material.selected == true });
    this.customMaterialService.selectedAtmosphere = selected;
  }
  selectAll(val: boolean) {
    this.atmosphereSpecificHeatMaterials.forEach(material => {
      material.selected = val;
    })
  }
}

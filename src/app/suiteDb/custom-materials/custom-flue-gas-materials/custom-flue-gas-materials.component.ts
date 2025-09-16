import { Component, OnInit, Input, ViewChild, SimpleChanges, Output, EventEmitter } from '@angular/core';
 
import { FlueGasMaterial } from '../../../shared/models/materials';
import { Settings } from '../../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomMaterialsService } from '../custom-materials.service';
import * as _ from 'lodash';
import { firstValueFrom, Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FlueGasMaterialDbService } from '../../../indexedDb/flue-gas-material-db.service';

@Component({
    selector: 'app-custom-flue-gas-materials',
    templateUrl: './custom-flue-gas-materials.component.html',
    styleUrls: ['./custom-flue-gas-materials.component.css'],
    standalone: false
})
export class CustomFlueGasMaterialsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  showModal: boolean;
  @Input()
  importing: boolean;
  @Output()
  emitNumMaterials: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;

  flueGasMaterials: Array<FlueGasMaterial>;
  editExistingMaterial: boolean = false;
  existingMaterial: FlueGasMaterial;
  deletingMaterial: boolean = false;
  options: any;
  selectedSub: Subscription;
  selectAllSub: Subscription;

  constructor(private flueGasMaterialDbService: FlueGasMaterialDbService, private customMaterialService: CustomMaterialsService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.flueGasMaterials = new Array<FlueGasMaterial>();
    this.getCustomMaterials();
    this.customMaterialService.selectedFlueGas = new Array<FlueGasMaterial>();
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
    for (let i = 0; i < this.flueGasMaterials.length; i++) {
      this.flueGasMaterials[i].heatingValue = this.convertUnitsService.value(this.flueGasMaterials[i].heatingValue).from('btuLb').to('kJkg');
      this.flueGasMaterials[i].heatingValueVolume = this.convertUnitsService.value(this.flueGasMaterials[i].heatingValueVolume).from('btuscf').to('kJNm3');
    }
  }


  getCustomMaterials() {
    this.flueGasMaterials = this.flueGasMaterialDbService.getAllCustomMaterials();
    if (this.settings.unitsOfMeasure === 'Metric') {
      this.convertAllMaterials();
    }
    this.emitNumMaterials.emit(this.flueGasMaterials.length);
  }

  editMaterial(id: number) {
    this.existingMaterial = this.flueGasMaterialDbService.getById(id);
    this.editExistingMaterial = true;
    this.showMaterialModal();
  }

  deleteMaterial(id: number) {
    this.existingMaterial = this.flueGasMaterialDbService.getById(id);
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
    let selected: Array<FlueGasMaterial> = _.filter(this.flueGasMaterials, (material) => { return material.selected === true; });
    this.customMaterialService.selectedFlueGas = selected;
  }
  selectAll(val: boolean) {
    this.flueGasMaterials.forEach(material => {
      material.selected = val;
    });
  }
}

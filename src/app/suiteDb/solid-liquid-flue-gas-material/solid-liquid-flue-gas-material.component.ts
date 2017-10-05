import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { SolidLiquidFlueGasMaterial } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { PhastService } from '../../phast/phast.service';
@Component({
  selector: 'app-solid-liquid-flue-gas-material',
  templateUrl: './solid-liquid-flue-gas-material.component.html',
  styleUrls: ['./solid-liquid-flue-gas-material.component.css']
})
export class SolidLiquidFlueGasMaterialComponent implements OnInit {
  @Output('closeModal')
  closeModal = new EventEmitter<SolidLiquidFlueGasMaterial>();
  // @Input()
  // settings: Settings;
  newMaterial: SolidLiquidFlueGasMaterial = {
    substance: 'New Fuel',
    carbon: 0,
    hydrogen: 0,
    inertAsh: 0,
    moisture: 0,
    nitrogen: 0,
    o2: 0,
    sulphur: 0,
    heatingValue: 0
  };
  selectedMaterial: SolidLiquidFlueGasMaterial;
  allMaterials: Array<SolidLiquidFlueGasMaterial>;
  isValidMaterialName: boolean = true;
  nameError: string = null;
  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private phastService: PhastService) { }

  ngOnInit() {
    this.allMaterials = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    this.checkMaterialName();
    // this.selectedMaterial = this.allMaterials[0];
    // if (!this.settings) {
    //   this.indexedDbService.getSettings(1).then(results => {
    //     this.settings = results;
    //   })
    // }
  }

  addMaterial() {
    let suiteDbResult = this.suiteDbService.insertSolidLiquidFlueGasMaterial(this.newMaterial);
    if (suiteDbResult == true) {
      this.indexedDbService.addSolidLiquidFlueGasMaterial(this.newMaterial).then(idbResults => {
        this.closeModal.emit(this.newMaterial);
      })
    }
  }

  setExisting() {
    if (this.selectedMaterial) {
      this.newMaterial = {
        substance: this.selectedMaterial.substance + ' (mod)',
        carbon: this.selectedMaterial.carbon,
        hydrogen: this.selectedMaterial.hydrogen,
        inertAsh: this.selectedMaterial.inertAsh,
        moisture: this.selectedMaterial.moisture,
        nitrogen: this.selectedMaterial.nitrogen,
        o2: this.selectedMaterial.o2,
        sulphur: this.selectedMaterial.sulphur,
        heatingValue: 0
      }
      this.setHHV();
    }
  }

  setHHV() {
    let tmpHeatingVals = this.phastService.flueGasByMassCalculateHeatingValue(this.newMaterial);
    if (isNaN(tmpHeatingVals) == false) {
      this.newMaterial.heatingValue = tmpHeatingVals;
    } else {
      this.newMaterial.heatingValue = 0;
    }
  }



  checkMaterialName() {
    let test = _.filter(this.allMaterials, (material) => { return material.substance == this.newMaterial.substance })
    if (test.length > 0) {
      this.nameError = 'Cannot have same name as existing material';
      this.isValidMaterialName = false;
    } else {
      this.isValidMaterialName = true;
      this.nameError = null;
    }
  }

}

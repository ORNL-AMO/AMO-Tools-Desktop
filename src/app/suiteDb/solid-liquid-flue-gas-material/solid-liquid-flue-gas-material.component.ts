import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { SolidLoadChargeMaterial } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-solid-liquid-flue-gas-material',
  templateUrl: './solid-liquid-flue-gas-material.component.html',
  styleUrls: ['./solid-liquid-flue-gas-material.component.css']
})
export class SolidLiquidFlueGasMaterialComponent implements OnInit {
  @Output('closeModal')
  closeModal = new EventEmitter<SolidLoadChargeMaterial>();


  newMaterial: SolidLoadChargeMaterial = {
    substance: 'New Material',
    latentHeat: 0,
    meltingPoint: 0,
    specificHeatLiquid: 0,
    specificHeatSolid: 0,
  };
  selectedMaterial: SolidLoadChargeMaterial;
  allMaterials: Array<SolidLoadChargeMaterial>;
  isValidMaterialName: boolean = true;
  nameError: string = null;
  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.allMaterials = this.suiteDbService.selectSolidLoadChargeMaterials();
    this.checkMaterialName();
    // this.selectedMaterial = this.allMaterials[0];
  }

  addMaterial() {
    let suiteDbResult = this.suiteDbService.insertSolidLoadChargeMaterial(this.newMaterial);
    if (suiteDbResult == true) {
      this.indexedDbService.addSolidLoadChargeMaterial(this.newMaterial).then(idbResults => {
        this.closeModal.emit(this.newMaterial);
      })
    }
  }

  setExisting() {
    if (this.selectedMaterial) {
      this.newMaterial = {
        substance: this.selectedMaterial.substance + ' (mod)',
        latentHeat: this.selectedMaterial.latentHeat,
        meltingPoint: this.selectedMaterial.meltingPoint,
        specificHeatLiquid: this.selectedMaterial.specificHeatLiquid,
        specificHeatSolid: this.selectedMaterial.specificHeatSolid,
      }
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

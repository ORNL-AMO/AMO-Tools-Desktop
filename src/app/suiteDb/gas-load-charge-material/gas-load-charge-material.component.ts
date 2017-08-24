import { Component, OnInit } from '@angular/core';
import { GasLoadChargeMaterial } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
@Component({
  selector: 'app-gas-load-charge-material',
  templateUrl: './gas-load-charge-material.component.html',
  styleUrls: ['./gas-load-charge-material.component.css']
})
export class GasLoadChargeMaterialComponent implements OnInit {

  newMaterial: GasLoadChargeMaterial = {
    substance: 'New Material',
    specificHeatVapor: 0.0
  };
  selectedMaterial: GasLoadChargeMaterial;
  allMaterials: Array<GasLoadChargeMaterial>;
  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.getMaterials();
    this.selectedMaterial = this.allMaterials[0];
  }

  getMaterials() {
    this.allMaterials = this.suiteDbService.selectGasLoadChargeMaterials();
  }

  addMaterial() {
    let suiteDbResult = this.suiteDbService.insertGasLoadChargeMaterial(this.newMaterial);
    if (suiteDbResult == true) {
      this.indexedDbService.addGasLoadChargeMaterial(this.newMaterial).then(idbResults => {
        this.getMaterials();
      })
    }
  }

  setExisting() {
    this.newMaterial = {
      substance: this.selectedMaterial.substance + ' (mod)',
      specificHeatVapor: this.selectedMaterial.specificHeatVapor
    }
  }

}

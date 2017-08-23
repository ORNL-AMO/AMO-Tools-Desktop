import { Component, OnInit } from '@angular/core';
import { GasLoadChargeMaterial } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';

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

  allMaterials: Array<GasLoadChargeMaterial>;
  constructor(private suiteDbService: SuiteDbService) { }

  ngOnInit() {
    this.allMaterials = this.suiteDbService.selectGasLoadChargeMaterials();
  }

}

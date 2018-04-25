import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap';
import { SuiteDbService } from '../../suite-db.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { LossesService } from '../../../phast/losses/losses.service';
import { ChargeMaterial, GasChargeMaterial } from '../../../shared/models/phast/losses/chargeMaterial';

@Component({
  selector: 'app-custom-gas-load-charge-materials',
  templateUrl: './custom-gas-load-charge-materials.component.html',
  styleUrls: ['./custom-gas-load-charge-materials.component.css']
})
export class CustomGasLoadChargeMaterialsComponent implements OnInit {
  @Input()
  settings: Settings;

  gasChargeMaterials: Array<GasChargeMaterial>;
  foundGasChargeMaterials: boolean;

  @ViewChild('materialModal') public materialModal: ModalDirective;

  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private lossesService: LossesService) { }

  ngOnInit() {
    this.foundGasChargeMaterials = false;
    this.gasChargeMaterials = new Array<GasChargeMaterial>();
    this.indexedDbService.getAllGasLoadChargeMaterial().then(idbResults => {
      for (let i = 0; i < idbResults.length; i++) {
        this.gasChargeMaterials.push(idbResults[i]);
      }
      if (this.gasChargeMaterials.length > 0) {
        this.foundGasChargeMaterials = true;
      }
    });
  }

}

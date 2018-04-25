import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { SuiteDbService } from '../../suite-db.service';
import { LiquidLoadChargeMaterial } from '../../../shared/models/materials';

@Component({
  selector: 'app-custom-liquid-load-charge-materials',
  templateUrl: './custom-liquid-load-charge-materials.component.html',
  styleUrls: ['./custom-liquid-load-charge-materials.component.css']
})
export class CustomLiquidLoadChargeMaterialsComponent implements OnInit {
  @Input()
  settings: Settings

  liquidChargeMaterials: Array<LiquidLoadChargeMaterial>;

  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.getCustomMaterials();
  }

  getCustomMaterials() {
    this.liquidChargeMaterials = new Array<LiquidLoadChargeMaterial>();
    this.indexedDbService.getAllLiquidLoadChargeMaterial().then(idbResults => {
      this.liquidChargeMaterials = idbResults;
    });
  }



}

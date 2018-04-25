import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SolidLiquidFlueGasMaterial } from '../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap';
import { SuiteDbService } from '../../suite-db.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-custom-solid-liquid-flue-gas-materials',
  templateUrl: './custom-solid-liquid-flue-gas-materials.component.html',
  styleUrls: ['./custom-solid-liquid-flue-gas-materials.component.css']
})
export class CustomSolidLiquidFlueGasMaterialsComponent implements OnInit {
  @Input()
  settings: Settings;

  solidLiquidFlueGasMaterials: Array<SolidLiquidFlueGasMaterial>;

  @ViewChild('materialModal') public materialModal: ModalDirective;

  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.getCustomMaterials();
  }

  getCustomMaterials() {
    this.solidLiquidFlueGasMaterials = new Array<SolidLiquidFlueGasMaterial>();
    this.indexedDbService.getSolidLiquidFlueGasMaterials().then(idbResults => {
      this.solidLiquidFlueGasMaterials = idbResults;
    });
  }
}

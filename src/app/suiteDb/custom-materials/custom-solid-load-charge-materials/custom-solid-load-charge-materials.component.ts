import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SolidLoadChargeMaterial } from '../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap';
import { SuiteDbService } from '../../suite-db.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-custom-solid-load-charge-materials',
  templateUrl: './custom-solid-load-charge-materials.component.html',
  styleUrls: ['./custom-solid-load-charge-materials.component.css']
})
export class CustomSolidLoadChargeMaterialsComponent implements OnInit {
  @Input()
  settings: Settings;

  solidChargeMaterials: Array<SolidLoadChargeMaterial>;

  @ViewChild('materialModal') public materialModal: ModalDirective;

  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.getCustomMaterials();
  }

  getCustomMaterials() {
    this.solidChargeMaterials = new Array<SolidLoadChargeMaterial>();
    this.indexedDbService.getAllSolidLoadChargeMaterial().then(idbResults => {
      this.solidChargeMaterials = idbResults;
    });
  }
}

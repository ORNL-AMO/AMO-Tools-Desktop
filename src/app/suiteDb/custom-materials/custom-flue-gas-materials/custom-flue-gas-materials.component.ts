import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { FlueGasMaterial } from '../../../shared/models/materials';
import { Settings } from '../../../shared/models/settings';
import { LossesService } from '../../../phast/losses/losses.service';
import { ModalDirective } from 'ngx-bootstrap';
import { SuiteDbService } from '../../suite-db.service';

@Component({
  selector: 'app-custom-flue-gas-materials',
  templateUrl: './custom-flue-gas-materials.component.html',
  styleUrls: ['./custom-flue-gas-materials.component.css']
})
export class CustomFlueGasMaterialsComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('materialModal') public materialModal: ModalDirective;


  flueGasMaterials: Array<FlueGasMaterial>;
  foundFlueGasMaterials: boolean;
  flueGasMaterialsLength: number;
  showModal: boolean;
  options: any;


  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private lossesService: LossesService) { }

  ngOnInit() {
    this.foundFlueGasMaterials = false;
    this.flueGasMaterials = new Array<FlueGasMaterial>();
    this.indexedDbService.getFlueGasMaterials().then(idbResults => {
      for (let i = 0; i < idbResults.length; i++) {
        this.flueGasMaterials.push(idbResults[i]);
      }
      this.flueGasMaterialsLength = this.flueGasMaterials.length;
      if (this.flueGasMaterials.length > 0) {
        this.foundFlueGasMaterials = true;
      }
    });
  }


  // showMaterialModal() {
  //   this.showModal = true;
  //   this.lossesService.modalOpen.next(this.showModal);
  //   this.materialModal.show();
  // }

  // hideMaterialModal(event?: any) {
  //   if (event) {
  //     this.options = this.suiteDbService.selectGasFlueGasMaterials();
  //     let newMaterial = this.options.filter(material => { return material.substance == event.substance })
  //     if (newMaterial.length != 0) {
  //       this.flueGasLossForm.patchValue({
  //         gasTypeId: newMaterial[0].id
  //       })
  //       this.setProperties();
  //     }
  //   }
  //   this.materialModal.hide();
  //   this.showModal = false;
  //   this.lossesService.modalOpen.next(this.showModal);
  //   this.checkForm();
  // }

}

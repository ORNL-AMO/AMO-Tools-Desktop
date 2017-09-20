import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FlueGasMaterial } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-flue-gas-material',
  templateUrl: './flue-gas-material.component.html',
  styleUrls: ['./flue-gas-material.component.css']
})
export class FlueGasMaterialComponent implements OnInit {
  @Output('closeModal')
  closeModal = new EventEmitter<FlueGasMaterial>();
  @Input()
  settings: Settings;
  newMaterial: FlueGasMaterial = {
    substance: 'New Fuel',
    C2H6: 0,
    C3H8: 0,
    C4H10_CnH2n: 0,
    CH4: 0,
    CO: 0,
    CO2: 0,
    H2: 0,
    H2O: 0,
    N2: 0,
    O2: 0,
    SO2: 0,
    heatingValue: 0,
    specificGravity: 0
  };
  selectedMaterial: FlueGasMaterial;
  allMaterials: Array<FlueGasMaterial>;
  isValidMaterialName: boolean = true;
  nameError: string = null;
  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.allMaterials = this.suiteDbService.selectGasFlueGasMaterials();
    this.checkMaterialName();
    // this.selectedMaterial = this.allMaterials[0];
  }

  addMaterial() {
    if (this.settings.unitsOfMeasure == 'Metric') {
      this.newMaterial.heatingValue = this.convertUnitsService.value(this.newMaterial.heatingValue).from('kJNm3').to('btuSCF');
    }
    let suiteDbResult = this.suiteDbService.insertGasFlueGasMaterial(this.newMaterial);
    if (suiteDbResult == true) {
      this.indexedDbService.addFlueGasMaterial(this.newMaterial).then(idbResults => {
        this.closeModal.emit(this.newMaterial);
      })
    }
  }

  setExisting() {
    if (this.selectedMaterial) {
      this.newMaterial = {
        substance: this.selectedMaterial.substance + ' (mod)',
        C2H6: this.selectedMaterial.C2H6,
        C3H8: this.selectedMaterial.C3H8,
        C4H10_CnH2n: this.selectedMaterial.C4H10_CnH2n,
        CH4: this.selectedMaterial.CH4,
        CO: this.selectedMaterial.CO,
        CO2: this.selectedMaterial.CO2,
        H2: this.selectedMaterial.H2,
        H2O: this.selectedMaterial.H2O,
        N2: this.selectedMaterial.N2,
        O2: this.selectedMaterial.O2,
        SO2: this.selectedMaterial.SO2,
        heatingValue: this.selectedMaterial.heatingValue,
        specificGravity: this.selectedMaterial.specificGravity
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

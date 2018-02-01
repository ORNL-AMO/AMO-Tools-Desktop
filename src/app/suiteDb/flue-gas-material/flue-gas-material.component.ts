import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FlueGasMaterial } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { PhastService } from '../../phast/phast.service';

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
  @Output('hideModal')
  hideModal = new EventEmitter();

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
    heatingValueVolume: 0,
    specificGravity: 0
  };
  selectedMaterial: FlueGasMaterial;
  allMaterials: Array<FlueGasMaterial>;
  isValid: boolean;
  nameError: string = null;
  canAdd: boolean;
  isNameValid: boolean;
  currentField: string = 'selectedMaterial';
  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService, private phastService: PhastService) { }

  ngOnInit() {
    this.allMaterials = this.suiteDbService.selectGasFlueGasMaterials();
    this.checkMaterialName();
    this.setHHV();
    this.canAdd = true;
    // this.selectedMaterial = this.allMaterials[0];
  }

  addMaterial() {
    if (this.canAdd) {
      this.canAdd = false;
      if (this.settings.unitsOfMeasure == 'Metric') {
        this.newMaterial.heatingValue = this.convertUnitsService.value(this.newMaterial.heatingValue).from('kJkg').to('btuLb');
        this.newMaterial.heatingValueVolume = this.convertUnitsService.value(this.newMaterial.heatingValueVolume).from('kJNm3').to('btuSCF');
      }
      let suiteDbResult = this.suiteDbService.insertGasFlueGasMaterial(this.newMaterial);
      if (suiteDbResult == true) {
        this.indexedDbService.addFlueGasMaterial(this.newMaterial).then(idbResults => {
          this.closeModal.emit(this.newMaterial);
        })
      }
    }
  }

  hideMaterialModal() {
    this.hideModal.emit();
  }

  //debug
  setExisting() {
    if (this.selectedMaterial) {

      if (this.settings.unitsOfMeasure == 'Metric') {
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
          heatingValue: this.convertUnitsService.value(this.selectedMaterial.heatingValue).from('btuLb').to('kJkg'),
          heatingValueVolume: this.convertUnitsService.value(this.selectedMaterial.heatingValueVolume).from('btuSCF').to('kJNm3'),
          specificGravity: this.selectedMaterial.specificGravity
        }
      }
      else {
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
          heatingValueVolume: this.selectedMaterial.heatingValueVolume,
          specificGravity: this.selectedMaterial.specificGravity
        }
      }      
      this.checkMaterialName();
      this.setHHV();
    }
  }

  //real version
  // setExisting() {
  //   if (this.selectedMaterial) {
  //     this.newMaterial = {
  //       substance: this.selectedMaterial.substance + ' (mod)',
  //       C2H6: this.selectedMaterial.C2H6,
  //       C3H8: this.selectedMaterial.C3H8,
  //       C4H10_CnH2n: this.selectedMaterial.C4H10_CnH2n,
  //       CH4: this.selectedMaterial.CH4,
  //       CO: this.selectedMaterial.CO,
  //       CO2: this.selectedMaterial.CO2,
  //       H2: this.selectedMaterial.H2,
  //       H2O: this.selectedMaterial.H2O,
  //       N2: this.selectedMaterial.N2,
  //       O2: this.selectedMaterial.O2,
  //       SO2: this.selectedMaterial.SO2,
  //       heatingValue: this.selectedMaterial.heatingValue,
  //       heatingValueVolume: this.selectedMaterial.heatingValueVolume,
  //       specificGravity: this.selectedMaterial.specificGravity
  //     }
  //     this.checkMaterialName();
  //     this.setHHV();
  //   }
  // }

  setHHV() {
    const vals = this.phastService.flueGasByVolumeCalculateHeatingValue(this.newMaterial);
    if (isNaN(vals.heatingValue) === false && isNaN(vals.specificGravity) === false && isNaN(vals.heatingValueVolume) === false) {
      this.isValid = true;
      this.newMaterial.heatingValue = vals.heatingValue;
      this.newMaterial.heatingValueVolume = vals.heatingValueVolume;
      this.newMaterial.specificGravity = vals.specificGravity;
      if (this.settings.unitsOfMeasure === 'Metric') {
        this.newMaterial.heatingValue = this.convertUnitsService.value(vals.heatingValue).from('btuLb').to('kJkg');
        this.newMaterial.heatingValueVolume = this.convertUnitsService.value(vals.heatingValueVolume).from('btuSCF').to('kJNm3');
      }
    } else {
      this.isValid = false;
      this.newMaterial.heatingValue = 0;
      this.newMaterial.heatingValueVolume = 0;
      this.newMaterial.specificGravity = 0;
    }
  }

  checkMaterialName() {
    let test = _.filter(this.allMaterials, (material) => { return material.substance.toLowerCase().trim() == this.newMaterial.substance.toLowerCase().trim() })
    if (test.length > 0) {
      this.nameError = 'Cannot have same name as existing material';
      this.isNameValid = false;
    } else {
      this.isNameValid = true;
      this.nameError = null;
    }
  }

  focusField(str: string){
    this.currentField = str;
  }

}

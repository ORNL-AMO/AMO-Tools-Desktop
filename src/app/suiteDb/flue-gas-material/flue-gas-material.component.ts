import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FlueGasMaterial } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { PhastService } from '../../phast/phast.service';
import { SqlDbApiService } from '../../tools-suite-api/sql-db-api.service';





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
  @Input()
  editExistingMaterial: boolean;
  @Input()
  existingMaterial: FlueGasMaterial;
  @Input()
  deletingMaterial: boolean;
  @Output('hideModal')
  hideModal = new EventEmitter();
  // @Input()
  // newMaterial: FlueGasMaterial;
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
    specificGravity: 0,

  };
  selectedMaterial: FlueGasMaterial;
  allMaterials: Array<FlueGasMaterial>;
  allCustomMaterials: Array<FlueGasMaterial>;
  isValid: boolean;
  nameError: string = null;
  canAdd: boolean;
  isNameValid: boolean;
  currentField: string = 'selectedMaterial';
  totalOfFlueGasses: number = 0;
  difference: number = 0;
  differenceError: boolean = false;
  idbEditMaterialId: number;
  sdbEditMaterialId: number;
  constructor(private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService,
     private phastService: PhastService, private sqlDbApiService: SqlDbApiService) { }

  ngOnInit() {

    if (this.editExistingMaterial) {
      this.idbEditMaterialId = this.existingMaterial.id;
      this.allMaterials = this.sqlDbApiService.selectGasFlueGasMaterials();
      this.indexedDbService.getFlueGasMaterials().then(idbResults => {
        this.allCustomMaterials = idbResults;
        this.sdbEditMaterialId = _.find(this.allMaterials, (material) => { return this.existingMaterial.substance == material.substance }).id;
        this.setExisting();
      });
      this.checkEditMaterialName();
    }
    else {
      this.canAdd = true;
      this.checkInputMaterial()
      this.allMaterials = this.sqlDbApiService.selectGasFlueGasMaterials();
      this.setHHV();
      this.checkMaterialName();
      this.getTotalOfFlueGasses();
    }
  }

  checkInputMaterial() {
    if (this.editExistingMaterial && this.existingMaterial) {
      this.newMaterial = this.existingMaterial;
    }
    else if (this.newMaterial === undefined || this.newMaterial === null) {
      this.newMaterial = {
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
        specificGravity: 0,
      };
    }
  }

  getTotalOfFlueGasses() {
    this.totalOfFlueGasses = this.newMaterial.C2H6 + this.newMaterial.C3H8 + this.newMaterial.C4H10_CnH2n + this.newMaterial.CH4
      + this.newMaterial.CO + this.newMaterial.CO2 + this.newMaterial.H2 + this.newMaterial.H2O
      + this.newMaterial.N2 + this.newMaterial.O2 + this.newMaterial.SO2;
    this.getDiff();
  }

  addMaterial() {
    if (this.canAdd) {
      this.canAdd = false;
      if (this.settings.unitsOfMeasure == 'Metric') {
        this.newMaterial.heatingValue = this.convertUnitsService.value(this.newMaterial.heatingValue).from('kJkg').to('btuLb');
        this.newMaterial.heatingValueVolume = this.convertUnitsService.value(this.newMaterial.heatingValueVolume).from('kJNm3').to('btuSCF');
      }
      let suiteDbResult = this.sqlDbApiService.insertGasFlueGasMaterial(this.newMaterial);
      if (suiteDbResult == true) {
        this.indexedDbService.addFlueGasMaterial(this.newMaterial).then(idbResults => {
          this.closeModal.emit(this.newMaterial);
        })
      }
    }
  }

  updateMaterial() {
    if (this.settings.unitsOfMeasure == 'Metric') {
      this.newMaterial.heatingValue = this.convertUnitsService.value(this.newMaterial.heatingValue).from('kJkg').to('btuLb');
      this.newMaterial.heatingValueVolume = this.convertUnitsService.value(this.newMaterial.heatingValueVolume).from('kJNm3').to('btuSCF');
    }
    this.newMaterial.id = this.sdbEditMaterialId;
    let suiteDbResult = this.sqlDbApiService.updateGasFlueGasMaterial(this.newMaterial);
    if (suiteDbResult == true) {
      //need to set id for idb to put updates
      this.newMaterial.id = this.idbEditMaterialId;
      this.indexedDbService.putFlueGasMaterial(this.newMaterial).then(val => {
        this.closeModal.emit(this.newMaterial);
      });
    }
  }

  deleteMaterial() {
    if (this.deletingMaterial && this.existingMaterial) {
      let suiteDbResult = this.sqlDbApiService.deleteGasFlueGasMaterial(this.sdbEditMaterialId);
      if (suiteDbResult == true) {
        this.indexedDbService.deleteFlueGasMaterial(this.idbEditMaterialId).then(val => {
          this.closeModal.emit(this.newMaterial);
        });
      }
    }
  }

  getDiff() {
    this.difference = 100 - this.totalOfFlueGasses;
    if (this.difference > .4 || this.difference < -.4) {
      this.differenceError = true;
    } else {
      this.differenceError = false;
    }
  }

  hideMaterialModal() {
    this.hideModal.emit();
  }

  setExisting() {
    if (this.editExistingMaterial && this.existingMaterial) {
      this.newMaterial = {
        id: this.existingMaterial.id,
        substance: this.existingMaterial.substance,
        C2H6: this.existingMaterial.C2H6,
        C3H8: this.existingMaterial.C3H8,
        C4H10_CnH2n: this.existingMaterial.C4H10_CnH2n,
        CH4: this.existingMaterial.CH4,
        CO: this.existingMaterial.CO,
        CO2: this.existingMaterial.CO2,
        H2: this.existingMaterial.H2,
        H2O: this.existingMaterial.H2O,
        N2: this.existingMaterial.N2,
        O2: this.existingMaterial.O2,
        SO2: this.existingMaterial.SO2,
        heatingValue: this.existingMaterial.heatingValue,
        heatingValueVolume: this.existingMaterial.heatingValueVolume,
        specificGravity: this.existingMaterial.specificGravity
      }
      if (this.settings.unitsOfMeasure == 'Metric') {
        this.newMaterial.heatingValue = this.convertUnitsService.value(this.existingMaterial.heatingValue).from('btuLb').to('kJkg');
        this.newMaterial.heatingValueVolume = this.convertUnitsService.value(this.existingMaterial.heatingValueVolume).from('btuSCF').to('kJNm3');
      }
      this.getTotalOfFlueGasses();
      this.setHHV();
    }
    else if (this.selectedMaterial) {
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
      if (this.settings.unitsOfMeasure == 'Metric') {
        this.newMaterial.heatingValue = this.convertUnitsService.value(this.newMaterial.heatingValue).from('btuLb').to('kJkg');
        this.newMaterial.heatingValueVolume = this.convertUnitsService.value(this.newMaterial.heatingValueVolume).from('btuSCF').to('kJNm3');
      }
      this.getTotalOfFlueGasses();
      this.checkMaterialName();
      this.setHHV();
    }
  }

  setHHV() {
    this.getTotalOfFlueGasses();
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

  checkEditMaterialName() {
    let test = _.filter(this.allMaterials, (material) => {
      if (material.id != this.sdbEditMaterialId) {
        return material.substance.toLowerCase().trim() == this.newMaterial.substance.toLowerCase().trim();
      }
    });

    if (test.length > 0) {
      this.nameError = 'This name is in use by another material';
      this.isNameValid = false;
    }
    else if (this.newMaterial.substance.toLowerCase().trim() == '') {
      this.nameError = 'The material must have a name';
      this.isNameValid = false;
    }
    else {
      this.isNameValid = true;
      this.nameError = null;
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

  focusField(str: string) {
    this.currentField = str;
  }
}

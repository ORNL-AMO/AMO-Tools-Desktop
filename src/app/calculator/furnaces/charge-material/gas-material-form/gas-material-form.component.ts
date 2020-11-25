import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { GasMaterialWarnings } from '../../../../phast/losses/charge-material/charge-material.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { GasLoadChargeMaterial } from '../../../../shared/models/materials';
import { ChargeMaterial, GasChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../../shared/models/settings';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { ChargeMaterialFormService } from '../charge-material-form.service';
import { ChargeMaterialService } from '../charge-material.service';
import { GasMaterialFormService } from './gas-material-form.service';

@Component({
  selector: 'app-gas-material-form',
  templateUrl: './gas-material-form.component.html',
  styleUrls: ['./gas-material-form.component.css']
})
export class GasMaterialFormComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  selected: boolean;
  @Input()
  inModal: boolean;
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @ViewChild('flueGasModal', { static: false }) public flueGasModal: ModalDirective;
  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;

  resetDataSub: Subscription;
  generateExampleSub: Subscription;

  chargeMaterialForm: FormGroup;
  options: any;
  warnings: GasMaterialWarnings;
  selectedMaterialId: any;
  selectedMaterial: any;
  idString: string;
  materialTypes: any;
  showModal: boolean;
  showFlueGasModal: boolean;

  constructor(private suiteDbService: SuiteDbService, 
              private chargeMaterialService: ChargeMaterialService, 
              private convertUnitsService: ConvertUnitsService,
              private gasMaterialFormService: GasMaterialFormService,
              private chargeMaterialFormService: ChargeMaterialFormService,
              ) {}

  ngOnInit() {
    this.initSubscriptions();
    this.materialTypes = this.suiteDbService.selectGasLoadChargeMaterials();
    if (this.chargeMaterialForm) {
      if (this.chargeMaterialForm.controls.materialId.value && this.chargeMaterialForm.controls.materialId.value !== '') {
        if (this.chargeMaterialForm.controls.materialSpecificHeat.value === '') {
          this.setProperties();
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
        this.setFormState();
    }
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
    this.chargeMaterialService.modalOpen.next(false);
  }

  initSubscriptions() {
    this.resetDataSub = this.chargeMaterialService.resetData.subscribe(value => {
      this.initForm();
      })
    this.generateExampleSub = this.chargeMaterialService.generateExample.subscribe(value => {
      this.initForm();
    })
  }

  initForm() {
    let updatedChargeMaterialData: ChargeMaterial;
    if (this.isBaseline) {
      updatedChargeMaterialData = this.chargeMaterialService.baselineData.getValue();
    } else {
      updatedChargeMaterialData = this.chargeMaterialService.modificationData.getValue();
    }

    if (updatedChargeMaterialData && updatedChargeMaterialData.gasChargeMaterial) {
      this.chargeMaterialForm = this.gasMaterialFormService.getGasChargeMaterialForm(updatedChargeMaterialData, false);
    } else {
      this.chargeMaterialForm = this.gasMaterialFormService.initGasForm();
    }

    this.checkWarnings();
    this.calculate();
    this.setFormState();
  }

  setFormState() {
    if (this.selected == false) {
      this.chargeMaterialForm.disable();
    } else {
      this.chargeMaterialForm.enable();
    }
  }

  focusField(str: string) {
    this.chargeMaterialService.currentField.next(str);
  }

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  checkWarnings() {
    let tmpMaterial: GasChargeMaterial = this.gasMaterialFormService.buildGasChargeMaterial(this.chargeMaterialForm).gasChargeMaterial;
    this.warnings = this.chargeMaterialFormService.checkGasWarnings(tmpMaterial);
  }

  calculate() {
    // this.chargeMaterialForm = this.gasMaterialFormService.setValidators(this.chargeMaterialForm);
    this.checkWarnings();
    debugger;
    if (this.chargeMaterialForm.valid) {
      let chargeMaterial: ChargeMaterial = this.gasMaterialFormService.buildGasChargeMaterial(this.chargeMaterialForm);
      if (this.isBaseline) {
        this.chargeMaterialService.baselineData.next(chargeMaterial);
      } else { 
        this.chargeMaterialService.modificationData.next(chargeMaterial);
      }
    }
  }


  checkMaterialValues() {
    let material: GasLoadChargeMaterial = this.suiteDbService.selectGasLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.specificHeatVapor).from('btulbF').to('kJkgC');
        material.specificHeatVapor = this.roundVal(val, 4);
      }
      if (material.specificHeatVapor !== this.chargeMaterialForm.controls.materialSpecificHeat.value) {
        return true;
      } else {
        return false;
      }
    }
  }

  setProperties() {
    let selectedMaterial = this.suiteDbService.selectGasLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (this.settings.unitsOfMeasure === 'Metric') {
      selectedMaterial.specificHeatVapor = this.convertUnitsService.value(selectedMaterial.specificHeatVapor).from('btulbF').to('kJkgC');
    }
    this.chargeMaterialForm.patchValue({
      materialSpecificHeat: this.roundVal(selectedMaterial.specificHeatVapor, 4)
    });
    this.calculate();
  }

  showMaterialModal() {
    this.showModal = true;
    this.chargeMaterialService.modalOpen.next(true);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.materialTypes = this.suiteDbService.selectSolidLoadChargeMaterials();
      let newMaterial = this.materialTypes.filter(material => { return material.substance === event.substance; });
      if (newMaterial.length !== 0) {
        this.chargeMaterialForm.patchValue({
          materialId: newMaterial[0].id
        });
        this.setProperties();
      }
    }
    this.showModal = false;
    this.materialModal.hide();
    this.chargeMaterialService.modalOpen.next(false);
  }

  initFlueGasModal() {
    this.showFlueGasModal = true;
    this.chargeMaterialService.modalOpen.next(this.showFlueGasModal);
    this.flueGasModal.show();
  }

  hideFlueGasModal(calculatedAvailableHeat?: any) {
    if (calculatedAvailableHeat) {
      calculatedAvailableHeat = this.roundVal(calculatedAvailableHeat, 1);
      this.chargeMaterialForm.patchValue({
        availableHeat: calculatedAvailableHeat
      });
    }
    this.flueGasModal.hide();
    this.showFlueGasModal = false;
    this.chargeMaterialService.modalOpen.next(this.showFlueGasModal);
  }
}

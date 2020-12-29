import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SolidLoadChargeMaterial } from '../../../../shared/models/materials';
import { ChargeMaterial, SolidChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../../shared/models/settings';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { ChargeMaterialService } from '../charge-material.service';
import { SolidMaterialFormService, SolidMaterialWarnings } from './solid-material-form.service';

@Component({
  selector: 'app-solid-material-form',
  templateUrl: './solid-material-form.component.html',
  styleUrls: ['./solid-material-form.component.css']
})
export class SolidMaterialFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  selected: boolean;
  @Input()
  inModal: boolean;
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;

  resetDataSub: Subscription;
  generateExampleSub: Subscription;

  chargeMaterialForm: FormGroup;
  warnings: SolidMaterialWarnings;
  selectedMaterialId: any;
  selectedMaterial: any;
  materialTypes: any;
  showModal: boolean;
  energySourceType: string;
  energySourceSub: Subscription;
  idString: string;
  index: number = 0;

  constructor(private suiteDbService: SuiteDbService, 
              private chargeMaterialService: ChargeMaterialService, 
              private convertUnitsService: ConvertUnitsService,
              private solidMaterialFormService: SolidMaterialFormService,
              ) {}

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index;
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.initSubscriptions();
    this.materialTypes = this.suiteDbService.selectSolidLoadChargeMaterials();
    if (this.chargeMaterialForm) {
      if (this.chargeMaterialForm.controls.materialId.value && this.chargeMaterialForm.controls.materialId.value !== '') {
        if (this.chargeMaterialForm.controls.materialLatentHeatOfFusion.value === '') {
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
    this.energySourceSub.unsubscribe();
    this.chargeMaterialService.modalOpen.next(false);
  }

  initSubscriptions() {
    this.resetDataSub = this.chargeMaterialService.resetData.subscribe(value => {
      this.initForm();
      });
    this.generateExampleSub = this.chargeMaterialService.generateExample.subscribe(value => {
      this.initForm();
    });
    this.energySourceSub = this.chargeMaterialService.energySourceType.subscribe(energySourceType => {
      this.energySourceType = energySourceType;
    });
  }

  initForm() {
    let updatedChargeMaterialData: ChargeMaterial;
    if (this.isBaseline) {
      updatedChargeMaterialData = this.chargeMaterialService.baselineData.getValue();
    } else {
      updatedChargeMaterialData = this.chargeMaterialService.modificationData.getValue();
    }

    if (updatedChargeMaterialData && updatedChargeMaterialData.solidChargeMaterial) {
      this.chargeMaterialForm = this.solidMaterialFormService.getSolidChargeMaterialForm(updatedChargeMaterialData, false);
    } else {
      this.chargeMaterialForm = this.solidMaterialFormService.initSolidForm();
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

  setProperties() {
    let selectedMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (this.settings.unitsOfMeasure === 'Metric') {
      selectedMaterial.latentHeat = this.convertUnitsService.value(selectedMaterial.latentHeat).from('btuLb').to('kJkg');
      selectedMaterial.meltingPoint = this.convertUnitsService.value(selectedMaterial.meltingPoint).from('F').to('C');
      selectedMaterial.specificHeatLiquid = this.convertUnitsService.value(selectedMaterial.specificHeatLiquid).from('btulbF').to('kJkgC');
      selectedMaterial.specificHeatSolid = this.convertUnitsService.value(selectedMaterial.specificHeatSolid).from('btulbF').to('kJkgC');
    }
    this.chargeMaterialForm.patchValue({
      materialLatentHeatOfFusion: this.roundVal(selectedMaterial.latentHeat, 4),
      materialMeltingPoint: this.roundVal(selectedMaterial.meltingPoint, 4),
      materialHeatOfLiquid: this.roundVal(selectedMaterial.specificHeatLiquid, 4),
      materialSpecificHeatOfSolidMaterial: this.roundVal(selectedMaterial.specificHeatSolid, 4)
    });
    this.calculate();
  }

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  checkWarnings() {
    let tmpMaterial: SolidChargeMaterial = this.solidMaterialFormService.buildSolidChargeMaterial(this.chargeMaterialForm).solidChargeMaterial;
    this.warnings = this.solidMaterialFormService.checkSolidWarnings(tmpMaterial);
  }

  calculate() {
    this.chargeMaterialForm = this.solidMaterialFormService.setInitialTempValidator(this.chargeMaterialForm);
    this.checkWarnings();
    let chargeMaterial: ChargeMaterial = this.solidMaterialFormService.buildSolidChargeMaterial(this.chargeMaterialForm);
    if (this.isBaseline) {
      this.chargeMaterialService.baselineData.next(chargeMaterial);
    } else { 
      this.chargeMaterialService.modificationData.next(chargeMaterial);
    }
  }

  checkSpecificHeatOfSolid() {
    let material: SolidLoadChargeMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        material.specificHeatSolid = this.convertUnitsService.value(material.specificHeatSolid).from('btulbF').to('kJkgC');
      }
      material.specificHeatSolid = this.roundVal(material.specificHeatSolid, 4);
      if (material.specificHeatSolid !== this.chargeMaterialForm.controls.materialSpecificHeatOfSolidMaterial.value) {
        return true;
      } else {
        return false;
      }
    }
  }
  checkLatentHeatOfFusion() {
    let material: SolidLoadChargeMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.latentHeat).from('btuLb').to('kJkg');
        material.latentHeat = this.roundVal(val, 4);
      }
      if (material.latentHeat !== this.chargeMaterialForm.controls.materialLatentHeatOfFusion.value) {
        return true;
      } else {
        return false;
      }
    }
  }
  checkHeatOfLiquid() {
    let material: SolidLoadChargeMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.specificHeatLiquid).from('btulbF').to('kJkgC');
        material.specificHeatLiquid = this.roundVal(val, 4);
      }
      if (material.specificHeatLiquid !== this.chargeMaterialForm.controls.materialHeatOfLiquid.value) {
        return true;
      } else {
        return false;
      }
    }
  }
  checkMeltingPoint() {
    let material: SolidLoadChargeMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.meltingPoint).from('F').to('C');
        material.meltingPoint = this.roundVal(val, 4);
      }
      if (material.meltingPoint !== this.chargeMaterialForm.controls.materialMeltingPoint.value) {
        return true;
      } else {
        return false;
      }
    }
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
}

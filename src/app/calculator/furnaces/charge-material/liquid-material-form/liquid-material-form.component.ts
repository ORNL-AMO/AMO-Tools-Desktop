import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { LiquidLoadChargeMaterial } from '../../../../shared/models/materials';
import { ChargeMaterial, ChargeMaterialOutput, ChargeMaterialResult, LiquidChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../../shared/models/settings';
import { SqlDbApiService } from '../../../../tools-suite-api/sql-db-api.service';
import { ChargeMaterialService } from '../charge-material.service';
import { LiquidMaterialFormService, LiquidMaterialWarnings } from './liquid-material-form.service';

@Component({
  selector: 'app-liquid-material-form',
  templateUrl: './liquid-material-form.component.html',
  styleUrls: ['./liquid-material-form.component.css']
})
export class LiquidMaterialFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  selected: boolean;
  @Input()
  index: number;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;

  resetDataSub: Subscription;
  generateExampleSub: Subscription;

  chargeMaterialForm: FormGroup;
  warnings: LiquidMaterialWarnings;
  materialTypes: Array<LiquidLoadChargeMaterial>;
  showModal: boolean;

  lossResult: ChargeMaterialResult;
  idString: string;
  outputSubscription: Subscription;
  collapseMaterialSub: Subscription;
  collapseMaterial: boolean = false;
  chargeMaterialType: string;

  constructor(
    private sqlDbApiService: SqlDbApiService, 
    private chargeMaterialService: ChargeMaterialService,
    private convertUnitsService: ConvertUnitsService,
    private liquidMaterialFormService: LiquidMaterialFormService,
  ) { }

  ngOnInit() {
    this.initSubscriptions();
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index;
    }
    else {
      this.idString = 'modification_' + this.index;
      let baselineData: Array<ChargeMaterial> = this.chargeMaterialService.baselineData.getValue();
      this.chargeMaterialType = baselineData[this.index].chargeMaterialType;
    }
    this.materialTypes = this.sqlDbApiService.selectLiquidLoadChargeMaterials();
    if (this.chargeMaterialForm) {
      if (this.chargeMaterialForm.controls.materialId.value && this.chargeMaterialForm.controls.materialId.value !== '') {
        if (this.chargeMaterialForm.controls.materialLatentHeat.value === '') {
          this.setProperties();
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.setFormState();
    }
    if (changes.index && !changes.index.firstChange) {
      let output: ChargeMaterialOutput = this.chargeMaterialService.output.getValue();
      this.setLossResult(output);
    }
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
    this.outputSubscription.unsubscribe();
    this.collapseMaterialSub.unsubscribe();
    this.chargeMaterialService.modalOpen.next(false);
  }

  initSubscriptions() {
    this.resetDataSub = this.chargeMaterialService.resetData.subscribe(value => {
      this.initForm();
    });
    this.generateExampleSub = this.chargeMaterialService.generateExample.subscribe(value => {
      this.initForm();
    });
    this.outputSubscription = this.chargeMaterialService.output.subscribe(output => {
      this.setLossResult(output);
    });
    this.collapseMaterialSub = this.chargeMaterialService.collapseMapping.subscribe((collapseMapping: { [index: number]: boolean }) => {
      if (collapseMapping && collapseMapping[this.index] != undefined) {
        this.collapseMaterial = collapseMapping[this.index];
      }
    });
  }

  setLossResult(output: ChargeMaterialOutput) {
    if (this.isBaseline) {
      this.lossResult = output.baseline.losses[this.index];
    } else {
      this.lossResult = output.modification.losses[this.index];
    }
  }

  initForm() {
    let updatedChargeMaterialData: ChargeMaterial;
    if (this.isBaseline) {
      let baselineData: Array<ChargeMaterial> = this.chargeMaterialService.baselineData.getValue();
      updatedChargeMaterialData = baselineData[this.index];
    } else {
      let modificationData: Array<ChargeMaterial> = this.chargeMaterialService.modificationData.getValue();
      if (modificationData) {
        updatedChargeMaterialData = modificationData[this.index];
      }
    }

    if (updatedChargeMaterialData && updatedChargeMaterialData.chargeMaterialType == 'Liquid') {
      if (updatedChargeMaterialData && updatedChargeMaterialData.liquidChargeMaterial) {
        this.chargeMaterialForm = this.liquidMaterialFormService.getLiquidChargeMaterialForm(updatedChargeMaterialData, false);
      } else {
        this.chargeMaterialForm = this.liquidMaterialFormService.initLiquidForm();
      }

      this.checkWarnings();
      this.calculate();
      this.setFormState();
    }
  }

  setProperties() {
    let selectedMaterial: LiquidLoadChargeMaterial = this.sqlDbApiService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (selectedMaterial) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        selectedMaterial.vaporizationTemperature = this.convertUnitsService.value(this.roundVal(selectedMaterial.vaporizationTemperature, 4)).from('F').to('C');
        selectedMaterial.latentHeat = this.convertUnitsService.value(selectedMaterial.latentHeat).from('btuLb').to('kJkg');
        selectedMaterial.specificHeatLiquid = this.convertUnitsService.value(selectedMaterial.specificHeatLiquid).from('btulbF').to('kJkgC');
        selectedMaterial.specificHeatVapor = this.convertUnitsService.value(selectedMaterial.specificHeatVapor).from('btulbF').to('kJkgC');
      }
      this.chargeMaterialForm.patchValue({
        materialLatentHeat: this.roundVal(selectedMaterial.latentHeat, 4),
        materialSpecificHeatLiquid: this.roundVal(selectedMaterial.specificHeatLiquid, 4),
        materialSpecificHeatVapor: this.roundVal(selectedMaterial.specificHeatVapor, 4),
        materialVaporizingTemperature: this.roundVal(selectedMaterial.vaporizationTemperature, 4)
      });
    }
    this.calculate();
  }

  setFormState() {
    if (this.selected == false) {
      this.chargeMaterialForm.disable();
    } else {
      this.materialTypes = this.sqlDbApiService.selectLiquidLoadChargeMaterials();
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
    let tmpMaterial: LiquidChargeMaterial = this.liquidMaterialFormService.buildLiquidChargeMaterial(this.chargeMaterialForm).liquidChargeMaterial;
    this.warnings = this.liquidMaterialFormService.checkLiquidWarnings(tmpMaterial);
  }

  calculate() {
    this.chargeMaterialForm = this.liquidMaterialFormService.setInitialTempValidator(this.chargeMaterialForm);
    this.checkWarnings();
    let chargeMaterial: ChargeMaterial = this.liquidMaterialFormService.buildLiquidChargeMaterial(this.chargeMaterialForm);
    this.chargeMaterialService.updateDataArray(chargeMaterial, this.index, this.isBaseline);
  }

  checkSpecificHeatDiffLiquid() {
    let material: LiquidLoadChargeMaterial = this.sqlDbApiService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.specificHeatLiquid).from('btulbF').to('kJkgC');
        material.specificHeatLiquid = this.roundVal(val, 4);
      }
      if (material.specificHeatLiquid !== this.chargeMaterialForm.controls.materialSpecificHeatLiquid.value) {
        return true;
      } else {
        return false;
      }
    }
  }

  checkVaporizingTempDiff() {
    let material: LiquidLoadChargeMaterial = this.sqlDbApiService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.vaporizationTemperature).from('F').to('C');
        material.vaporizationTemperature = this.roundVal(val, 4);
      }
      if (material.vaporizationTemperature !== this.chargeMaterialForm.controls.materialVaporizingTemperature.value) {
        return true;
      } else {
        return false;
      }
    }
  }

  checkLatentHeatDiff() {
    let material: LiquidLoadChargeMaterial = this.sqlDbApiService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.latentHeat).from('btuLb').to('kJkg');
        material.latentHeat = this.roundVal(val, 4);
      }
      if (material.latentHeat !== this.chargeMaterialForm.controls.materialLatentHeat.value) {
        return true;
      } else {
        return false;
      }
    }
  }

  checkSpecificHeatVaporDiff() {
    let material: LiquidLoadChargeMaterial = this.sqlDbApiService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.specificHeatVapor).from('btulbF').to('kJkgC');
        material.specificHeatVapor = this.roundVal(val, 4);
      }
      if (material.specificHeatVapor !== this.chargeMaterialForm.controls.materialSpecificHeatVapor.value) {
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
      this.materialTypes = this.sqlDbApiService.selectLiquidLoadChargeMaterials();
      let newMaterial: LiquidLoadChargeMaterial = this.materialTypes.find(material => { return material.substance === event.substance; });
      if (newMaterial) {
        this.chargeMaterialForm.patchValue({
          materialId: newMaterial.id
        });
        this.setProperties();
      }
    }
    this.showModal = false;
    this.materialModal.hide();
    this.chargeMaterialService.modalOpen.next(false);
  }
}




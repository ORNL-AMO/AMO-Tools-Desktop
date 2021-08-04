import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SolidLoadChargeMaterial } from '../../../../shared/models/materials';
import { ChargeMaterial, ChargeMaterialOutput, ChargeMaterialResult, SolidChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
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
  index: number;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;

  resetDataSub: Subscription;
  generateExampleSub: Subscription;

  chargeMaterialForm: FormGroup;
  warnings: SolidMaterialWarnings;
  materialTypes: Array<SolidLoadChargeMaterial>;
  showModal: boolean;
  lossResult: ChargeMaterialResult;
  chargeMaterialType: string;

  idString: string;
  outputSubscription: Subscription;

  showMaterialProperties: boolean = true;
  collapseMaterial: boolean = false;
  collapseMaterialSub: Subscription;

  constructor(private suiteDbService: SuiteDbService,
    private chargeMaterialService: ChargeMaterialService,
    private convertUnitsService: ConvertUnitsService,
    private solidMaterialFormService: SolidMaterialFormService,
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
    if (changes.index && !changes.index.firstChange) {
      let output: ChargeMaterialOutput = this.chargeMaterialService.output.getValue();
      this.setLossResult(output);
    }
  }

  toggleMaterialProperties() {
    this.showMaterialProperties = !this.showMaterialProperties;
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

    if (updatedChargeMaterialData && updatedChargeMaterialData.chargeMaterialType == 'Solid') {
      if (updatedChargeMaterialData && updatedChargeMaterialData.solidChargeMaterial) {
        this.chargeMaterialForm = this.solidMaterialFormService.getSolidChargeMaterialForm(updatedChargeMaterialData, false);
      } else {
        this.chargeMaterialForm = this.solidMaterialFormService.initSolidForm();
      }
      this.checkWarnings();
      this.calculate();
      this.setFormState();
    }
  }

  setFormState() {
    if (this.selected == false) {
      this.chargeMaterialForm.disable();
    } else {
      this.materialTypes = this.suiteDbService.selectSolidLoadChargeMaterials();
      this.chargeMaterialForm.enable();
    }
  }

  focusField(str: string) {
    this.chargeMaterialService.currentField.next(str);
  }

  setProperties() {
    let selectedMaterial: SolidLoadChargeMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (selectedMaterial) {
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
    }
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
    this.chargeMaterialService.updateDataArray(chargeMaterial, this.index, this.isBaseline);

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
      let newMaterial: SolidLoadChargeMaterial = this.materialTypes.find(material => { return material.substance === event.substance; });
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

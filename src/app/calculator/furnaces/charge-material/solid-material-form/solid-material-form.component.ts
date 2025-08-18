import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { firstValueFrom, Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SolidLoadChargeMaterial } from '../../../../shared/models/materials';
import { ChargeMaterial, ChargeMaterialOutput, ChargeMaterialResult, SolidChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../../shared/models/settings';
import { ChargeMaterialService } from '../charge-material.service';
import { SolidMaterialFormService, SolidMaterialWarnings } from './solid-material-form.service';
import { SolidLoadMaterialDbService } from '../../../../indexedDb/solid-load-material-db.service';
import { roundVal } from '../../../../shared/helperFunctions';

@Component({
  selector: 'app-solid-material-form',
  templateUrl: './solid-material-form.component.html',
  styleUrls: ['./solid-material-form.component.css'],
  standalone: false
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

  chargeMaterialForm: UntypedFormGroup;
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

  constructor(
    private chargeMaterialService: ChargeMaterialService,
    private convertUnitsService: ConvertUnitsService,
    private solidMaterialFormService: SolidMaterialFormService,
    private solidLoadMaterialDbService: SolidLoadMaterialDbService
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
    this.setMaterials();
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

  async setMaterials() {
    this.materialTypes = await firstValueFrom(this.solidLoadMaterialDbService.getAllWithObservable())
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

  async setFormState() {
    if (this.selected == false) {
      this.chargeMaterialForm.disable();
    } else {
      await this.setMaterials();
      this.chargeMaterialForm.enable();
    }
  }

  focusField(str: string) {
    this.chargeMaterialService.currentField.next(str);
  }

  async setProperties() {
    let selectedMaterial: SolidLoadChargeMaterial = await firstValueFrom(this.solidLoadMaterialDbService.getByIdWithObservable(this.chargeMaterialForm.controls.materialId.value));
    if (selectedMaterial) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        selectedMaterial.latentHeat = this.convertUnitsService.value(selectedMaterial.latentHeat).from('btuLb').to('kJkg');
        selectedMaterial.meltingPoint = this.convertUnitsService.value(selectedMaterial.meltingPoint).from('F').to('C');
        selectedMaterial.specificHeatLiquid = this.convertUnitsService.value(selectedMaterial.specificHeatLiquid).from('btulbF').to('kJkgC');
        selectedMaterial.specificHeatSolid = this.convertUnitsService.value(selectedMaterial.specificHeatSolid).from('btulbF').to('kJkgC');
      }
      this.chargeMaterialForm.patchValue({
        materialLatentHeatOfFusion: roundVal(selectedMaterial.latentHeat, 4),
        materialMeltingPoint: roundVal(selectedMaterial.meltingPoint, 4),
        materialHeatOfLiquid: roundVal(selectedMaterial.specificHeatLiquid, 4),
        materialSpecificHeatOfSolidMaterial: roundVal(selectedMaterial.specificHeatSolid, 4)
      });
    }
    this.calculate();
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

  showMaterialModal() {
    this.showModal = true;
    this.chargeMaterialService.modalOpen.next(true);
    this.materialModal.show();
  }

  async hideMaterialModal(event?: any) {
    if (event) {
      await this.setMaterials();
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

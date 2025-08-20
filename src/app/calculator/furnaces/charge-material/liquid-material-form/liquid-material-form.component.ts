import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { firstValueFrom, Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { LiquidLoadChargeMaterial } from '../../../../shared/models/materials';
import { ChargeMaterial, ChargeMaterialOutput, ChargeMaterialResult, LiquidChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../../shared/models/settings';
import { SqlDbApiService } from '../../../../tools-suite-api/sql-db-api.service';
import { ChargeMaterialService } from '../charge-material.service';
import { LiquidMaterialFormService, LiquidMaterialWarnings } from './liquid-material-form.service';
import { LiquidLoadMaterialDbService } from '../../../../indexedDb/liquid-load-material-db.service';
import { roundVal } from '../../../../shared/helperFunctions';

@Component({
  selector: 'app-liquid-material-form',
  templateUrl: './liquid-material-form.component.html',
  styleUrls: ['./liquid-material-form.component.css'],
  standalone: false
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

  chargeMaterialForm: UntypedFormGroup;
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
    private liquidLoadMaterialDbService: LiquidLoadMaterialDbService,
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
    this.setMaterialTypes();
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

  async setMaterialTypes() {
    this.materialTypes = await firstValueFrom(this.liquidLoadMaterialDbService.getAllCustomMaterials())
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
    let selectedMaterial: LiquidLoadChargeMaterial = this.materialTypes.find(material => material.id === this.chargeMaterialForm.controls.materialId.value);
    if (selectedMaterial) {
      let vaporizationTemperature: number = selectedMaterial.vaporizationTemperature;
      let latentHeat: number = selectedMaterial.latentHeat;
      let specificHeatLiquid: number = selectedMaterial.specificHeatLiquid;
      let specificHeatVapor: number = selectedMaterial.specificHeatVapor;
      if (this.settings.unitsOfMeasure === 'Metric') {
        vaporizationTemperature = this.convertUnitsService.value(roundVal(vaporizationTemperature, 4)).from('F').to('C');
        latentHeat = this.convertUnitsService.value(latentHeat).from('btuLb').to('kJkg');
        specificHeatLiquid = this.convertUnitsService.value(specificHeatLiquid).from('btulbF').to('kJkgC');
        specificHeatVapor = this.convertUnitsService.value(specificHeatVapor).from('btulbF').to('kJkgC');
      }
      this.chargeMaterialForm.patchValue({
        materialLatentHeat: roundVal(latentHeat, 4),
        materialSpecificHeatLiquid: roundVal(specificHeatLiquid, 4),
        materialSpecificHeatVapor: roundVal(specificHeatVapor, 4),
        materialVaporizingTemperature: roundVal(vaporizationTemperature, 4)
      });
    }
    this.calculate();
  }

  async setFormState() {
    if (this.selected == false) {
      this.chargeMaterialForm.disable();
    } else {
      await this.setMaterialTypes();
      this.chargeMaterialForm.enable();
    }
  }

  focusField(str: string) {
    this.chargeMaterialService.currentField.next(str);
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

  showMaterialModal() {
    this.showModal = true;
    this.chargeMaterialService.modalOpen.next(true);
    this.materialModal.show();
  }

  async hideMaterialModal(event?: any) {
    if (event) {
      await this.setMaterialTypes();
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




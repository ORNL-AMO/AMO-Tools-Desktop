import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { GasLoadChargeMaterial } from '../../../../shared/models/materials';
import { ChargeMaterial, ChargeMaterialOutput, ChargeMaterialResult } from '../../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../../shared/models/settings';
import { SqlDbApiService } from '../../../../tools-suite-api/sql-db-api.service';
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
  index: number;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;

  resetDataSub: Subscription;
  generateExampleSub: Subscription;

  chargeMaterialForm: FormGroup;
  materialTypes: Array<GasLoadChargeMaterial>;
  showModal: boolean;

  idString: string;
  outputSubscription: Subscription;
  lossResult: ChargeMaterialResult;
  collapseMaterialSub: Subscription;
  collapseMaterial: boolean = false;
  chargeMaterialType: string;

  constructor(
    private chargeMaterialService: ChargeMaterialService,
    private sqlDbApiService: SqlDbApiService,  
    private convertUnitsService: ConvertUnitsService,
    private gasMaterialFormService: GasMaterialFormService,
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
    this.materialTypes = this.sqlDbApiService.selectGasLoadChargeMaterials();
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
    })
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

    if (updatedChargeMaterialData && updatedChargeMaterialData.chargeMaterialType == 'Gas') {
      if (updatedChargeMaterialData && updatedChargeMaterialData.gasChargeMaterial) {
        this.chargeMaterialForm = this.gasMaterialFormService.getGasChargeMaterialForm(updatedChargeMaterialData, false);
      } else {
        this.chargeMaterialForm = this.gasMaterialFormService.initGasForm();
      }
      this.calculate();
      this.setFormState();
    }
  }

  setFormState() {
    if (this.selected == false) {
      this.chargeMaterialForm.disable();
    } else {
      this.materialTypes = this.sqlDbApiService.selectGasLoadChargeMaterials();
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

  calculate() {
    this.chargeMaterialForm = this.gasMaterialFormService.setInitialTempValidator(this.chargeMaterialForm);
    let chargeMaterial: ChargeMaterial = this.gasMaterialFormService.buildGasChargeMaterial(this.chargeMaterialForm);
    this.chargeMaterialService.updateDataArray(chargeMaterial, this.index, this.isBaseline);
  }

  checkMaterialValues() {
    let material: GasLoadChargeMaterial = this.sqlDbApiService.selectGasLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
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
    let selectedMaterial: GasLoadChargeMaterial = this.sqlDbApiService.selectGasLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (selectedMaterial) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        selectedMaterial.specificHeatVapor = this.convertUnitsService.value(selectedMaterial.specificHeatVapor).from('btulbF').to('kJkgC');
      }
      this.chargeMaterialForm.patchValue({
        materialSpecificHeat: this.roundVal(selectedMaterial.specificHeatVapor, 4)
      });
    }
    this.calculate();
  }

  showMaterialModal() {
    this.showModal = true;
    this.chargeMaterialService.modalOpen.next(true);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.materialTypes = this.sqlDbApiService.selectGasLoadChargeMaterials();
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

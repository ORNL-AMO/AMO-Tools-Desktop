import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { firstValueFrom, Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { GasLoadChargeMaterial } from '../../../../shared/models/materials';
import { ChargeMaterial, ChargeMaterialOutput, ChargeMaterialResult } from '../../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../../shared/models/settings';
import { ChargeMaterialService } from '../charge-material.service';
import { GasMaterialFormService } from './gas-material-form.service';
import { GasLoadMaterialDbService } from '../../../../indexedDb/gas-load-material-db.service';
import { roundVal } from '../../../../shared/helperFunctions';

@Component({
    selector: 'app-gas-material-form',
    templateUrl: './gas-material-form.component.html',
    styleUrls: ['./gas-material-form.component.css'],
    standalone: false
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

  chargeMaterialForm: UntypedFormGroup;
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
    private gasLoadMaterialDbService: GasLoadMaterialDbService,  
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
    this.setMaterialTypes();
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

  async setMaterialTypes(){
    this.materialTypes = await firstValueFrom(this.gasLoadMaterialDbService.getAllWithObservable());
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

  calculate() {
    this.chargeMaterialForm = this.gasMaterialFormService.setInitialTempValidator(this.chargeMaterialForm);
    let chargeMaterial: ChargeMaterial = this.gasMaterialFormService.buildGasChargeMaterial(this.chargeMaterialForm);
    this.chargeMaterialService.updateDataArray(chargeMaterial, this.index, this.isBaseline);
  }
  
  setProperties() {
    let material: GasLoadChargeMaterial = this.materialTypes.find(material => material.id === this.chargeMaterialForm.controls.materialId.value);
    if (material) {
      let specificHeatVapor: number = material.specificHeatVapor;
      if (this.settings.unitsOfMeasure === 'Metric') {
        specificHeatVapor = this.convertUnitsService.value(specificHeatVapor).from('btulbF').to('kJkgC');
      }
      this.chargeMaterialForm.patchValue({
        materialSpecificHeat: roundVal(specificHeatVapor, 4)
      });
    }
    this.calculate();
  }

  showMaterialModal() {
    this.showModal = true;
    this.chargeMaterialService.modalOpen.next(true);
    this.materialModal.show();
  }

  async hideMaterialModal(event?: any) {
    if (event) {
      await this.setMaterialTypes();
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

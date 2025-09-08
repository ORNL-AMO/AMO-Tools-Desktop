import { Component, OnInit, Input, EventEmitter, Output, ViewChild, SimpleChanges } from '@angular/core';
import { AtmosphereLossesCompareService } from '../atmosphere-losses-compare.service';
import { AtmosphereSpecificHeat } from '../../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { UntypedFormGroup } from '@angular/forms';
import { AtmosphereLoss } from '../../../../shared/models/phast/losses/atmosphereLoss';
import { AtmosphereFormService, AtmosphereLossWarnings } from '../../../../calculator/furnaces/atmosphere/atmosphere-form.service';
import { firstValueFrom } from 'rxjs';
import { AtmosphereDbService } from '../../../../indexedDb/atmosphere-db.service';
import { roundVal } from '../../../../shared/helperFunctions';

@Component({
  selector: 'app-atmosphere-losses-form',
  templateUrl: './atmosphere-losses-form.component.html',
  styleUrls: ['./atmosphere-losses-form.component.css'],
  standalone: false
})
export class AtmosphereLossesFormComponent implements OnInit {
  @Input()
  atmosphereLossForm: UntypedFormGroup;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  lossIndex: number;
  @Input()
  settings: Settings;
  @Output('inputError')
  inputError = new EventEmitter<boolean>();
  @Input()
  inSetup: boolean;
  @Input()
  isBaseline: boolean;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  firstChange: boolean = true;
  warnings: AtmosphereLossWarnings;

  hasDeletedCustomMaterial: boolean = false;
  editExistingMaterial: boolean;
  existingMaterial: AtmosphereSpecificHeat;
  materialTypes: Array<AtmosphereSpecificHeat>;
  showModal: boolean = false;
  idString: string;
  constructor(private atmosphereLossesCompareService: AtmosphereLossesCompareService,
    private lossesService: LossesService, private convertUnitsService: ConvertUnitsService, private atmosphereFormService: AtmosphereFormService, private atmosphereDbService: AtmosphereDbService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.baselineSelected) {
      if (!changes.baselineSelected.firstChange) {
        if (!this.baselineSelected) {
          this.disableForm();
        } else {
          this.setMaterialTypes();
          this.enableForm();
        }
      }
    }
  }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.lossIndex;
    }
    else {
      this.idString = '_baseline_' + this.lossIndex;
    }
    this.setMaterialTypes(true);
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.checkWarnings();
  }

  async setMaterialTypes(onInit?: boolean) {
    this.materialTypes = await firstValueFrom(this.atmosphereDbService.getAllWithObservable());
    if (onInit && this.atmosphereLossForm) {
      if (this.atmosphereLossForm.controls.atmosphereGas.value && this.atmosphereLossForm.controls.atmosphereGas.value !== '') {
        if (this.atmosphereLossForm.controls.specificHeat.value === '') {
          this.setProperties();
        } else {
          this.checkForDeletedMaterial();
        }
      }
    }
  }

  async checkForDeletedMaterial() {
    let selectedMaterial: AtmosphereSpecificHeat = await firstValueFrom(this.atmosphereDbService.getByIdWithObservable(this.atmosphereLossForm.controls.atmosphereGas.value));
    if (!selectedMaterial) {
      this.hasDeletedCustomMaterial = true;
      this.restoreMaterial();
    }
    this.save();
  }

  async restoreMaterial() {
    let customMaterial: AtmosphereSpecificHeat = {
      specificHeat: this.atmosphereLossForm.controls.specificHeat.value,
      substance: "Custom Material"
    };
    await firstValueFrom(this.atmosphereDbService.addWithObservable(customMaterial));
    await this.setMaterialTypes();
    let newMaterial: AtmosphereSpecificHeat = this.materialTypes.find(material => { return material.substance === customMaterial.substance; });
    this.atmosphereLossForm.patchValue({
      atmosphereGas: newMaterial.id
    });
  }

  async setProperties() {
    let selectedMaterial: AtmosphereSpecificHeat = await firstValueFrom(this.atmosphereDbService.getByIdWithObservable(this.atmosphereLossForm.controls.atmosphereGas.value));
    if (selectedMaterial) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        selectedMaterial.specificHeat = this.convertUnitsService.value(selectedMaterial.specificHeat).from('btuScfF').to('kJm3C');
      }

      this.atmosphereLossForm.patchValue({
        specificHeat: roundVal(selectedMaterial.specificHeat, 4)
      });
    }
    this.save();
  }

  async checkSpecificHeat() {
    if (this.atmosphereLossForm.controls.atmosphereGas.value) {
      let material: AtmosphereSpecificHeat = await firstValueFrom(this.atmosphereDbService.getByIdWithObservable(this.atmosphereLossForm.controls.atmosphereGas.value));
      if (material) {
        let val = material.specificHeat;
        if (this.settings.unitsOfMeasure === 'Metric') {
          val = this.convertUnitsService.value(val).from('btuScfF').to('kJm3C');
        }
        material.specificHeat = roundVal(val, 4);
        if (material.specificHeat !== this.atmosphereLossForm.controls.specificHeat.value) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  disableForm() {
    this.atmosphereLossForm.controls.atmosphereGas.disable();
  }

  enableForm() {
    this.atmosphereLossForm.controls.atmosphereGas.enable();
  }

  checkWarnings() {
    let tmpLoss: AtmosphereLoss = this.atmosphereFormService.getLossFromForm(this.atmosphereLossForm);
    this.warnings = this.atmosphereFormService.checkWarnings(tmpLoss);
    let hasWarning: boolean = this.warnings.temperatureWarning != undefined
    this.inputError.emit(hasWarning);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }

  save() {
    this.checkWarnings();
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }

  canCompare() {
    if (this.atmosphereLossesCompareService.baselineAtmosphereLosses && this.atmosphereLossesCompareService.modifiedAtmosphereLosses && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }
  compareAtmosphereGas(): boolean {
    if (this.canCompare()) {
      return this.atmosphereLossesCompareService.compareAtmosphereGas(this.lossIndex);
    } else {
      return false;
    }
  }

  compareSpecificHeat(): boolean {
    if (this.canCompare()) {
      return this.atmosphereLossesCompareService.compareSpecificHeat(this.lossIndex);
    } else {
      return false;
    }
  }

  compareInletTemperature(): boolean {
    if (this.canCompare()) {
      return this.atmosphereLossesCompareService.compareInletTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareOutletTemperature(): boolean {
    if (this.canCompare()) {
      return this.atmosphereLossesCompareService.compareOutletTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareFlowRate(): boolean {
    if (this.canCompare()) {
      return this.atmosphereLossesCompareService.compareFlowRate(this.lossIndex);
    } else {
      return false;
    }
  }
  compareCorrectionFactor(): boolean {
    if (this.canCompare()) {
      return this.atmosphereLossesCompareService.compareCorrectionFactor(this.lossIndex);
    } else {
      return false;
    }
  }

  showMaterialModal(editExistingMaterial: boolean) {
    this.editExistingMaterial = editExistingMaterial;
    if (editExistingMaterial === true) {
      this.existingMaterial = {
        id: this.atmosphereLossForm.controls.atmosphereGas.value,
        specificHeat: this.atmosphereLossForm.controls.specificHeat.value,
        substance: "Custom Material"
      };
    }
    this.showModal = true;
    this.lossesService.modalOpen.next(this.showModal);
    this.materialModal.show();
  }

  async hideMaterialModal(event?: any) {
    if (event) {
      await this.setMaterialTypes();
      let newMaterial: AtmosphereSpecificHeat = this.materialTypes.find(material => { return material.substance === event.substance; });
      if (newMaterial) {
        this.atmosphereLossForm.patchValue({
          atmosphereGas: newMaterial.id
        });
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.dismissMessage();
    this.showModal = false;
    this.lossesService.modalOpen.next(this.showModal);
  }

  dismissMessage() {
    this.hasDeletedCustomMaterial = false;
  }
}

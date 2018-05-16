import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from "../../../../indexedDb/window-ref.service";
import { AtmosphereLossesCompareService } from '../atmosphere-losses-compare.service';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { AtmosphereSpecificHeat } from '../../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-atmosphere-losses-form',
  templateUrl: './atmosphere-losses-form.component.html',
  styleUrls: ['./atmosphere-losses-form.component.css']
})
export class AtmosphereLossesFormComponent implements OnInit {
  @Input()
  atmosphereLossForm: FormGroup;
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

  @ViewChild('materialModal') public materialModal: ModalDirective;
  firstChange: boolean = true;
  specificHeatError: string = null;
  flowRateError: string = null;
  temperatureError: string = null;
  materialTypes: Array<AtmosphereSpecificHeat>;
  showModal: boolean = false;
  constructor(private windowRefService: WindowRefService, private atmosphereLossesCompareService: AtmosphereLossesCompareService, private suiteDbService: SuiteDbService, private lossesService: LossesService, private convertUnitsService: ConvertUnitsService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (!this.baselineSelected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    } else {
      this.firstChange = false;
    }
  }

  ngOnInit() {
    this.materialTypes = this.suiteDbService.selectAtmosphereSpecificHeat();
    this.checkTempError(true);
    this.checkCorrectionError(true);
    this.checkInputErrors();
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }

  setProperties() {
    let selectedMaterial: AtmosphereSpecificHeat = this.suiteDbService.selectAtmosphereSpecificHeatById(this.atmosphereLossForm.controls.atmosphereGas.value);
    if (this.settings.unitsOfMeasure == 'Metric') {
      selectedMaterial.specificHeat = this.convertUnitsService.value(selectedMaterial.specificHeat).from('btuScfF').to('kJm3C');
    }

    this.atmosphereLossForm.patchValue({
      specificHeat: this.roundVal(selectedMaterial.specificHeat, 4)
    });
    this.startSavePolling();
  }

  checkSpecificHeat() {
    if (this.atmosphereLossForm.controls.atmosphereGas.value) {
      let material: AtmosphereSpecificHeat = this.suiteDbService.selectAtmosphereSpecificHeatById(this.atmosphereLossForm.controls.atmosphereGas.value);
      if (material) {
        let val = material.specificHeat;
        if (this.settings.unitsOfMeasure == 'Metric') {
          val = this.convertUnitsService.value(val).from('btuScfF').to('kJm3C')
        }
        material.specificHeat = this.roundVal(val, 4);
        if (material.specificHeat != this.atmosphereLossForm.controls.specificHeat.value) {
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
    // this.atmosphereLossForm.disable();
  }

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  enableForm() {
    this.atmosphereLossForm.controls.atmosphereGas.enable();

    // this.atmosphereLossForm.enable();
  }

  checkTempError(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.atmosphereLossForm.controls.inletTemp.value > this.atmosphereLossForm.controls.outletTemp.value) {
      this.temperatureError = 'Inlet temperature is greater than outlet temperature'
    } else {
      this.temperatureError = null;
    }
  }
  checkCorrectionError(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.atmosphereLossForm.controls.specificHeat.value < 0) {
      this.specificHeatError = 'Specific Heat must be greater than 0';
    } else {
      this.specificHeatError = null;
    }
    if (this.atmosphereLossForm.controls.flowRate.value < 0) {
      this.flowRateError = 'Flow Rate must be greater than 0';
    } else {
      this.flowRateError = null;
    }
  }

  checkInputErrors() {
    if (this.temperatureError || this.specificHeatError || this.flowRateError) {
      this.inputError.emit(true);
      this.atmosphereLossesCompareService.inputError.next(true);
    } else {
      this.inputError.emit(false);
      this.atmosphereLossesCompareService.inputError.next(false);
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }
  emitSave() {
    this.saveEmit.emit(true);
  }

  startSavePolling() {
    this.checkInputErrors();
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

  showMaterialModal() {
    this.showModal = true;
    this.lossesService.modalOpen.next(this.showModal);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.materialTypes = this.suiteDbService.selectAtmosphereSpecificHeat();
      let newMaterial = this.materialTypes.filter(material => { return material.substance == event.substance })
      if (newMaterial.length != 0) {
        this.atmosphereLossForm.patchValue({
          atmosphereGas: newMaterial[0].id
        })
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.showModal = false;
    this.lossesService.modalOpen.next(this.showModal);
  }
}

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

  @ViewChild('materialModal') public materialModal: ModalDirective;
  firstChange: boolean = true;
  counter: any;
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
  }

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.initDifferenceMonitor();
  }

  setProperties() {
    let selectedMaterial = this.suiteDbService.selectAtmosphereSpecificHeatById(this.atmosphereLossForm.controls.atmosphereGas.value);
    if (this.settings.unitsOfMeasure == 'Metric') {
      selectedMaterial.specificHeat = this.convertUnitsService.value(selectedMaterial.specificHeat, ).from('btulbF').to('kJkgC');
    }

    this.atmosphereLossForm.patchValue({
      specificHeat: this.roundVal(selectedMaterial.specificHeat, 4)
    });
    this.startSavePolling();
  }

  disableForm() {
    this.atmosphereLossForm.disable();
  }

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  enableForm() {
    this.atmosphereLossForm.enable();
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

  checkInputErrors(){
    if(this.temperatureError || this.specificHeatError || this.flowRateError){
      this.inputError.emit(true);
    }else{
      this.inputError.emit(false);
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
    this.calculate.emit(true);
    this.emitSave();
  }

  initDifferenceMonitor() {
    if (this.atmosphereLossesCompareService.baselineAtmosphereLosses && this.atmosphereLossesCompareService.modifiedAtmosphereLosses && this.atmosphereLossesCompareService.differentArray.length != 0) {
      if (this.atmosphereLossesCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();

        //atmosphereGas
        this.atmosphereLossesCompareService.differentArray[this.lossIndex].different.atmosphereGas.subscribe((val) => {
          let atmosphereGasElements = doc.getElementsByName('atmosphereGas_' + this.lossIndex);
          atmosphereGasElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //specificHeat
        this.atmosphereLossesCompareService.differentArray[this.lossIndex].different.specificHeat.subscribe((val) => {
          let specificHeatElements = doc.getElementsByName('specificHeat_' + this.lossIndex);
          specificHeatElements.forEach(element => {
            element.classList.toggle('indicate-different-db', val);
          });
        })
        //inletTemp
        this.atmosphereLossesCompareService.differentArray[this.lossIndex].different.inletTemperature.subscribe((val) => {
          let inletTempElements = doc.getElementsByName('inletTemp_' + this.lossIndex);
          inletTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //outletTemp
        this.atmosphereLossesCompareService.differentArray[this.lossIndex].different.outletTemperature.subscribe((val) => {
          let outletTempElements = doc.getElementsByName('outletTemp_' + this.lossIndex);
          outletTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //flowRate
        this.atmosphereLossesCompareService.differentArray[this.lossIndex].different.flowRate.subscribe((val) => {
          let flowRateElements = doc.getElementsByName('flowRate_' + this.lossIndex);
          flowRateElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //correctionFactor
        this.atmosphereLossesCompareService.differentArray[this.lossIndex].different.correctionFactor.subscribe((val) => {
          let correctionFactorElements = doc.getElementsByName('correctionFactor_' + this.lossIndex);
          correctionFactorElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
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

import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { EnergyInputExhaustGasCompareService } from '../energy-input-exhaust-gas-compare.service';
import { FormControl, Validators } from '@angular/forms'
import * as _ from 'lodash';
//used for other loss monitoring
import { EnergyInputExhaustGasService } from '../energy-input-exhaust-gas.service';
import { PhastService } from '../../../phast.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-energy-input-exhaust-gas-form',
  templateUrl: './energy-input-exhaust-gas-form.component.html',
  styleUrls: ['./energy-input-exhaust-gas-form.component.css']
})
export class EnergyInputExhaustGasFormComponent implements OnInit {
  @Input()
  exhaustGasForm: FormGroup;
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
  availableHeat: number;
  @Output('inputError')
  inputError = new EventEmitter<boolean>();
  @Input()
  settings: Settings;

  combustionError: string = null;
  heatError: string = null;
  firstChange: boolean = true;
  counter: any;

  //otherLossArray: Array<number>;
  constructor(private windowRefService: WindowRefService, private energyInputExhaustGasCompareService: EnergyInputExhaustGasCompareService, private energyInputExhaustGasService: EnergyInputExhaustGasService, private phastService: PhastService) { }

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
    this.checkHeat(true)
  }

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.initDifferenceMonitor();
  }

  checkHeat(bool: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.settings.unitsOfMeasure === 'Imperial') {
      if (this.exhaustGasForm.controls.totalHeatInput.value > 0 && this.exhaustGasForm.controls.combustionAirTemp.value < 300) {
        this.combustionError = 'Combustion Air Temperature cannot be less than 300 degrees F';
      } else {
        this.combustionError = null;
      }
      if (this.exhaustGasForm.controls.totalHeatInput.value > 0 && this.exhaustGasForm.controls.exhaustGasTemp.value < 40) {
        this.heatError = 'Exhaust Gas Temperature cannot be less than 40 degrees F';
      } else {
        this.heatError = null;
      }
    }
    if (this.settings.unitsOfMeasure === 'Metric') {
      if (this.exhaustGasForm.controls.totalHeatInput.value > 0 && this.exhaustGasForm.controls.combustionAirTemp.value < 150) {
        this.combustionError = 'Combustion Air Temperature cannot be less than 150 degrees C';
      } else {
        this.combustionError = null;
      }
      if (this.exhaustGasForm.controls.totalHeatInput.value > 0 && this.exhaustGasForm.controls.exhaustGasTemp.value < 4) {
        this.heatError = 'Exhaust Gas Temperature cannot be less than 4 degrees C';
      } else {
        this.heatError = null;
      }
    }
    if (this.combustionError || this.heatError) {
      this.inputError.emit(true);
    } else {
      this.inputError.emit(false);
    }
  }

  disableForm() {
    this.exhaustGasForm.disable();
  }

  enableForm() {
    this.exhaustGasForm.enable();
  }

  checkForm() {
    this.calculate.emit(true);
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
    this.checkForm();
    this.emitSave();
  }

  initDifferenceMonitor() {
    if (this.energyInputExhaustGasCompareService.baselineEnergyInputExhaustGasLosses && this.energyInputExhaustGasCompareService.modifiedEnergyInputExhaustGasLosses && this.energyInputExhaustGasCompareService.differentArray.length != 0) {
      if (this.energyInputExhaustGasCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();
        //excessAir
        this.energyInputExhaustGasCompareService.differentArray[this.lossIndex].different.excessAir.subscribe((val) => {
          let excessAirElements = doc.getElementsByName('excessAir_' + this.lossIndex);
          excessAirElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //combustionAirTemp
        this.energyInputExhaustGasCompareService.differentArray[this.lossIndex].different.combustionAirTemp.subscribe((val) => {
          let combustionAirTempElements = doc.getElementsByName('combustionAirTemp_' + this.lossIndex);
          combustionAirTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //exhaustGasTemp
        this.energyInputExhaustGasCompareService.differentArray[this.lossIndex].different.exhaustGasTemp.subscribe((val) => {
          let exhaustGasTempElements = doc.getElementsByName('exhaustGasTemp_' + this.lossIndex);
          exhaustGasTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //totalHeatInput
        this.energyInputExhaustGasCompareService.differentArray[this.lossIndex].different.totalHeatInput.subscribe((val) => {
          let totalHeatInputElements = doc.getElementsByName('totalHeatInput_' + this.lossIndex);
          totalHeatInputElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //electricalPowerInput
        this.energyInputExhaustGasCompareService.differentArray[this.lossIndex].different.electricalPowerInput.subscribe((val) => {
          let electricalPowerInputElements = doc.getElementsByName('electricalPowerInput_' + this.lossIndex);
          electricalPowerInputElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }
}

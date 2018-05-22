import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FormBuilder, Validators } from "@angular/forms";
import { FormGroup } from '@angular/forms';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { FieldMeasurementService } from './field-measurement.service';

@Component({
  selector: 'app-percent-load-estimation',
  templateUrl: './percent-load-estimation.component.html',
  styleUrls: ['./percent-load-estimation.component.css']
})
export class PercentLoadEstimationComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;
  tabSelect: string = 'results';
  toggleCalculate = false;
  loadEstimationMethod: number = 0;
  percentLoadEstimation: number;

  slipMethodData: SlipMethod = {
    synchronousSpeed: 0,
    measuredSpeed: 0,
    nameplateFullLoadSpeed: 0
  }

  fieldMeasurementData: FieldMeasurementInputs = {
    phase1Voltage: 0,
    phase1Amps: 0,
    phase2Voltage: 0,
    phase2Amps: 0,
    phase3Voltage: 0,
    phase3Amps: 0,
    ratedVoltage: 0,
    ratedCurrent: 0,
    powerFactor: 0
  }

  fieldMeasurementResults: FieldMeasurementOutputs = {
    averageVoltage: 0,
    averageCurrent: 0,
    inputPower: 0,
    percentLoad: 0,
    maxVoltageDeviation: 0,
    voltageUnbalance: 0
  }
  constructor(private formBuilder: FormBuilder, private settingsDbService: SettingsDbService, private fieldMeasurementService: FieldMeasurementService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  calculateSlipMethod(data: SlipMethod) {
    this.slipMethodData = data;
    this.percentLoadEstimation = ((data.synchronousSpeed - data.measuredSpeed)
      / (data.synchronousSpeed - data.nameplateFullLoadSpeed)) * 100;
  }

  calculateFieldMeasurementMethod(data: FieldMeasurementInputs) {
    this.fieldMeasurementData = data;
    this.fieldMeasurementResults = this.fieldMeasurementService.getResults(data);
    if (isNaN(this.fieldMeasurementResults.percentLoad) == false && this.fieldMeasurementResults.percentLoad != Infinity) {
      this.percentLoadEstimation = this.fieldMeasurementResults.percentLoad;
    } else {
      this.percentLoadEstimation = 0;
    }
  }

}


export interface SlipMethod {
  synchronousSpeed: number,
  measuredSpeed: number,
  nameplateFullLoadSpeed: number
}


export interface FieldMeasurementInputs {
  phase1Voltage: number,
  phase1Amps: number,
  phase2Voltage: number,
  phase2Amps: number,
  phase3Voltage: number,
  phase3Amps: number,
  ratedVoltage: number,
  ratedCurrent: number,
  powerFactor: number
}

export interface FieldMeasurementOutputs {
  averageVoltage: number,
  averageCurrent: number,
  inputPower: number,
  percentLoad: number,
  maxVoltageDeviation: number,
  voltageUnbalance: number
}

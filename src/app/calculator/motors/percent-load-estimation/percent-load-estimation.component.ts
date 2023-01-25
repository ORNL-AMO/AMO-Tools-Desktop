import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { FieldMeasurementInputs, SlipMethod, FieldMeasurementOutputs, PercentLoadEstimationService } from './percent-load-estimation.service';
import { MotorItem } from '../../../motor-inventory/motor-inventory';

@Component({
  selector: 'app-percent-load-estimation',
  templateUrl: './percent-load-estimation.component.html',
  styleUrls: ['./percent-load-estimation.component.css']
})
export class PercentLoadEstimationComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  smallScreenTab: string = 'form';
  containerHeight: number;
  headerHeight: number;
  tabSelect: string = 'results';
  toggleCalculate = false;
  toggleResetData = false;
  toggleExampleData = false;
  loadEstimationMethod: number;
  percentLoadEstimation: number;
  currentField: string;

  slipMethodData: SlipMethod;

  fieldMeasurementData: FieldMeasurementInputs;
  fieldMeasurementResults: FieldMeasurementOutputs;

  constructor(private percentLoadEstimationService: PercentLoadEstimationService, private settingsDbService: SettingsDbService) {
  }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    this.fieldMeasurementData = this.percentLoadEstimationService.fieldMeasurementInputs;
    //this.slipMethodData = this.percentLoadEstimationService.slipMethodInputs;
    //this.loadEstimationMethod = this.percentLoadEstimationService.loadEstimationMethod;
    this.calculateFieldMeasurementMethod(this.fieldMeasurementData);
    //this.calculateSlipMethod(this.slipMethodData);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    //this.percentLoadEstimationService.loadEstimationMethod = this.loadEstimationMethod;
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  calculateSlipMethod(data: SlipMethod) {
    this.slipMethodData = data;
    this.percentLoadEstimationService.slipMethodInputs = this.slipMethodData;
    this.percentLoadEstimation = this.percentLoadEstimationService.calculateSlipMethod(data);
  }

  calculateFieldMeasurementMethod(data: FieldMeasurementInputs) {
    this.fieldMeasurementData = data;
    this.percentLoadEstimationService.fieldMeasurementInputs = this.fieldMeasurementData;
    this.fieldMeasurementResults = this.percentLoadEstimationService.getResults(data);
    if (isNaN(this.fieldMeasurementResults.percentLoad) == false && this.fieldMeasurementResults.percentLoad != Infinity) {
      this.percentLoadEstimation = this.fieldMeasurementResults.percentLoad;
    } else {
      this.percentLoadEstimation = 0;
    }
  }

  btnResetData() {
    //this.slipMethodData = this.percentLoadEstimationService.initSlipMethodInputs();
    this.fieldMeasurementData = this.percentLoadEstimationService.initFieldMeasurementInputs();
    this.calculateFieldMeasurementMethod(this.fieldMeasurementData);
    //this.calculateSlipMethod(this.slipMethodData);
    //this.toggleResetData = !this.toggleResetData;
  }

  btnGenerateExample() {
    this.fieldMeasurementData = this.percentLoadEstimationService.generateFieldMeasurementInputsExample();
    //this.slipMethodData = this.percentLoadEstimationService.generateSlipMethodInputsExample();
    // if (this.loadEstimationMethod == 0) {
    //   this.calculateSlipMethod(this.slipMethodData);
    // } else {
    // }
    this.calculateFieldMeasurementMethod(this.fieldMeasurementData);
    //this.toggleExampleData = !this.toggleExampleData;
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

  changeField(str: string) {
    this.currentField = str;
  }
}


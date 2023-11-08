import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { FieldMeasurementInputs, FieldMeasurementOutputs, PercentLoadEstimationService } from './percent-load-estimation.service';

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
  percentLoadEstimation: number;
  currentField: string;

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
    this.calculateFieldMeasurementMethod(this.fieldMeasurementData);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
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

  calculateFieldMeasurementMethod(data: FieldMeasurementInputs) {
    this.fieldMeasurementData = data;
    this.percentLoadEstimationService.fieldMeasurementInputs = this.fieldMeasurementData;
    this.fieldMeasurementResults = this.percentLoadEstimationService.getResults(data);
  }

  btnResetData() {
    this.fieldMeasurementData = this.percentLoadEstimationService.initFieldMeasurementInputs();
    this.calculateFieldMeasurementMethod(this.fieldMeasurementData);
  }

  btnGenerateExample() {
    this.fieldMeasurementData = this.percentLoadEstimationService.generateFieldMeasurementInputsExample();
    this.calculateFieldMeasurementMethod(this.fieldMeasurementData);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

  changeField(str: string) {
    this.currentField = str;
  }
}


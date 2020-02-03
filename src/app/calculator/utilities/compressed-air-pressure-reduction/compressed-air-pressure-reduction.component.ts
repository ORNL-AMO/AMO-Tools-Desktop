import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { CompressedAirPressureReductionService } from './compressed-air-pressure-reduction.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { FormBuilder } from '@angular/forms';
import { CompressedAirPressureReductionResults, CompressedAirPressureReductionData } from '../../../shared/models/standalone';
import { CompressedAirPressureReductionTreasureHunt } from '../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-compressed-air-pressure-reduction',
  templateUrl: './compressed-air-pressure-reduction.component.html',
  styleUrls: ['./compressed-air-pressure-reduction.component.css']
})
export class CompressedAirPressureReductionComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<CompressedAirPressureReductionTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  operatingHours: OperatingHours;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  headerHeight: number;
  containerHeight: number;
  currentField: string;
  tabSelect: string = 'results';
  baselineSelected: boolean = true;
  modifiedSelected: boolean = false;

  modificationExists = false;

  compressedAirPressureReductionResults: CompressedAirPressureReductionResults;
  baselineData: Array<CompressedAirPressureReductionData>;
  modificationData: Array<CompressedAirPressureReductionData>;

  constructor(private settingsDbService: SettingsDbService, private compressedAirPressureReductionService: CompressedAirPressureReductionService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.initData();
    this.getResults();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    if (!this.inTreasureHunt) {
      this.compressedAirPressureReductionService.baselineData = this.baselineData;
      this.compressedAirPressureReductionService.modificationData = this.modificationData;
    } else {
      this.compressedAirPressureReductionService.baselineData = undefined;
      this.compressedAirPressureReductionService.modificationData = undefined;
    }
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.containerHeight = this.contentContainer.nativeElement.clientHeight - this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  initData() {
    if (this.compressedAirPressureReductionService.baselineData) {
      this.baselineData = this.compressedAirPressureReductionService.baselineData;
    } else {
      let tmpObj: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.initObject(0, this.settings, true, this.operatingHours);
      this.baselineData = [tmpObj];
    }
    if (this.compressedAirPressureReductionService.modificationData) {
      this.modificationData = this.compressedAirPressureReductionService.modificationData;
      if (this.modificationData.length != 0) {
        this.modificationExists = true;
      }
    }
  }

  addBaselineEquipment() {
    let tmpObj: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.initObject(this.baselineData.length, this.settings, true, this.operatingHours);
    this.baselineData.push(tmpObj);
    if (this.modificationExists) {
      tmpObj.isBaseline = false;
      this.modificationData.push(tmpObj);
    }
    this.getResults();
  }

  removeBaselineEquipment(i: number) {
    this.baselineData.splice(i, 1);
    if (this.modificationExists) {
      this.modificationData.splice(i, 1);
      if (this.modificationData.length === 0) {
        this.modificationExists = false;
      }
    }
    this.getResults();
  }

  createModification() {
    this.modificationData = JSON.parse(JSON.stringify(this.baselineData));
    this.getResults();
    this.modificationExists = true;
    this.setModificationSelected();
  }

  updateBaselineData(data: CompressedAirPressureReductionData, index: number) {
    this.updateDataArray(this.baselineData, data, index);
    this.getResults();
  }

  updateModificationData(data: CompressedAirPressureReductionData, index: number) {
    this.updateDataArray(this.modificationData, data, index);
    this.getResults();
  }

  updateDataArray(dataArray: Array<CompressedAirPressureReductionData>, data: CompressedAirPressureReductionData, index: number) {
    dataArray[index].name = data.name;
    dataArray[index].isBaseline = data.isBaseline;
    dataArray[index].hoursPerYear = data.hoursPerYear;
    dataArray[index].electricityCost = data.electricityCost;
    dataArray[index].compressorPower = data.compressorPower;
    dataArray[index].pressure = data.pressure;
    dataArray[index].proposedPressure = data.proposedPressure;
    if (data.isBaseline && this.modificationExists) {
      this.modificationData[index].compressorPower = data.compressorPower;
      this.modificationData[index].pressure = data.pressure;
    }
  }

  getResults() {
    this.compressedAirPressureReductionResults = this.compressedAirPressureReductionService.getResults(this.settings, this.baselineData, this.modificationData);
  }

  btnResetData() {
    let tmpObj: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.initObject(0, this.settings, true, this.operatingHours);
    this.baselineData = [tmpObj];
    this.modificationData = new Array<CompressedAirPressureReductionData>();
    this.modificationExists = false;
    this.getResults();

  }

  generateExample() {
    let tmpBaselineObj: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.generateExample(this.settings, true);
    this.baselineData = [tmpBaselineObj];
    this.compressedAirPressureReductionService.baselineData = this.baselineData;
    let tmpModificationData: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.generateExample(this.settings, false);
    this.modificationData = [tmpModificationData];
    this.compressedAirPressureReductionService.modificationData = this.modificationData;
    this.modificationExists = true;
    this.baselineSelected = true;
    this.modifiedSelected = false;
  }

  btnGenerateExample() {
    this.generateExample();
    this.getResults();
  }
  
  save() {
    this.emitSave.emit({ baseline: this.baselineData, modification: this.modificationData });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  setBaselineSelected() {
    if (this.baselineSelected == false) {
      this.baselineSelected = true;
    }
  }

  setModificationSelected() {
    if (this.baselineSelected == true) {
      this.baselineSelected = false;
    }
  }
}

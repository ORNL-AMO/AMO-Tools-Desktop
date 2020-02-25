import { Component, OnInit, ViewChild, ElementRef, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { ElectricityReductionService } from './electricity-reduction.service';
import { Settings } from '../../../shared/models/settings';
import { ElectricityReductionResults, ElectricityReductionData } from '../../../shared/models/standalone';
import { ElectricityReductionTreasureHunt } from '../../../shared/models/treasure-hunt';
import { OperatingHours } from '../../../shared/models/operations';

@Component({
  selector: 'app-electricity-reduction',
  templateUrl: './electricity-reduction.component.html',
  styleUrls: ['./electricity-reduction.component.css']
})
export class ElectricityReductionComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<ElectricityReductionTreasureHunt>();
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

  electricityReductionResults: ElectricityReductionResults;
  baselineData: Array<ElectricityReductionData>;
  modificationData: Array<ElectricityReductionData>;
  constructor(private settingsDbService: SettingsDbService, private electricityReductionService: ElectricityReductionService) { }

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
      this.electricityReductionService.baselineData = this.baselineData;
      this.electricityReductionService.modificationData = this.modificationData;
    } else {
      this.electricityReductionService.baselineData = undefined;
      this.electricityReductionService.modificationData = undefined;
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
    if (this.electricityReductionService.baselineData) {
      this.baselineData = this.electricityReductionService.baselineData;
    } else {
      let tmpObj: ElectricityReductionData = this.electricityReductionService.initObject(0, this.settings, this.operatingHours);
      this.baselineData = [tmpObj];
    }
    if (this.electricityReductionService.modificationData) {
      this.modificationData = this.electricityReductionService.modificationData;
      if (this.modificationData.length != 0) {
        this.modificationExists = true;
      }
    }
  }

  addBaselineEquipment() {
    let tmpObj: ElectricityReductionData = this.electricityReductionService.initObject(this.baselineData.length, this.settings, this.operatingHours);
    this.baselineData.push(tmpObj);
    this.getResults();
  }

  removeBaselineEquipment(i: number) {
    this.baselineData.splice(i, 1);
    this.getResults();
  }

  createModification() {
    this.modificationData = JSON.parse(JSON.stringify(this.baselineData));
    this.getResults();
    this.modificationExists = true;
    this.setModificationSelected();
  }

  addModificationEquipment() {
    let tmpObj: ElectricityReductionData = this.electricityReductionService.initObject(this.modificationData.length, this.settings, this.operatingHours);
    this.modificationData.push(tmpObj);
    this.getResults();
  }

  removeModificationEquipment(i: number) {
    this.modificationData.splice(i, 1);
    if (this.modificationData.length === 0) {
      this.modificationExists = false;
    }
    this.getResults();
  }

  updateBaselineData(data: ElectricityReductionData, index: number) {
    this.updateDataArray(this.baselineData, data, index);
    this.getResults();
  }

  updateModificationData(data: ElectricityReductionData, index: number) {
    this.updateDataArray(this.modificationData, data, index);
    this.getResults();
  }

  updateDataArray(dataArray: Array<ElectricityReductionData>, data: ElectricityReductionData, index: number) {
    dataArray[index].name = data.name;
    dataArray[index].operatingHours = data.operatingHours;
    dataArray[index].electricityCost = data.electricityCost;
    dataArray[index].measurementMethod = data.measurementMethod;
    dataArray[index].multimeterData = data.multimeterData;
    dataArray[index].otherMethodData = data.otherMethodData;
    dataArray[index].powerMeterData = data.powerMeterData;
    dataArray[index].nameplateData = data.nameplateData;
    dataArray[index].units = data.units;
  }


  getResults() {
    this.electricityReductionResults = this.electricityReductionService.getResults(this.settings, this.baselineData, this.modificationData);
  }

  btnResetData() {
    let tmpObj: ElectricityReductionData = this.electricityReductionService.initObject(0, this.settings, this.operatingHours)
    this.baselineData = [tmpObj];
    this.modificationData = new Array<ElectricityReductionData>();
    this.modificationExists = false;
    this.getResults();
  }

  generateExample() {
    let tmpBaselineObj: ElectricityReductionData = this.electricityReductionService.generateExample(this.settings, true);
    this.baselineData = [tmpBaselineObj];
    this.electricityReductionService.baselineData = this.baselineData;
    let tmpModificationData: ElectricityReductionData = this.electricityReductionService.generateExample(this.settings, false);
    this.modificationData = [tmpModificationData];
    this.electricityReductionService.modificationData = this.modificationData;
    this.modificationExists = true;
    this.baselineSelected = true;
    this.modifiedSelected = false;
  }

  btnGenerateExample() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
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

import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CompressedAirReductionService } from './compressed-air-reduction.service';
import { CompressedAirReductionData, CompressedAirReductionResults } from '../../../shared/models/standalone';
import { CompressedAirReductionTreasureHunt } from '../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-compressed-air-reduction',
  templateUrl: './compressed-air-reduction.component.html',
  styleUrls: ['./compressed-air-reduction.component.css']
})
export class CompressedAirReductionComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<CompressedAirReductionTreasureHunt>();
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

  compressedAirReductionResults: CompressedAirReductionResults;
  baselineData: Array<CompressedAirReductionData>;
  modificationData: Array<CompressedAirReductionData>;

  constructor(private settingsDbService: SettingsDbService, private compressedAirReductionService: CompressedAirReductionService) { }

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
      this.compressedAirReductionService.baselineData = this.baselineData;
      this.compressedAirReductionService.modificationData = this.modificationData;
    } else {
      this.compressedAirReductionService.baselineData = undefined;
      this.compressedAirReductionService.modificationData = undefined;
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
    if (this.compressedAirReductionService.baselineData) {
      this.baselineData = this.compressedAirReductionService.baselineData;
    } else {
      let tmpObj: CompressedAirReductionData = this.compressedAirReductionService.initObject(0, this.settings, this.operatingHours, 1);
      this.baselineData = [tmpObj];
    }
    if (this.compressedAirReductionService.modificationData) {
      this.modificationData = this.compressedAirReductionService.modificationData;
      if (this.modificationData.length != 0) {
        this.modificationExists = true;
      }
    }
  }

  addBaselineEquipment() {
    let tmpObj: CompressedAirReductionData = this.compressedAirReductionService.initObject(this.baselineData.length, this.settings, this.operatingHours);
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
    let tmpObj: CompressedAirReductionData = this.compressedAirReductionService.initObject(this.modificationData.length, this.settings, this.operatingHours, this.baselineData[0].utilityType);
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

  updateBaselineData(data: CompressedAirReductionData, index: number) {
    this.updateDataArray(this.baselineData, data, index);
    this.getResults();
  }

  updateModificationData(data: CompressedAirReductionData, index: number) {
    this.updateDataArray(this.modificationData, data, index);
    this.getResults();
  }

  updateDataArray(dataArray: Array<CompressedAirReductionData>, data: CompressedAirReductionData, index: number) {
    dataArray[index].name = data.name;
    dataArray[index].hoursPerYear = data.hoursPerYear;
    dataArray[index].utilityType = data.utilityType;
    dataArray[index].utilityCost = data.utilityType == 0 ? data.compressedAirCost : data.electricityCost;
    dataArray[index].compressedAirCost = data.compressedAirCost;
    dataArray[index].electricityCost = data.electricityCost;
    dataArray[index].measurementMethod = data.measurementMethod;
    dataArray[index].flowMeterMethodData = data.flowMeterMethodData;
    dataArray[index].bagMethodData = data.bagMethodData;
    dataArray[index].pressureMethodData = data.pressureMethodData;
    dataArray[index].otherMethodData = data.otherMethodData;
    dataArray[index].compressorElectricityData = data.compressorElectricityData;
    dataArray[index].units = data.units;
  }

  getResults() {
    this.compressedAirReductionResults = this.compressedAirReductionService.getResults(this.settings, this.baselineData, this.modificationData);
  }

  btnResetData() {
    let tmpObj: CompressedAirReductionData = this.compressedAirReductionService.initObject(0, this.settings, this.operatingHours, 1);
    this.baselineData = [tmpObj];
    this.modificationData = new Array<CompressedAirReductionData>();
    this.modificationExists = false;
    this.getResults();
  }

  generateExample() {
    let tmpBaselineObj: CompressedAirReductionData = this.compressedAirReductionService.generateExample(this.settings, true);
    this.baselineData = [tmpBaselineObj];
    this.compressedAirReductionService.baselineData = this.baselineData;
    let tmpModificationData: CompressedAirReductionData = this.compressedAirReductionService.generateExample(this.settings, false);
    this.modificationData = [tmpModificationData];
    this.compressedAirReductionService.modificationData = this.modificationData;
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

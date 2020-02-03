import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { WaterReductionTreasureHunt } from '../../../shared/models/treasure-hunt';
import { WaterReductionData, WaterReductionResults } from '../../../shared/models/standalone';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { WaterReductionService } from './water-reduction.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-water-reduction',
  templateUrl: './water-reduction.component.html',
  styleUrls: ['./water-reduction.component.css']
})
export class WaterReductionComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<WaterReductionTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  operatingHours: OperatingHours;
  @Input()
  isWastewater: boolean = false;

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

  waterReductionResults: WaterReductionResults;
  baselineData: Array<WaterReductionData>;
  modificationData: Array<WaterReductionData>;

  constructor(private settingsDbService: SettingsDbService, private waterReductionService: WaterReductionService, private formBuilder: FormBuilder) { }

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
      this.waterReductionService.baselineData = this.baselineData;
      this.waterReductionService.modificationData = this.modificationData;
    } else {
      this.waterReductionService.baselineData = undefined;
      this.waterReductionService.modificationData = undefined;
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
    if (this.waterReductionService.baselineData) {
      this.baselineData = this.waterReductionService.baselineData;
    } else {
      let tmpObj: WaterReductionData = this.waterReductionService.initObject(0, this.settings, this.isWastewater, this.operatingHours);
      this.baselineData = [tmpObj];
    }
    if (this.waterReductionService.modificationData) {
      this.modificationData = this.waterReductionService.modificationData;
      if (this.modificationData.length != 0) {
        this.modificationExists = true;
      }
    }
  }

  addBaselineEquipment() {
    let tmpObj: WaterReductionData = this.waterReductionService.initObject(this.baselineData.length, this.settings, this.isWastewater, this.operatingHours);
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
    let tmpObj: WaterReductionData = this.waterReductionService.initObject(this.modificationData.length, this.settings, this.isWastewater, this.operatingHours);
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

  updateBaselineData(data: WaterReductionData, index: number) {
    this.updateDataArray(this.baselineData, data, index);
    this.getResults();
  }

  updateModificationData(data: WaterReductionData, index: number) {
    this.updateDataArray(this.modificationData, data, index);
    this.getResults();
  }

  updateDataArray(dataArray: Array<WaterReductionData>, data: WaterReductionData, index: number) {
    dataArray[index].name = data.name;
    dataArray[index].hoursPerYear = data.hoursPerYear;
    dataArray[index].isWastewater = data.isWastewater;
    dataArray[index].waterCost = data.waterCost;
    dataArray[index].measurementMethod = data.measurementMethod;
    dataArray[index].volumeMeterMethodData = data.volumeMeterMethodData;
    dataArray[index].meteredFlowMethodData = data.meteredFlowMethodData;
    dataArray[index].bucketMethodData = data.bucketMethodData;
    dataArray[index].otherMethodData = data.otherMethodData;
  }

  getResults() {
    this.waterReductionResults = this.waterReductionService.getResults(this.settings, this.baselineData, this.modificationData);
  }

  btnResetData() {
    let tmpObj: WaterReductionData = this.waterReductionService.initObject(0, this.settings, this.isWastewater, this.operatingHours);
    this.baselineData = [tmpObj];
    this.modificationData = new Array<WaterReductionData>();
    this.modificationExists = false;
    this.getResults();
  }

  btnGenerateExample() {
    let tmpObj: WaterReductionData = this.waterReductionService.getBaselineExample(this.settings, this.operatingHours);
    this.baselineData = [tmpObj];
    this.getResults();
    let modificationObj: WaterReductionData = JSON.parse(JSON.stringify(tmpObj));
    modificationObj.measurementMethod = 3;
    modificationObj.otherMethodData.consumption = this.waterReductionResults.baselineResults.waterUse * .95;
    if (this.settings.unitsOfMeasure == 'Imperial') {
      modificationObj.otherMethodData.consumption = modificationObj.otherMethodData.consumption * 1000;
    }
    modificationObj.otherMethodData.consumption = Number(modificationObj.otherMethodData.consumption.toFixed(3));
    this.modificationData = [modificationObj];
    this.getResults();
    this.modificationExists = true;
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

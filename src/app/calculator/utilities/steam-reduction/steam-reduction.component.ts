import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { SteamReductionResults, SteamReductionData } from '../../../shared/models/standalone';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SteamReductionService } from './steam-reduction.service';
import { SteamReductionTreasureHunt } from '../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-steam-reduction',
  templateUrl: './steam-reduction.component.html',
  styleUrls: ['./steam-reduction.component.css']
})
export class SteamReductionComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<SteamReductionTreasureHunt>();
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

  containerHeight: number;
  currentField: string;
  tabSelect: string = 'results';
  baselineSelected: boolean = true;

  modificationExists = false;

  steamReductionResults: SteamReductionResults;
  baselineData: Array<SteamReductionData>;
  modificationData: Array<SteamReductionData>;

  steamUtilityCost: number;
  naturalGasUtilityCost: number;
  otherUtilityCost: number;

  constructor(private settingsDbService: SettingsDbService, private steamReductionService: SteamReductionService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.initCosts();
    this.initData();
    this.getResults();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestory() {
    if (!this.inTreasureHunt) {
      this.steamReductionService.baselineData = this.baselineData;
      this.steamReductionService.modificationData = this.modificationData;
    } else {
      this.steamReductionService.baselineData = undefined;
      this.steamReductionService.modificationData = undefined;
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

  initCosts() {
    this.steamUtilityCost = this.settings.steamCost ? this.settings.steamCost : 0.12;
    this.naturalGasUtilityCost = this.settings.fuelCost ? this.settings.fuelCost : 0.006;
    this.otherUtilityCost = 0.05;
  }

  initData() {
    if (this.steamReductionService.baselineData) {
      this.baselineData = this.steamReductionService.baselineData;
    } else {
      let tmpObj: SteamReductionData = this.steamReductionService.initObject(0, this.settings, this.operatingHours, 1, this.steamUtilityCost, this.naturalGasUtilityCost, this.otherUtilityCost);
      this.baselineData = [tmpObj];
    }
    if (this.steamReductionService.modificationData) {
      this.modificationData = this.steamReductionService.modificationData
      if (this.modificationData.length != 0) {
        this.modificationExists = true;
      }
    }
  }

  addBaselineEquipment() {
    let tmpObj: SteamReductionData = this.steamReductionService.initObject(this.baselineData.length, this.settings, this.operatingHours, this.baselineData[0].utilityType, this.baselineData[0].steamUtilityCost, this.baselineData[0].naturalGasUtilityCost, this.baselineData[0].otherUtilityCost);
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
    let tmpObj: SteamReductionData = this.steamReductionService.initObject(this.modificationData.length, this.settings, this.operatingHours, this.baselineData[0].utilityType, this.baselineData[0].steamUtilityCost, this.baselineData[0].naturalGasUtilityCost, this.baselineData[0].otherUtilityCost);
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

  updateBaselineData(data: SteamReductionData, index: number) {
    this.updateDataArray(this.baselineData, data, index);
    this.getResults();
  }

  updateModificationData(data: SteamReductionData, index: number) {
    this.updateDataArray(this.modificationData, data, index);
    this.getResults();
  }

  updateDataArray(dataArray: Array<SteamReductionData>, data: SteamReductionData, index: number) {
    dataArray[index].name = data.name;
    dataArray[index].hoursPerYear = data.hoursPerYear;
    dataArray[index].utilityType = data.utilityType;
    dataArray[index].utilityCost = data.utilityCost;
    dataArray[index].measurementMethod = data.measurementMethod;
    dataArray[index].systemEfficiency = data.systemEfficiency;
    dataArray[index].pressure = data.pressure;
    dataArray[index].flowMeterMethodData = data.flowMeterMethodData;
    dataArray[index].airMassFlowMethodData = data.airMassFlowMethodData;
    dataArray[index].waterMassFlowMethodData = data.waterMassFlowMethodData;
    dataArray[index].otherMethodData = data.otherMethodData;
    dataArray[index].units = data.units;
    dataArray[index].otherUtilityCost = data.otherUtilityCost;
    dataArray[index].steamUtilityCost = data.steamUtilityCost;
    dataArray[index].naturalGasUtilityCost = data.naturalGasUtilityCost;
  }

  getResults() {
    this.steamReductionResults = this.steamReductionService.getResults(this.settings, this.baselineData, this.modificationData);
  }

  btnResetData() {
    let tmpObj: SteamReductionData = this.steamReductionService.initObject(0, this.settings, this.operatingHours, 1, this.steamUtilityCost, this.naturalGasUtilityCost, this.otherUtilityCost);
    this.baselineData = [tmpObj];
    this.modificationData = new Array<SteamReductionData>();
    this.modificationExists = false;
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

  btnGenerateExample() {
    let tmpObj: SteamReductionData = this.steamReductionService.initObject(0, this.settings, this.operatingHours, 1, this.steamUtilityCost, this.naturalGasUtilityCost, this.otherUtilityCost);
    this.baselineData = [tmpObj];
    this.getResults();
    let modificationObj: SteamReductionData = JSON.parse(JSON.stringify(tmpObj));
    modificationObj.measurementMethod = 3;
    modificationObj.otherMethodData.consumption = this.steamReductionResults.baselineResults.energyUse * .95;
    modificationObj.otherMethodData.consumption = Number(modificationObj.otherMethodData.consumption.toFixed(3));
    this.modificationData = [modificationObj];
    this.getResults();
    this.modificationExists = true;
  }
}

import { Component, OnInit, ElementRef, ViewChild, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { LightingReplacementService } from './lighting-replacement.service';
import { LightingReplacementData, LightingReplacementResults } from '../../../shared/models/lighting';
import { LightingReplacementTreasureHunt } from '../../../shared/models/treasure-hunt';
import { OperatingHours } from '../../../shared/models/operations';
@Component({
  selector: 'app-lighting-replacement',
  templateUrl: './lighting-replacement.component.html',
  styleUrls: ['./lighting-replacement.component.css']
})
export class LightingReplacementComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<LightingReplacementTreasureHunt>();
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
  currentField: string;
  tabSelect: string = 'results';
  baselineSelected: boolean = true;

  baselineData: Array<LightingReplacementData>;
  modificationData: Array<LightingReplacementData>;

  lightingReplacementResults: LightingReplacementResults;
  modificationExists: boolean = false;
  containerHeight: number;

  baselineElectricityCost: number = 0;
  modificationElectricityCost: number = 0;
  constructor(private settingsDbService: SettingsDbService, private lightingReplacementService: LightingReplacementService) { }

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
      this.lightingReplacementService.baselineData = this.baselineData;
      this.lightingReplacementService.modificationData = this.modificationData;
      this.lightingReplacementService.baselineElectricityCost = this.baselineElectricityCost;
      this.lightingReplacementService.modificationElectricityCost = this.modificationElectricityCost;
    } else {
      this.lightingReplacementService.baselineData = undefined;
      this.lightingReplacementService.modificationData = undefined;
      this.lightingReplacementService.baselineElectricityCost = undefined;
      this.lightingReplacementService.modificationElectricityCost = undefined;
    }
    this.lightingReplacementService.showAdditionalDetails = false;
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
    if (this.lightingReplacementService.baselineData) {
      this.baselineData = this.lightingReplacementService.baselineData;
    } else {
      let tmpObj: LightingReplacementData = this.lightingReplacementService.initObject(0, this.operatingHours)
      this.baselineData = [tmpObj];
    }
    if (this.lightingReplacementService.modificationData) {
      this.modificationData = this.lightingReplacementService.modificationData;
      if (this.modificationData.length != 0) {
        this.modificationExists = true;
      }
    }

    if (this.lightingReplacementService.baselineElectricityCost) {
      this.baselineElectricityCost = this.lightingReplacementService.baselineElectricityCost;
    } else {
      this.baselineElectricityCost = this.settings.electricityCost;
    }
    if (this.lightingReplacementService.modificationElectricityCost) {
      this.modificationElectricityCost = this.lightingReplacementService.modificationElectricityCost;
    } else {
      this.modificationElectricityCost = this.settings.electricityCost;
    }
  }

  addBaselineFixture() {
    let tmpObj: LightingReplacementData = this.lightingReplacementService.initObject(this.baselineData.length, this.operatingHours);
    this.baselineData.push(tmpObj);
    this.getResults();
  }

  removeBaselineFixture(index: number) {
    this.baselineData.splice(index, 1);
    this.getResults();
  }

  createModification() {
    this.modificationData = JSON.parse(JSON.stringify(this.baselineData));
    this.modificationExists = true;
    this.setModificationSelected();
    this.getResults();
  }

  addModificationFixture() {
    let tmpObj: LightingReplacementData = this.lightingReplacementService.initObject(this.modificationData.length, this.operatingHours);
    this.modificationData.push(tmpObj);
    this.getResults();
  }

  removeModificationFixture(index: number) {
    this.modificationData.splice(index, 1);
    if (this.modificationData.length === 0) {
      this.modificationExists = false;
    }
    this.getResults();
  }

  updateBaselineData(data: LightingReplacementData, index: number) {
    this.updateDataArray(this.baselineData, data, index);
    this.getResults();
  }

  updateModificationData(data: LightingReplacementData, index: number) {
    // this.modificationData[index] = data;
    this.updateDataArray(this.modificationData, data, index);
    this.getResults();
  }

  updateDataArray(dataArray: Array<LightingReplacementData>, data: LightingReplacementData, index: number) {
    dataArray[index].name = data.name;
    dataArray[index].hoursPerYear = data.hoursPerYear;
    dataArray[index].wattsPerLamp = data.wattsPerLamp;
    dataArray[index].lampsPerFixture = data.lampsPerFixture;
    dataArray[index].numberOfFixtures = data.numberOfFixtures;
    dataArray[index].lumensPerLamp = data.lumensPerLamp;
    dataArray[index].totalLighting = data.totalLighting;
    dataArray[index].electricityUse = data.electricityUse;
    //added for #2381
    dataArray[index].lampLife = data.lampLife;
    dataArray[index].ballastFactor = data.ballastFactor;
    dataArray[index].lumenDegradationFactor = data.lumenDegradationFactor;
    dataArray[index].coefficientOfUtilization = data.coefficientOfUtilization;
    dataArray[index].category = data.category;
    dataArray[index].type = data.type;
  }

  getResults() {
    let tHuntObj: LightingReplacementTreasureHunt = this.getTreasureHuntObject();
    this.lightingReplacementResults = this.lightingReplacementService.getResults(tHuntObj);
  }

  focusField(str: string) {
    this.currentField = str;
  }

  getTreasureHuntObject(): LightingReplacementTreasureHunt {
    return {
      baseline: this.baselineData,
      modifications: this.modificationData,
      baselineElectricityCost: this.baselineElectricityCost,
      modificationElectricityCost: this.modificationElectricityCost
    };
  }

  save() {
    let tHuntObj: LightingReplacementTreasureHunt = this.getTreasureHuntObject();
    this.emitSave.emit(tHuntObj);
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  btnResetData() {
    let tmpObj: LightingReplacementData = this.lightingReplacementService.initObject(0, this.operatingHours)
    this.baselineData = [tmpObj];
    this.modificationData = new Array<LightingReplacementData>();
    this.modificationExists = false;
    this.lightingReplacementService.showAdditionalDetails = false;
    this.getResults();
  }

  generateExample() {
    let tmpBaselineObj: LightingReplacementData = this.lightingReplacementService.generateExample(true);
    this.baselineData = [tmpBaselineObj];
    this.lightingReplacementService.baselineData = this.baselineData;
    let tmpModificationObj: LightingReplacementData = this.lightingReplacementService.generateExample(false);
    this.modificationData = [tmpModificationObj];
    this.lightingReplacementService.modificationData = this.modificationData;
    this.modificationExists = true;
    this.baselineElectricityCost = 0.062;
    this.modificationElectricityCost = 0.062;
    this.lightingReplacementService.baselineElectricityCost = this.baselineElectricityCost;
    this.lightingReplacementService.modificationElectricityCost = this.modificationElectricityCost;
    this.lightingReplacementService.showAdditionalDetails = true;
  }

  btnGenerateExample() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.generateExample();
    this.getResults();
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

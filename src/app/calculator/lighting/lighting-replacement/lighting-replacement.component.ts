import { Component, OnInit, ElementRef, ViewChild, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { LightingReplacementService } from './lighting-replacement.service';
import { LightingReplacementData, LightingReplacementResults, LightingReplacementResult } from '../../../shared/models/lighting';
import { LightingReplacementTreasureHunt } from '../../../shared/models/treasure-hunt';
import { OperatingHours } from '../../../shared/models/operations';
import { FormGroup } from '@angular/forms';

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
  @Output('emitAddOpportunitySheet')
  emitAddOpportunitySheet = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  operatingHours: OperatingHours;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;
  @ViewChild('contentContainer') contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
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
    this.baselineData[index] = data;
    this.getResults();
  }

  updateModificationData(data: LightingReplacementData, index: number) {
    this.modificationData[index] = data;
    this.getResults();
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
    }
  }

  save() {
    let tHuntObj: LightingReplacementTreasureHunt = this.getTreasureHuntObject();
    this.emitSave.emit(tHuntObj);
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  addOpportunitySheet() {
    this.emitAddOpportunitySheet.emit(true);
  }

  btnResetData() {
    let tmpObj: LightingReplacementData = this.lightingReplacementService.initObject(0, this.operatingHours)
    this.baselineData = [tmpObj];
    this.modificationData = new Array<LightingReplacementData>();
    this.modificationExists = false;
  }

  togglePanel() {
    this.baselineSelected = !this.baselineSelected;
  }
}

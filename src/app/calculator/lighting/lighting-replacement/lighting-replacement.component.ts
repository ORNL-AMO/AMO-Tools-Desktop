import { Component, OnInit, ElementRef, ViewChild, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { LightingReplacementService } from './lighting-replacement.service';
import { LightingReplacementData, LightingReplacementResults } from '../../../shared/models/lighting';
import { LightingReplacementTreasureHunt } from '../../../shared/models/treasure-hunt';

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


  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;
  @ViewChild('contentContainer') contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  headerHeight: number;
  currentField: string;
  tabSelect: string = 'results';
  baselineData: Array<LightingReplacementData>;
  modificationData: Array<LightingReplacementData> = [];
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
    if (this.lightingReplacementService.baselineData) {
      this.baselineData = this.lightingReplacementService.baselineData;
    } else {
      this.baselineData = this.lightingReplacementService.getInitializedData();
    }

    if (this.lightingReplacementService.modificationData) {
      this.modificationData = this.lightingReplacementService.modificationData;
      this.modificationExists = true;
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

    this.calculate();
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

  btnResetData() {
    this.baselineData = this.lightingReplacementService.getInitializedData();
    this.modificationData = new Array<LightingReplacementData>();
    this.modificationExists = false;
    this.lightingReplacementService.baselineData = this.baselineData;
    this.lightingReplacementService.modificationData = this.modificationData;
    this.calculate();
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

  calculate() {
    this.baselineData.forEach(data => {
      data = this.lightingReplacementService.calculate(data);
    })
    this.modificationData.forEach(data => {
      data = this.lightingReplacementService.calculate(data);
    })

    this.lightingReplacementResults = this.lightingReplacementService.getResults({
      baseline: this.baselineData,
      modifications: this.modificationData,
      baselineElectricityCost: this.baselineElectricityCost,
      modificationElectricityCost: this.modificationElectricityCost
    });
  }

  addBaselineFixture() {
    this.baselineData.push({
      hoursPerDay: 0,
      daysPerMonth: 30,
      monthsPerYear: 12,
      hoursPerYear: 0,
      wattsPerLamp: 0,
      lampsPerFixture: 0,
      numberOfFixtures: 0,
      lumensPerLamp: 0,
      totalLighting: 0,
      electricityUse: 0
    });
    this.calculate();
  }

  removeBaselineFixture(index: number) {
    this.baselineData.splice(index, 1);
    this.calculate();

  }

  addModification() {
    this.modificationData = JSON.parse(JSON.stringify(this.baselineData));
    this.modificationExists = true;
    this.calculate();
  }

  addModificationFixture() {
    this.modificationData.push({
      hoursPerDay: 0,
      daysPerMonth: 30,
      monthsPerYear: 12,
      hoursPerYear: 0,
      wattsPerLamp: 0,
      lampsPerFixture: 0,
      numberOfFixtures: 0,
      lumensPerLamp: 0,
      totalLighting: 0,
      electricityUse: 0
    });
    this.calculate();
  }

  removeModificationFixture(index: number) {
    this.modificationData.splice(index, 1);
    this.calculate();
  }

  focusField(str: string) {
    this.currentField = str;
  }

  save() {
    this.emitSave.emit({ baseline: this.baselineData, modifications: this.modificationData, baselineElectricityCost: this.baselineElectricityCost, modificationElectricityCost: this.modificationElectricityCost });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  addOpportunitySheet() {
    this.emitAddOpportunitySheet.emit(true);
  }
}

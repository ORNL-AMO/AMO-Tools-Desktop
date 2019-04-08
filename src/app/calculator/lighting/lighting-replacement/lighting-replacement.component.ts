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

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;
  @ViewChild('contentContainer') contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  headerHeight: number;
  currentField: string;
  tabSelect: string = 'results';
  settings: Settings;
  baselineData: Array<LightingReplacementData>;
  baselineElectricityUse: number;
  modificationData: Array<LightingReplacementData> = [];
  modificationElectricityUse: number;
  baselineResults: LightingReplacementResults;
  modificationResults: LightingReplacementResults;
  baselineSelected: boolean = true;
  modifiedSelected: boolean = false;
  modificationExists: boolean = false;
  containerHeight: number;
  constructor(private settingsDbService: SettingsDbService, private lightingReplacementService: LightingReplacementService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
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
    }
  }

  btnResetData() {
    this.baselineData = this.lightingReplacementService.getInitializedData();
    this.modificationData = new Array<LightingReplacementResults>();
    this.lightingReplacementService.baselineData = this.baselineData;
    this.lightingReplacementService.modificationData = this.modificationData;
    this.calculate();
  }

  togglePanel(bool: boolean) {
    if (bool == this.baselineSelected) {
      this.baselineSelected = true;
      this.modifiedSelected = false;
    }
    else if (bool == this.modifiedSelected) {
      this.modifiedSelected = true;
      this.baselineSelected = false;
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

  calculate() {
    this.baselineData.forEach(data => {
      data = this.lightingReplacementService.calculate(data);
    })
    this.baselineResults = this.lightingReplacementService.getTotals(this.baselineData);
    this.modificationData.forEach(data => {
      data = this.lightingReplacementService.calculate(data);
    })
    this.modificationResults = this.lightingReplacementService.getTotals(this.modificationData);
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
    this.togglePanel(this.modifiedSelected);
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
    this.emitSave.emit({ baseline: this.baselineData, modifications: this.modificationData });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  addOpportunitySheet() {
    this.emitAddOpportunitySheet.emit(true);
  }
}

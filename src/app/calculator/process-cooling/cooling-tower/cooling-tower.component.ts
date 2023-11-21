import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CoolingTowerService } from './cooling-tower.service';
import { Subscription } from 'rxjs';
import { CoolingTowerOutput, CoolingTowerData } from '../../../shared/models/chillers';
import { CoolingTowerMakeupWaterTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-cooling-tower',
  templateUrl: './cooling-tower.component.html',
  styleUrls: ['./cooling-tower.component.css']
})
export class CoolingTowerComponent implements OnInit {

  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<CoolingTowerMakeupWaterTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  operatingHours: OperatingHours;


  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  smallScreenTab: string = 'baseline';
  containerHeight: number;
  currentField: string;
  tabSelect: string = 'results';
  baselineSelected = true;
  modificationExists = false;

  coolingTowerResults: CoolingTowerOutput;
  baselineData: Array<CoolingTowerData>;
  modificationData: Array<CoolingTowerData>;
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;

  constructor(private settingsDbService: SettingsDbService,
    private coolingTowerService: CoolingTowerService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-PC-cooling-tower');
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    let existingInputs = this.coolingTowerService.baselineData.getValue();
    if (!existingInputs) {
      this.coolingTowerService.initDefaultEmptyInputs(0, this.settings, this.operatingHours);
    }
    this.initSubscriptions();
    if (this.modificationData) {
      this.modificationExists = true;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    if (!this.inTreasureHunt) {
      this.coolingTowerService.baselineData.next(this.baselineData);
      this.coolingTowerService.modificationData.next(this.modificationData);
    } else {
      this.coolingTowerService.baselineData.next(undefined);
      this.coolingTowerService.modificationData.next(undefined);
    }
    this.baselineDataSub.unsubscribe();
    this.modificationDataSub.unsubscribe();
  }

  initSubscriptions() {
    this.baselineDataSub = this.coolingTowerService.baselineData.subscribe(value => {
      this.baselineData = value;
      this.setBaselineSelected();
      this.coolingTowerService.calculate(this.settings);
    })
    this.modificationDataSub = this.coolingTowerService.modificationData.subscribe(value => {
      this.modificationData = value;
      this.coolingTowerService.calculate(this.settings);
    })
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  addCase() {
    this.coolingTowerService.addCase(this.settings, this.operatingHours, this.modificationExists);
  }

  save() {
    this.emitSave.emit({ baseline: this.baselineData, modification: this.modificationData, opportunityType: Treasure.coolingTowerMakeup });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  createModification() {
    this.coolingTowerService.createModification();
    this.modificationExists = true;
    this.setModificationSelected();
  }

  btnResetData() {
    this.coolingTowerService.resetData.next(true);
    this.coolingTowerService.initDefaultEmptyInputs(0, this.settings, this.operatingHours);
    this.coolingTowerService.modificationData.next(undefined);
    this.modificationExists = false;
  }

  btnGenerateExample() {
    this.coolingTowerService.generateExampleData(this.settings);
    this.modificationExists = true;
    this.baselineSelected = true;
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

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
    if (this.smallScreenTab === 'baseline') {
      this.setBaselineSelected();
    } else if (this.smallScreenTab === 'modification') {
      this.setModificationSelected();
    }
  }
}

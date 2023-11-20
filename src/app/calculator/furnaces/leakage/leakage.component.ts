import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { LeakageLoss, LeakageLossOutput } from '../../../shared/models/phast/losses/leakageLoss';
import { Settings } from '../../../shared/models/settings';
import { LeakageLossTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { FlueGasService } from '../flue-gas/flue-gas.service';
import { LeakageService } from './leakage.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-leakage',
  templateUrl: './leakage.component.html',
  styleUrls: ['./leakage.component.css']
})
export class LeakageComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @Output("emitSave")
  emitSave = new EventEmitter<LeakageLossTreasureHunt>();
  @Output("emitCancel")
  emitCancel = new EventEmitter<boolean>();
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
  containerHeight: number;
  isModalOpen: boolean;
  isEditingName: boolean;
  modalSubscription: Subscription;

  baselineData: Array<LeakageLoss>;
  modificationData: Array<LeakageLoss>;
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;

  tabSelect: string = 'results';
  baselineSelected: boolean = true;
  modificationExists: boolean = false;
  smallScreenTab: string = 'baseline';

  constructor(private settingsDbService: SettingsDbService, private flueGasService: FlueGasService, 
              private leakageService: LeakageService,
              private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-PH-leakage');
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    let existingInputs = this.leakageService.baselineData.getValue();
    if(!existingInputs) {
      this.resetLeakageInputs();
    }
    this.initSubscriptions();
    if(this.modificationData) {
      this.modificationExists = true;
    }
  }

  ngOnDestroy() {
    this.modalSubscription.unsubscribe();
    this.baselineDataSub.unsubscribe();
    this.modificationDataSub.unsubscribe();
    if (this.inTreasureHunt) {
      this.leakageService.modificationData.next(undefined);
      this.leakageService.baselineData.next(undefined);
      this.leakageService.energySourceType.next(undefined);
      this.flueGasService.baselineData.next(undefined);
      this.flueGasService.modificationData.next(undefined);
    }
  }

  initSubscriptions() {
    this.modalSubscription = this.leakageService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    });
    this.baselineDataSub = this.leakageService.baselineData.subscribe(baselineData => {
      if (baselineData) {
        this.baselineData = baselineData;
        this.leakageService.calculate(this.settings);
      }
    });
    this.modificationDataSub = this.leakageService.modificationData.subscribe(modificationData => {
      if (modificationData) {
        this.modificationData = modificationData;
        this.leakageService.calculate(this.settings);
      }
    });
  }
  
  setTab(str: string) {
    this.tabSelect = str;
  }

  addLoss() {
    let hoursPerYear: number;
    if (this.inTreasureHunt) {
      hoursPerYear = this.operatingHours.hoursPerYear;
    }
    this.leakageService.addLoss(hoursPerYear, this.modificationExists);
  }

  createModification() {
    this.leakageService.initModification();
    this.modificationExists = true;
    this.setModificationSelected();
   }

   btnResetData() {
    this.modificationExists = false;
    this.leakageService.initDefaultEmptyInputs();
    this.leakageService.resetData.next(true);
  }

  btnGenerateExample() {
    this.leakageService.generateExampleData(this.settings, this.inTreasureHunt);
    this.modificationExists = true;
  }

  setBaselineSelected() {
    this.baselineSelected = true;
  }

  setModificationSelected() {
    this.baselineSelected = false;
  }

  focusField(str: string) {
    this.leakageService.currentField.next(str);
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }
  
  save() {
    let output: LeakageLossOutput = this.leakageService.output.getValue();
    this.emitSave.emit({
      baseline: this.baselineData,
      modification: this.modificationData,
      energySourceData: {
        energySourceType: this.baselineData[0].energySourceType,
        unit: output.energyUnit,
      },
      opportunityType: Treasure.leakageLoss
    });
  }

  cancel() {
    this.leakageService.initDefaultEmptyInputs();
    this.emitCancel.emit(true);
  }

  resetLeakageInputs() {
    if (this.inTreasureHunt) {
      this.leakageService.initTreasureHuntEmptyInputs(this.operatingHours.hoursPerYear, this.settings);
    } else {
      this.leakageService.initDefaultEmptyInputs();
    }
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
    if (this.smallScreenTab === 'baseline') {
      this.baselineSelected = true;
    } else if (this.smallScreenTab === 'modification') {
      this.baselineSelected = false;
    }
  }
}

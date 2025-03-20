import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { FixtureLoss } from '../../../shared/models/phast/losses/fixtureLoss';
import { Settings } from '../../../shared/models/settings';
import { FixtureService } from './fixture.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
    selector: 'app-fixture',
    templateUrl: './fixture.component.html',
    styleUrls: ['./fixture.component.css'],
    standalone: false
})
export class FixtureComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
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

  baselineData: Array<FixtureLoss>;
  modificationData: Array<FixtureLoss>;
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;

  tabSelect: string = 'results';
  baselineSelected: boolean = true;
  modificationExists: boolean = false;
  smallScreenTab: string = 'baseline';

  constructor(private settingsDbService: SettingsDbService, 
              private fixtureService: FixtureService,
              private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-PH-fixture');
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    let existingInputs = this.fixtureService.baselineData.getValue();
    if(!existingInputs) {
      this.fixtureService.initDefaultEmptyInputs();
      this.fixtureService.initDefaultEmptyOutput();
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
  }

  initSubscriptions() {
    this.modalSubscription = this.fixtureService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    })
    this.baselineDataSub = this.fixtureService.baselineData.subscribe(value => {
      this.baselineData = value;
      this.fixtureService.calculate(this.settings);
    })
    this.modificationDataSub = this.fixtureService.modificationData.subscribe(value => {
      this.modificationData = value
      this.fixtureService.calculate(this.settings);
    })
  }
  
  setTab(str: string) {
    this.tabSelect = str;
  }

  addLoss() {
    let hoursPerYear = this.inTreasureHunt? this.operatingHours.hoursPerYear : undefined;
    this.fixtureService.addLoss(hoursPerYear, this.modificationExists);
  }

  createModification() {
    this.fixtureService.initModification();
    this.modificationExists = true;
    this.setModificationSelected();
   }

   btnResetData() {
    this.modificationExists = false;
    this.fixtureService.initDefaultEmptyInputs();
    this.fixtureService.resetData.next(true);
  }

  btnGenerateExample() {
    this.fixtureService.generateExampleData(this.settings);
    this.modificationExists = true;
  }

  setBaselineSelected() {
    this.baselineSelected = true;
  }

  setModificationSelected() {
    this.baselineSelected = false;
  }

  focusField(str: string) {
    this.fixtureService.currentField.next(str);
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

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
    if (this.smallScreenTab === 'baseline') {
      this.baselineSelected = true;
    } else if (this.smallScreenTab === 'modification') {
      this.baselineSelected = false;
    }
  }
}

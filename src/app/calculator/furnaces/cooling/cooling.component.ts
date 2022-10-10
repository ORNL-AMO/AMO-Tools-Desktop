import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { CoolingLoss } from '../../../shared/models/phast/losses/coolingLoss';
import { Settings } from '../../../shared/models/settings';
import { CoolingService } from './cooling.service';

@Component({
  selector: 'app-cooling',
  templateUrl: './cooling.component.html',
  styleUrls: ['./cooling.component.css']
})
export class CoolingComponent implements OnInit {

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
  modalSubscription: Subscription;

  baselineData: Array<CoolingLoss>;
  modificationData: Array<CoolingLoss>;
  baselineEnergySub: Subscription;
  modificationEnergySub: Subscription;
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;

  tabSelect: string = 'results';
  baselineSelected: boolean = true;
  modificationExists: boolean = false;
  smallScreenTab: string = 'baseline';

  constructor(private settingsDbService: SettingsDbService, 
              private coolingService: CoolingService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    let existingInputs = this.coolingService.baselineData.getValue();
    if(!existingInputs) {
      this.coolingService.initDefaultEmptyInputs(this.settings);
      this.coolingService.initDefaultEmptyOutput();
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
    this.baselineEnergySub.unsubscribe();
    this.modificationEnergySub.unsubscribe();
  }

  initSubscriptions() {
    this.modalSubscription = this.coolingService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    });
    this.baselineDataSub = this.coolingService.baselineData.subscribe(value => {
      this.baselineData = value;
      this.coolingService.calculate(this.settings);
    });
    this.modificationDataSub = this.coolingService.modificationData.subscribe(value => {
      this.modificationData = value;
      this.coolingService.calculate(this.settings);
    });
    this.baselineEnergySub = this.coolingService.baselineEnergyData.subscribe(energyData => {
      this.coolingService.calculate(this.settings);
    });
    this.modificationEnergySub = this.coolingService.modificationEnergyData.subscribe(energyData => {
      this.coolingService.calculate(this.settings);
    });
  }
  
  setTab(str: string) {
    this.tabSelect = str;
  }

  addLoss() {
    let treasureHours = this.inTreasureHunt? this.operatingHours.hoursPerYear : undefined;
    this.coolingService.addLoss(this.settings, treasureHours, this.modificationExists);
  }

  createModification() {
    this.coolingService.initModification();
    this.modificationExists = true;
    this.setModificationSelected();
   }

   btnResetData() {
    this.modificationExists = false;
    this.coolingService.initDefaultEmptyInputs(this.settings);
    this.coolingService.resetData.next(true);
  }

  btnGenerateExample() {
    this.modificationExists = true;
    this.coolingService.generateExampleData(this.settings);
  }

  setBaselineSelected() {
    this.baselineSelected = true;
  }

  setModificationSelected() {
    this.baselineSelected = false;
  }

  focusField(str: string) {
    this.coolingService.currentField.next(str);
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

import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { LeakageLoss } from '../../../shared/models/phast/losses/leakageLoss';
import { Settings } from '../../../shared/models/settings';
import { LeakageService } from './leakage.service';

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

  constructor(private settingsDbService: SettingsDbService, 
              private leakageService: LeakageService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    let existingInputs = this.leakageService.baselineData.getValue();
    if(!existingInputs) {
      this.leakageService.initDefaultEmptyInputs();
      this.leakageService.initDefaultEmptyOutput();
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
    this.modalSubscription = this.leakageService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    });
    this.baselineDataSub = this.leakageService.baselineData.subscribe(value => {
      this.baselineData = value;
      this.leakageService.calculate(this.settings);
    });
    this.modificationDataSub = this.leakageService.modificationData.subscribe(value => {
      this.modificationData = value
      this.leakageService.calculate(this.settings);
    });
  }
  
  setTab(str: string) {
    this.tabSelect = str;
  }

  addLoss() {
    let hoursPerYear = this.operatingHours? this.operatingHours.hoursPerYear : undefined;
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
    this.leakageService.generateExampleData(this.settings);
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
    }
  }
}

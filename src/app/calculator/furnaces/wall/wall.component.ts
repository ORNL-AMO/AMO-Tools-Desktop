import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { WallLoss, WallLossOutput } from '../../../shared/models/phast/losses/wallLoss';
import { Settings } from '../../../shared/models/settings';
import { WallService } from './wall.service';

@Component({
  selector: 'app-wall',
  templateUrl: './wall.component.html',
  styleUrls: ['./wall.component.css']
})
export class WallComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @Input()
  operatingHours: OperatingHours;
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  isEditingName: boolean;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  containerHeight: number;
  isModalOpen: boolean;
  modalSubscription: Subscription;

  baselineData: Array<WallLoss>;
  modificationData: Array<WallLoss>;
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;

  tabSelect: string = 'results';
  baselineSelected = true;
  modificationExists = false;

  constructor(private settingsDbService: SettingsDbService, 
              private wallService: WallService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    let existingInputs = this.wallService.baselineData.getValue();
    if(!existingInputs) {
      this.wallService.initDefaultEmptyInputs();
      this.wallService.initDefaultEmptyOutput();
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
    this.modalSubscription = this.wallService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    })
    this.baselineDataSub = this.wallService.baselineData.subscribe(value => {
      this.baselineData = value;
      this.wallService.calculate(this.settings);
    })
    this.modificationDataSub = this.wallService.modificationData.subscribe(value => {
      this.modificationData = value;
      this.wallService.calculate(this.settings);
    })
  }
  
  setTab(str: string) {
    this.tabSelect = str;
  }

  addLoss() {
    let hoursPerYear = this.operatingHours? this.operatingHours.hoursPerYear : undefined;
    this.wallService.addLoss(this.settings, hoursPerYear, this.modificationExists);
  }

  createModification() {
    this.wallService.initModification();
    this.modificationExists = true;
    this.setModificationSelected();
   }

   btnResetData() {
     this.wallService.resetData.next(true);
     this.wallService.initDefaultEmptyInputs();
     this.modificationExists = false;
  }

  btnGenerateExample() {
    this.wallService.generateExampleData(this.settings);
    this.modificationExists = true;
  }

  setBaselineSelected() {
    this.baselineSelected = true;
  }

  setModificationSelected() {
    this.baselineSelected = false;
  }

  focusField(str: string) {
    this.wallService.currentField.next(str);
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

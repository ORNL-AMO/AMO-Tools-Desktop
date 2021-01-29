import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { AtmosphereLoss, AtmosphereLossOutput } from '../../../shared/models/phast/losses/atmosphereLoss';
import { Settings } from '../../../shared/models/settings';
import { AtmosphereService } from './atmosphere.service';

@Component({
  selector: 'app-atmosphere',
  templateUrl: './atmosphere.component.html',
  styleUrls: ['./atmosphere.component.css']
})
export class AtmosphereComponent implements OnInit {
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

  baselineData: Array<AtmosphereLoss>;
  modificationData: Array<AtmosphereLoss>;
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;
  outputSubscription: Subscription;
  output: AtmosphereLossOutput;

  tabSelect: string = 'results';
  baselineSelected: boolean = true;
  modificationExists: boolean = false;

  constructor(private settingsDbService: SettingsDbService, 
              private atmosphereService: AtmosphereService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    let existingInputs = this.atmosphereService.baselineData.getValue();
    if(!existingInputs) {
      this.atmosphereService.initDefaultEmptyInputs();
      this.atmosphereService.initDefaultEmptyOutput();
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
    this.outputSubscription.unsubscribe();
  }

  initSubscriptions() {
    this.modalSubscription = this.atmosphereService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    })
    this.baselineDataSub = this.atmosphereService.baselineData.subscribe(value => {
      this.baselineData = value;
      this.atmosphereService.calculate(this.settings);
    })
    this.modificationDataSub = this.atmosphereService.modificationData.subscribe(value => {
      this.modificationData = value
      this.atmosphereService.calculate(this.settings);
    })
    this.outputSubscription = this.atmosphereService.output.subscribe(val => {
      this.output = val;
    });
  }
  
  setTab(str: string) {
    this.tabSelect = str;
  }

  addLoss() {
    let hoursPerYear = this.inTreasureHunt? this.operatingHours.hoursPerYear : undefined;
    this.atmosphereService.addLoss(hoursPerYear, this.modificationExists);
  }

  createModification() {
    this.atmosphereService.initModification();
    this.modificationExists = true;
    this.setModificationSelected();
   }

   btnResetData() {
    this.modificationExists = false;
    this.atmosphereService.initDefaultEmptyInputs();
    this.atmosphereService.resetData.next(true);
  }

  btnGenerateExample() {
    this.atmosphereService.generateExampleData(this.settings);
    this.modificationExists = true;
  }

  setBaselineSelected() {
    this.baselineSelected = true;
  }

  setModificationSelected() {
    this.baselineSelected = false;
  }

  focusField(str: string) {
    this.atmosphereService.currentField.next(str);
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

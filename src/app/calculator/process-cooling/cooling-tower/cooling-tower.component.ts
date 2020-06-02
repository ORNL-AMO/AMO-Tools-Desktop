import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CoolingTowerService } from './cooling-tower.service';
import { Subscription } from 'rxjs';
import { CoolingTowerOutput, CoolingTowerData } from '../../../shared/models/chillers';

@Component({
  selector: 'app-cooling-tower',
  templateUrl: './cooling-tower.component.html',
  styleUrls: ['./cooling-tower.component.css']
})
export class CoolingTowerComponent implements OnInit {

  @Input()
  inTreasureHunt: boolean;
  @Input()
  settings: Settings;
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
  currentField: string;
  tabSelect: string = 'results';
  baselineSelected: boolean = true;
  modifiedSelected: boolean = false;
  modificationExists = true;
  
  coolingTowerResults: CoolingTowerOutput;
  baselineData: Array<CoolingTowerData>;
  modificationData: Array<CoolingTowerData>;
  
  modificationExistsSub: Subscription;
  currentFieldSub: Subscription;
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;

  constructor(private settingsDbService: SettingsDbService, 
              private coolingTowerService: CoolingTowerService) { }

    ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    let existingInputs = this.coolingTowerService.baselineData.getValue();
    if(!existingInputs) {
      this.coolingTowerService.initDefaultEmptyInputs(0, this.settings, this.operatingHours);
    }
    this.initSubscriptions();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
      this.currentFieldSub.unsubscribe();
      this.baselineDataSub.unsubscribe();
      this.modificationDataSub.unsubscribe();
      this.modificationExistsSub.unsubscribe();
  }

  initSubscriptions() {
    this.currentFieldSub = this.coolingTowerService.currentField.subscribe(val => {
      this.currentField = val;
    });
    this.baselineDataSub = this.coolingTowerService.baselineData.subscribe(value => {
      this.baselineData = value;
      this.setBaselineSelected();
      this.coolingTowerService.calculate(this.settings);
    })
    this.modificationDataSub = this.coolingTowerService.modificationData.subscribe(value => {
      this.modificationData = value;
      this.setModificationSelected();
      this.coolingTowerService.calculate(this.settings);
    })
    this.modificationExistsSub = this.coolingTowerService.modificationExists.subscribe(val => {	
      this.modificationExists = val;
    });
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

  addCase() {
    this.coolingTowerService.addCase(this.settings, this.operatingHours);
  }

  calculate() {
    this.coolingTowerService.calculate(this.settings);
  }

  createModification() {
    this.coolingTowerService.createModification();
   }

  btnResetData() {
    this.coolingTowerService.resetData.next(true);
    this.coolingTowerService.initDefaultEmptyInputs(0, this.settings, this.operatingHours);
    this.coolingTowerService.modificationExists.next(false);
  }

  btnGenerateExample() {
      this.coolingTowerService.generateExampleData(this.settings);
      this.modificationExists = true;
      this.baselineSelected = true;
      this.modifiedSelected = false;
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
}

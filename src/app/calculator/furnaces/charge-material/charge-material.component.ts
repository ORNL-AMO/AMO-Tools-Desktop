import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { ChargeMaterial } from '../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../shared/models/settings';
import { ChargeMaterialService } from './charge-material.service';

@Component({
  selector: 'app-charge-material',
  templateUrl: './charge-material.component.html',
  styleUrls: ['./charge-material.component.css']
})
export class ChargeMaterialComponent implements OnInit {

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
  lossNameForm: FormGroup;
  
  baselineData: Array<ChargeMaterial>;
  modificationData: Array<ChargeMaterial>;
  
  baselineEnergySub: Subscription;
  modificationEnergySub: Subscription;
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;
  modalSubscription: Subscription;

  tabSelect: string = 'results';
  baselineSelected = true;
  modificationExists = false;

  constructor(private settingsDbService: SettingsDbService, 
              private chargeMaterialService: ChargeMaterialService) { }

  ngOnInit(): void {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    let existingInputs = this.chargeMaterialService.baselineData.getValue();
    if(!existingInputs) {
      this.chargeMaterialService.initDefaultEmptyOutput();
      this.chargeMaterialService.initDefaultEmptyInputs();
    }
    this.initSubscriptions();
    if(this.modificationData) {
      this.modificationExists = true;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.modalSubscription.unsubscribe();
    this.baselineDataSub.unsubscribe();
    this.modificationDataSub.unsubscribe();
    this.baselineEnergySub.unsubscribe();
    this.modificationEnergySub.unsubscribe();
  }

  checkIsCollapsedMaterial(index: number) {
    let isCollapsed: boolean;
    let collapseState = this.chargeMaterialService.collapseMapping.getValue();
    if (collapseState && collapseState[index] != undefined) {
      isCollapsed = collapseState[index];
    }
    return isCollapsed;
  }

  initSubscriptions() {
    this.modalSubscription = this.chargeMaterialService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    })
    this.baselineDataSub = this.chargeMaterialService.baselineData.subscribe(value => {
      this.baselineData = value;
      this.chargeMaterialService.calculate(this.settings);
    })
    this.modificationDataSub = this.chargeMaterialService.modificationData.subscribe(value => {
      this.modificationData = value;
      this.chargeMaterialService.calculate(this.settings);
    })
    this.baselineEnergySub = this.chargeMaterialService.baselineEnergyData.subscribe(energyData => {
      this.chargeMaterialService.calculate(this.settings);
    });
    this.modificationEnergySub = this.chargeMaterialService.modificationEnergyData.subscribe(energyData => {
      this.chargeMaterialService.calculate(this.settings);
  });
  }

  addLoss() {
    let hoursPerYear = this.inTreasureHunt? this.operatingHours.hoursPerYear : undefined;
    this.chargeMaterialService.addLoss(hoursPerYear, this.modificationExists);
  }

  createModification() {
    this.chargeMaterialService.initModification();
    this.modificationExists = true;
    this.setModificationSelected();
   }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeMaterialType(index: number, materialType: string) {
    if (this.modificationData && this.modificationData.length > 0) {
      this.modificationData[index].chargeMaterialType = materialType;
      this.chargeMaterialService.modificationData.next(this.modificationData);
    }
    this.chargeMaterialService.initDefaultEmptyOutput();
  }

   btnResetData() {
    this.modificationExists = false;
    this.chargeMaterialService.initDefaultEmptyInputs();
    this.chargeMaterialService.collapseMapping.next({});
    this.chargeMaterialService.resetData.next(true);
  }

  btnGenerateExample() {
    this.modificationExists = true;
    this.chargeMaterialService.generateExampleData(this.settings);
  }

  setBaselineSelected() {
      this.baselineSelected = true;
  }

  setModificationSelected() {
      this.baselineSelected = false;
  }

  focusField(str: string) {
    this.chargeMaterialService.currentField.next(str);
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
    }
  }

}

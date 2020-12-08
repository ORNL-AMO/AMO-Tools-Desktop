import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { ChargeMaterial, ChargeMaterialOutput } from '../../../shared/models/phast/losses/chargeMaterial';
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
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  energyUnit: string;
  baselineEnergySub: Subscription;
  modificationEnergySub: Subscription;
  updatedCalculation: boolean;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  
  containerHeight: number;
  isModalOpen: boolean;
  
  results: {baseline: number, modification: number};
  baselineData: ChargeMaterial;
  modificationData: ChargeMaterial;
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;
  outputSubscription: Subscription;
  modalSubscription: Subscription;
  output: ChargeMaterialOutput;

  materialType: string = "Solid";
  tabSelect: string = 'results';
  baselineSelected = true;
  modificationExists = false;

  constructor(private settingsDbService: SettingsDbService, private chargeMaterialService: ChargeMaterialService) { }

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
    this.outputSubscription.unsubscribe();
    this.baselineEnergySub.unsubscribe();
    this.modificationEnergySub.unsubscribe();
  }

  initSubscriptions() {
    this.modalSubscription = this.chargeMaterialService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    })
    this.baselineDataSub = this.chargeMaterialService.baselineData.subscribe(value => {
      // this.chargeMaterialService.calculate(this.settings);
      this.calculate();
    })
    this.modificationDataSub = this.chargeMaterialService.modificationData.subscribe(value => {
      // this.chargeMaterialService.calculate(this.settings);
      this.calculate();
    })
    this.outputSubscription = this.chargeMaterialService.output.subscribe(val => {
      if (val) {
        this.output = val;
      }
    });
    this.baselineEnergySub = this.chargeMaterialService.baselineEnergyData.subscribe(energyData => {
      this.energyUnit = this.chargeMaterialService.getAnnualEnergyUnit(energyData.energySourceType, this.settings);
      // this.chargeMaterialService.calculate(this.settings);
      this.calculate();
    });
    this.modificationEnergySub = this.chargeMaterialService.modificationEnergyData.subscribe(energyData => {
      // this.chargeMaterialService.calculate(this.settings);
      this.calculate();
  });
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  calculate() {
    // setTimeout(() => {
      this.chargeMaterialService.calculate(this.settings);
    // }, 200);
  }

  changeMaterialType() {
    this.chargeMaterialService.initDefaultEmptyOutput();
  }

  createModification() {
    this.chargeMaterialService.initModification();
    this.modificationExists = true;
    this.setModificationSelected();
   }

   btnResetData() {
    this.modificationExists = false;
    this.materialType = 'Solid';
    this.chargeMaterialService.initDefaultEmptyInputs();
    this.chargeMaterialService.resetData.next(true);
  }

  btnGenerateExample() {
    this.materialType = 'Solid';
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

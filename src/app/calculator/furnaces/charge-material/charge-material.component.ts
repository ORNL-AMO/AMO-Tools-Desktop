import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
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
    this.baselineEnergySub.unsubscribe();
    this.modificationEnergySub.unsubscribe();
  }

  initSubscriptions() {
    this.modalSubscription = this.chargeMaterialService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    })
    this.baselineDataSub = this.chargeMaterialService.baselineData.subscribe(value => {
      this.baselineData = value;
      // this.getLossName();
      this.chargeMaterialService.calculate(this.settings);
    })
    this.modificationDataSub = this.chargeMaterialService.modificationData.subscribe(value => {
      this.modificationData = value;
      // this.getLossName();
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
    this.chargeMaterialService.addLoss(this.modificationExists);
  }

  createModification() {
    this.chargeMaterialService.initModification();
    this.modificationExists = true;
    this.setModificationSelected();
   }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeMaterialType() {
    this.chargeMaterialService.initDefaultEmptyOutput();
  }

  // getLossName() {
  //   let currentMaterialForm: FormGroup = this.chargeMaterialService.editLossName(0, true);
  //   if (currentMaterialForm) {
  //     this.lossNameForm = currentMaterialForm;
  //   }
  // }
  
  editLossName(index: number) {
    // let currentMaterialForm: FormGroup = this.chargeMaterialService.editLossName(index, true);
    // if (currentMaterialForm) {
    //   this.lossNameForm = currentMaterialForm;
    // }
    this.isEditingName = true;
  }

  doneEditingName(index: number) {
    this.isEditingName = false;
    // this.chargeMaterialService.saveLossName(this.lossNameForm, index, true);
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

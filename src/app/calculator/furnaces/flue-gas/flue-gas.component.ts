import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { FlueGas, FlueGasOutput } from '../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../shared/models/settings';
import { FlueGasTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { FlueGasEnergyData } from './energy-form.service';
import { FlueGasService } from './flue-gas.service';

@Component({
  selector: 'app-flue-gas',
  templateUrl: './flue-gas.component.html',
  styleUrls: ['./flue-gas.component.css']
})
export class FlueGasComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @Input()
  operatingHours: OperatingHours;

  @Output('emitSave')
  emitSave = new EventEmitter<FlueGasTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  baselineEnergySub: Subscription;
  modificationEnergySub: Subscription;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  containerHeight: number;
  isModalOpen: boolean;
  modalSubscription: Subscription;
  results: {baseline: number, modification: number};
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;
  outputSubscription: Subscription;
  output: FlueGasOutput;

  method: string = 'By Mass';
  currentField: string;
  tabSelect: string = 'results';
  baselineSelected = true;
  modificationExists = false;

  constructor(private settingsDbService: SettingsDbService, 
              private cd: ChangeDetectorRef,
              private flueGasService: FlueGasService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    let existingInputs = this.flueGasService.baselineData.getValue();
    if(!existingInputs) {
      let treasureHuntHours: number;
      if (this.inTreasureHunt) {
        treasureHuntHours = this.operatingHours.hoursPerYear;
        this.method = 'By Volume';
      }
      this.flueGasService.initDefaultEmptyOutput();
      this.flueGasService.initDefaultEmptyInputs(treasureHuntHours);
    } else {
      this.method = existingInputs.flueGasType;
    }
    this.initSubscriptions();
    if(this.flueGasService.modificationData.getValue()) {
      this.modificationExists = true;
    }
  }

  ngOnDestroy() {
    this.modalSubscription.unsubscribe();
    this.baselineDataSub.unsubscribe();
    this.modificationDataSub.unsubscribe();
    this.baselineEnergySub.unsubscribe();
    this.modificationEnergySub.unsubscribe();
    this.outputSubscription.unsubscribe();
    if (this.inTreasureHunt) {
      this.flueGasService.baselineData.next(undefined);
      this.flueGasService.modificationData.next(undefined);
      this.flueGasService.baselineEnergyData.next(undefined);
      this.flueGasService.modificationEnergyData.next(undefined);
    }
  }

  initSubscriptions() {
    this.modalSubscription = this.flueGasService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    });
    this.baselineDataSub = this.flueGasService.baselineData.subscribe(baselineData => {
      if (baselineData) {
        this.setBaselineSelected();
        this.flueGasService.calculate(this.settings, false, true);
      }
    });
    this.modificationDataSub = this.flueGasService.modificationData.subscribe(modificationData => {
      if (modificationData) {
        this.flueGasService.calculate(this.settings, false, true);
      }
    });
    this.outputSubscription = this.flueGasService.output.subscribe(val => {
      if (val) {
        this.output = val;
      }
    });
    this.baselineEnergySub = this.flueGasService.baselineEnergyData.subscribe(baselineEnergyData => {
      if (baselineEnergyData) {
        this.flueGasService.calculate(this.settings, false, true);
      }
    });
    this.modificationEnergySub = this.flueGasService.modificationEnergyData.subscribe(modificationEnergyData => {
      if (modificationEnergyData) {
        this.flueGasService.calculate(this.settings, false, true);
      }
  });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  changeFuelType() {
    this.flueGasService.initDefaultEmptyOutput();
    this.cd.detectChanges();
  }

  createModification() {
    this.flueGasService.initModification();
    this.modificationExists = true;
    this.setModificationSelected();
    this.flueGasService.calculate(this.settings, false, true);
   }

  btnResetData() {
    this.modificationExists = false;
    this.flueGasService.initDefaultEmptyInputs();
    this.flueGasService.resetData.next(true);
    this.baselineSelected = true;
    this.flueGasService.modificationData.next(undefined);
    this.method = 'By Mass';
  }

  btnGenerateExample() {
    this.method = 'By Volume';
    this.modificationExists = true;
    this.flueGasService.generateExampleData(this.settings);
    this.baselineSelected = true;
  }

  setBaselineSelected() {
    if (this.baselineSelected == false) {
      this.baselineSelected = true;
    }
  }

  save() {
    let baselineData: FlueGas = this.flueGasService.baselineData.getValue();
    let baselineEnergyData: FlueGasEnergyData = this.flueGasService.baselineEnergyData.getValue();
    let modificationData: FlueGas = this.flueGasService.modificationData.getValue();
    let modificationEnergyData: FlueGasEnergyData = this.flueGasService.modificationEnergyData.getValue();
    this.emitSave.emit({ 
      baseline: baselineData, 
      modification: modificationData, 
      baselineEnergyData: baselineEnergyData, 
      modificationEnergyData: modificationEnergyData,
      opportunityType: Treasure.flueGas
    });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  setModificationSelected() {
    if (this.baselineSelected == true) {
      this.baselineSelected = false;
    }
  }

  focusField(str: string) {
    this.flueGasService.currentField.next(str);
  }

  
  setTab(str: string) {
    this.tabSelect = str;
  }
  
  resizeTabs() {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
    }
  }
}

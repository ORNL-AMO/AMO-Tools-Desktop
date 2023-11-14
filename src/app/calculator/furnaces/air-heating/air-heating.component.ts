import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { AirHeatingTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { AirHeatingService } from './air-heating.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-air-heating',
  templateUrl: './air-heating.component.html',
  styleUrls: ['./air-heating.component.css']
})
export class AirHeatingComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output("emitSave")
  emitSave = new EventEmitter<AirHeatingTreasureHunt>();
  @Output("emitCancel")
  emitCancel = new EventEmitter<boolean>();
  @Input()
  operatingHours: OperatingHours;
  @Input()
  inTreasureHunt: boolean; 
  
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
  smallScreenTab: string = 'form';

  airFlowConversionInputSub: Subscription;
  modalSubscription: Subscription;
  
  headerHeight: number;
  isModalOpen: boolean;
  tabSelect: string = 'help';
  
  constructor(private airHeatingService: AirHeatingService,
              private settingsDbService: SettingsDbService,
              private analyticsService: AnalyticsService) { }

  ngOnInit(): void {
    this.analyticsService.sendEvent('calculator-PH-air-heating');
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    let existingInputs = this.airHeatingService.airHeatingInput.getValue();
    if(!existingInputs) {
      if (this.inTreasureHunt) {
        this.airHeatingService.initDefaultEmptyInputs(this.settings.fuelCost);
      } else {
        this.airHeatingService.initDefaultEmptyInputs();
      }
      this.airHeatingService.initDefaultEmptyOutputs();
    }
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.airFlowConversionInputSub.unsubscribe();
    this.modalSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  initSubscriptions() {
    this.airFlowConversionInputSub = this.airHeatingService.airHeatingInput.subscribe(input => {
      if (input) {
        this.calculate();
      }
    });
    this.modalSubscription = this.airHeatingService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    });
  }

  calculate() {
    this.airHeatingService.calculate(this.settings);
  }

  btnResetData() {
    this.airHeatingService.initDefaultEmptyInputs();
    this.airHeatingService.resetData.next(true);
  }

  btnGenerateExample() {
    this.airHeatingService.generateExampleData(this.settings);
    this.airHeatingService.generateExample.next(true);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  save() {
    let inputData = this.airHeatingService.airHeatingInput.getValue(); 
    let treasureHuntEnergyType = inputData.gasFuelType? inputData.utilityType : 'Other Fuel';
    this.emitSave.emit({
      inputData: inputData,
      energySourceData: {
        energySourceType: treasureHuntEnergyType,  
        unit: 'MMBtu'
      },
      opportunityType: Treasure.airHeating
    });
  }

  cancel() {
    this.airHeatingService.initDefaultEmptyInputs();
    this.emitCancel.emit(true);
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

}

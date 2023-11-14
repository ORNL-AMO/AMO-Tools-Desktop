import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { Treasure, WaterHeatingTreasureHunt } from '../../../shared/models/treasure-hunt';
import { WaterHeatingService } from './water-heating.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-water-heating',
  templateUrl: './water-heating.component.html',
  styleUrls: ['./water-heating.component.css']
})
export class WaterHeatingComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @Input()
  operatingHours: OperatingHours;
  @Output("emitSave")
  emitSave = new EventEmitter<WaterHeatingTreasureHunt>();
  @Output("emitCancel")
  emitCancel = new EventEmitter<boolean>();

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef; 
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  waterHeatingInputSub: Subscription;
  containerHeight: number;
  tabSelect: string = 'results';
  smallScreenTab: string = 'form';
  
  constructor(private waterHeatingService: WaterHeatingService,
              private settingsDbService: SettingsDbService,
              private analyticsService: AnalyticsService) { }

  ngOnInit(): void {
    this.analyticsService.sendEvent('calculator-steam-water-heating');
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    let existingInputs = this.waterHeatingService.waterHeatingInput.getValue();
    if(!existingInputs) {
      if (this.inTreasureHunt) {
        this.waterHeatingService.initDefaultEmptyInputs(this.settings.fuelCost);
      } else {
        this.waterHeatingService.initDefaultEmptyInputs();
      }
      this.waterHeatingService.initDefaultEmptyOutputs();
    }
    
    this.waterHeatingInputSub = this.waterHeatingService.waterHeatingInput.subscribe(input => {
      if (input) {
        this.calculate();
      }
    });
  }

  ngOnDestroy() {
    this.waterHeatingInputSub.unsubscribe();
    if (this.inTreasureHunt) {
      this.waterHeatingService.waterHeatingInput.next(undefined);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  calculate() {
    this.waterHeatingService.calculate(this.settings);
  }

  save() {
    let inputData = this.waterHeatingService.waterHeatingInput.getValue(); 
    this.emitSave.emit({
      inputData: inputData,
      energySourceData: {
        energySourceType: inputData.boilerUtilityType,  
        unit: 'MMBtu'
      },
      opportunityType: Treasure.waterHeating
    });
  }

  cancel() {
    this.waterHeatingService.initDefaultEmptyInputs();
    this.emitCancel.emit(true);
  }

  btnResetData() {
    this.waterHeatingService.initDefaultEmptyInputs();
    this.waterHeatingService.resetData.next(true);
  }

  btnGenerateExample() {
    this.waterHeatingService.generateExampleData(this.settings);
    this.waterHeatingService.generateExample.next(true);
  }

  setTab(str: string) {
    this.tabSelect = str;
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
  }

}

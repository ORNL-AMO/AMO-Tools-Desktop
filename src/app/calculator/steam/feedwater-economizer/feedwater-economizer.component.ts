import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { FeedwaterEconomizerTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { FeedwaterEconomizerService } from './feedwater-economizer.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
    selector: 'app-feedwater-economizer',
    templateUrl: './feedwater-economizer.component.html',
    styleUrls: ['./feedwater-economizer.component.css'],
    standalone: false
})
export class FeedwaterEconomizerComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @Input()
  operatingHours: OperatingHours;
  @Output("emitSave")
  emitSave = new EventEmitter<FeedwaterEconomizerTreasureHunt>();
  @Output("emitCancel")
  emitCancel = new EventEmitter<boolean>();

  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef; 
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  feedWaterInputSub: Subscription;
  modalopenSub: Subscription;
  isModalOpen: boolean;
  containerHeight: number;
  tabSelect: string = 'results';
  smallScreenTab: string = 'form';
  
  constructor(private feedwaterEconomizerService: FeedwaterEconomizerService,
              private settingsDbService: SettingsDbService,
              private analyticsService: AnalyticsService) { }

  ngOnInit(): void {
    this.analyticsService.sendEvent('calculator-STEAM-feedwater-economizer');
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    let existingInputs = this.feedwaterEconomizerService.feedwaterEconomizerInput.getValue();
    if(!existingInputs) {
      if (this.inTreasureHunt) {
        this.feedwaterEconomizerService.initDefaultEmptyInputs(this.settings);
      } else {
        this.feedwaterEconomizerService.initDefaultEmptyInputs(this.settings);
      }
      this.feedwaterEconomizerService.initDefaultEmptyOutputs();
    }
    
    this.feedWaterInputSub = this.feedwaterEconomizerService.feedwaterEconomizerInput.subscribe(input => {
      if (input) {
        this.calculate();
      }
    });

    this.modalopenSub = this.feedwaterEconomizerService.modalOpen.subscribe(isModalOpen => {
      this.isModalOpen = isModalOpen;
    });
  }

  ngOnDestroy() {
    this.feedWaterInputSub.unsubscribe();
    this.modalopenSub.unsubscribe();
    if (this.inTreasureHunt) {
      this.feedwaterEconomizerService.feedwaterEconomizerInput.next(undefined);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  calculate() {
    this.feedwaterEconomizerService.calculate(this.settings);
  }

  save() {
    let inputData = this.feedwaterEconomizerService.feedwaterEconomizerInput.getValue(); 
    this.emitSave.emit({
      inputData: inputData,
      energySourceData: {
        energySourceType: 'Fuel',  
        unit: 'MMBtu'
      },
      opportunityType: Treasure.feedwaterEconomizer
    });
  }

  cancel() {
    this.feedwaterEconomizerService.initDefaultEmptyInputs(this.settings);
    this.emitCancel.emit(true);
  }

  btnResetData() {
    this.feedwaterEconomizerService.initDefaultEmptyInputs(this.settings);
    this.feedwaterEconomizerService.resetData.next(true);
  }

  btnGenerateExample() {
    this.feedwaterEconomizerService.generateExampleData(this.settings);
    this.feedwaterEconomizerService.generateExample.next(true);
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

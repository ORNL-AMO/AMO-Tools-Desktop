import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CoolingTowerFanInput } from '../../../shared/models/chillers';
import { Settings } from '../../../shared/models/settings';
import { CoolingTowerFanTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { CoolingTowerFanService } from './cooling-tower-fan.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-cooling-tower-fan',
  templateUrl: './cooling-tower-fan.component.html',
  styleUrls: ['./cooling-tower-fan.component.css']
})
export class CoolingTowerFanComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<CoolingTowerFanTreasureHunt>();
  @Output('emitCancel')
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
  
  coolingTowerFanInputSub: Subscription;
  coolingTowerFanInput: CoolingTowerFanInput;
  containerHeight: number;
  smallScreenTab: string = 'form';
  headerHeight: number;
  tabSelect: string = 'results';
  
  constructor(private coolingTowerFanService: CoolingTowerFanService,
              private settingsDbService: SettingsDbService,
              private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-PC-cooling-tower-fan');
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.coolingTowerFanInput = this.coolingTowerFanService.coolingTowerFanInput.getValue();
    if(!this.coolingTowerFanInput) {
      this.coolingTowerFanService.initDefaultEmptyInputs(this.settings);
      this.coolingTowerFanService.initDefaultEmptyOutputs();
    }
    this.initSubscriptions();
  }

  ngOnDestroy() {
    if(!this.inTreasureHunt){
      this.coolingTowerFanService.coolingTowerFanInput.next(this.coolingTowerFanInput);
    } else {
      this.coolingTowerFanService.coolingTowerFanInput.next(undefined);
    }
    this.coolingTowerFanInputSub.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  initSubscriptions() {
    this.coolingTowerFanInputSub = this.coolingTowerFanService.coolingTowerFanInput.subscribe(value => {
      this.coolingTowerFanInput = value;
      if(value){
        this.calculate();
      }
    });
  }

  calculate() {
    this.coolingTowerFanService.calculate(this.settings);
  }

  btnResetData() {
    this.coolingTowerFanService.initDefaultEmptyInputs(this.settings);
    this.coolingTowerFanService.resetData.next(true);
  }

  btnGenerateExample() {
    this.coolingTowerFanService.generateExampleData(this.settings);
    this.coolingTowerFanService.generateExample.next(true);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

  save() {
    this.emitSave.emit({ coolingTowerFanData: this.coolingTowerFanInput, opportunityType: Treasure.coolingTowerFan });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

}

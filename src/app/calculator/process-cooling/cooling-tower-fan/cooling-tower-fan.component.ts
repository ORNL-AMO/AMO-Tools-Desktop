import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { CoolingTowerFanService } from './cooling-tower-fan.service';

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
  //emitSave = new EventEmitter<CoolingTowerFanTreasureHunt>();
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
  containerHeight: number;
  smallScreenTab: string = 'form';
  headerHeight: number;
  tabSelect: string = 'results';
  
  constructor(private coolingTowerFanService: CoolingTowerFanService,
              private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    let existingInputs = this.coolingTowerFanService.coolingTowerFanInput.getValue();
    if(!existingInputs) {
      this.coolingTowerFanService.initDefaultEmptyInputs(this.settings);
      this.coolingTowerFanService.initDefaultEmptyOutputs();
    }
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.coolingTowerFanInputSub.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  initSubscriptions() {
    this.coolingTowerFanInputSub = this.coolingTowerFanService.coolingTowerFanInput.subscribe(value => {
      this.calculate();
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
    //this.emitSave.emit({ chillerPerformanceData: this.chillerPerformanceInput, opportunityType: Treasure.chillerPerformance });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

}

import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
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
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  
  coolingTowerFanInputSub: Subscription;
  
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
      this.coolingTowerFanService.initDefaultEmptyInputs();
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
    this.coolingTowerFanService.initDefaultEmptyInputs();
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
    }
  }

}
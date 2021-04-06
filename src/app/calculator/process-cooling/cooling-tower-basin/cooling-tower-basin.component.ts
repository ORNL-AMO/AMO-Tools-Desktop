import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { CoolingTowerBasinService } from './cooling-tower-basin.service';

@Component({
  selector: 'app-cooling-tower-basin',
  templateUrl: './cooling-tower-basin.component.html',
  styleUrls: ['./cooling-tower-basin.component.css']
})
export class CoolingTowerBasinComponent implements OnInit {
  @Input()
  settings: Settings;
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  
  coolingTowerBasinInputSub: Subscription;
  
  headerHeight: number;
  tabSelect: string = 'results';
  
  constructor(private coolingTowerBasinService: CoolingTowerBasinService,
              private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    let existingInputs = this.coolingTowerBasinService.coolingTowerBasinInput.getValue();
    if(!existingInputs) {
      this.coolingTowerBasinService.initDefaultEmptyInputs();
      this.coolingTowerBasinService.initDefaultEmptyOutputs();
    }
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.coolingTowerBasinInputSub.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  initSubscriptions() {
    this.coolingTowerBasinInputSub = this.coolingTowerBasinService.coolingTowerBasinInput.subscribe(value => {
      this.calculate();
    });
  }

  calculate() {
    this.coolingTowerBasinService.calculate(this.settings);
  }

  btnResetData() {
    this.coolingTowerBasinService.initDefaultEmptyInputs();
    this.coolingTowerBasinService.resetData.next(true);
  }

  btnGenerateExample() {
    this.coolingTowerBasinService.generateExampleData(this.settings);
    this.coolingTowerBasinService.generateExample.next(true);
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

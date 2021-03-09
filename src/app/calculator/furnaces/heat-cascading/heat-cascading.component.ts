import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { HeatCascadingService } from './heat-cascading.service';

@Component({
  selector: 'app-heat-cascading',
  templateUrl: './heat-cascading.component.html',
  styleUrls: ['./heat-cascading.component.css']
})
export class HeatCascadingComponent implements OnInit {
  @Input()
  settings: Settings;
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  
  airFlowConversionInputSub: Subscription;
  modalSubscription: Subscription;
  
  headerHeight: number;
  isModalOpen: boolean;
  tabSelect: string = 'help';
  
  constructor(private heatCascadingService: HeatCascadingService,
              private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    let existingInputs = this.heatCascadingService.heatCascadingInput.getValue();
    if(!existingInputs) {
      this.heatCascadingService.initDefaultEmptyInputs();
      this.heatCascadingService.initDefaultEmptyOutputs();
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
    this.airFlowConversionInputSub = this.heatCascadingService.heatCascadingInput.subscribe(value => {
      this.calculate();
    });
    this.modalSubscription = this.heatCascadingService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    });
  }

  calculate() {
    this.heatCascadingService.calculate(this.settings);
  }

  btnResetData() {
    this.heatCascadingService.initDefaultEmptyInputs();
    this.heatCascadingService.resetData.next(true);
  }

  btnGenerateExample() {
    this.heatCascadingService.generateExampleData(this.settings);
    this.heatCascadingService.generateExample.next(true);
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

import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { AirHeatingService } from './air-heating.service';

@Component({
  selector: 'app-air-heating',
  templateUrl: './air-heating.component.html',
  styleUrls: ['./air-heating.component.css']
})
export class AirHeatingComponent implements OnInit {
  @Input()
  settings: Settings;
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  containerHeight: number;
  
  airFlowConversionInputSub: Subscription;
  modalSubscription: Subscription;
  
  headerHeight: number;
  isModalOpen: boolean;
  tabSelect: string = 'help';
  
  constructor(private airHeatingService: AirHeatingService,
              private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    let existingInputs = this.airHeatingService.airHeatingInput.getValue();
    if(!existingInputs) {
      this.airHeatingService.initDefaultEmptyInputs();
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
    this.airFlowConversionInputSub = this.airHeatingService.airHeatingInput.subscribe(value => {
      this.calculate();
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

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
    }
  }

}

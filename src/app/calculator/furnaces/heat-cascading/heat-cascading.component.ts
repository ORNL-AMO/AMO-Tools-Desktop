import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { HeatCascadingTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { HeatCascadingService } from './heat-cascading.service';

@Component({
  selector: 'app-heat-cascading',
  templateUrl: './heat-cascading.component.html',
  styleUrls: ['./heat-cascading.component.css']
})
export class HeatCascadingComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @Input()
  operatingHours: OperatingHours;
  @Output("emitSave")
  emitSave = new EventEmitter<HeatCascadingTreasureHunt>();
  @Output("emitCancel")
  emitCancel = new EventEmitter<boolean>();
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  
  heatCascadingInputSub: Subscription;
  modalSubscription: Subscription;
  
  containerHeight: number;
  isModalOpen: boolean;
  tabSelect: string = 'help';
  
  constructor(private heatCascadingService: HeatCascadingService,
              private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    let existingInputs = this.heatCascadingService.heatCascadingInput.getValue();
    if(!existingInputs) {
      this.heatCascadingService.initDefaultEmptyInputs(this.settings);
      this.heatCascadingService.initDefaultEmptyOutputs();
    }
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.heatCascadingInputSub.unsubscribe();
    this.modalSubscription.unsubscribe();
    if (this.inTreasureHunt) {
      this.heatCascadingService.heatCascadingInput.next(undefined);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  initSubscriptions() {
    this.heatCascadingInputSub = this.heatCascadingService.heatCascadingInput.subscribe(heatCascadingInput => {
      if (heatCascadingInput) {
        this.calculate();
      }
    });
    this.modalSubscription = this.heatCascadingService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    });
  }

  calculate() {
    this.heatCascadingService.calculate(this.settings);
  }

  btnResetData() {
    this.heatCascadingService.initDefaultEmptyInputs(this.settings);
    this.heatCascadingService.resetData.next(true);
  }

  btnGenerateExample() {
    this.heatCascadingService.generateExampleData(this.settings);
    this.heatCascadingService.generateExample.next(true);
  }

  save() {
    let inputData = this.heatCascadingService.heatCascadingInput.getValue(); 
    this.emitSave.emit({
      inputData: inputData,
      energySourceData: {
        energySourceType: inputData.utilityType,  
        unit: 'MMBtu'
      },
      opportunityType: Treasure.heatCascading
    });
  }

  cancel() {
    this.heatCascadingService.initDefaultEmptyInputs(this.settings);
    this.emitCancel.emit(true);
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

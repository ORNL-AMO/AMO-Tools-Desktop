import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { WasteHeatInput } from '../../../shared/models/phast/wasteHeat';
import { Settings } from '../../../shared/models/settings';
import { Treasure, WasteHeatTreasureHunt } from '../../../shared/models/treasure-hunt';
import { WasteHeatService } from './waste-heat.service';

@Component({
  selector: 'app-waste-heat',
  templateUrl: './waste-heat.component.html',
  styleUrls: ['./waste-heat.component.css']
})
export class WasteHeatComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @Input()
  operatingHours: OperatingHours;
  @Output('emitSave')
  emitSave = new EventEmitter<WasteHeatTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild("contentContainer", { static: false }) contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  
  wasteHeatInputsub: Subscription;
  modalSubscription: Subscription;
  
  containerHeight: number;
  isModalOpen: boolean;
  tabSelect: string = 'help';
  
  constructor(private wasteHeatService: WasteHeatService,
              private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    let existingInputs = this.wasteHeatService.wasteHeatInput.getValue();
    if(!existingInputs) {
      this.wasteHeatService.initDefaultEmptyInputs();
      this.wasteHeatService.initDefaultEmptyOutputs();
    }
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.wasteHeatInputsub.unsubscribe();
    this.modalSubscription.unsubscribe();
    if (this.inTreasureHunt) {
      this.wasteHeatService.wasteHeatInput.next(undefined);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  initSubscriptions() {
    this.wasteHeatInputsub = this.wasteHeatService.wasteHeatInput.subscribe(input => {
      if (input) {
        this.calculate();
      }
    });
    this.modalSubscription = this.wasteHeatService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    });
  }

  calculate() {
    this.wasteHeatService.calculate(this.settings);
  }

  btnResetData() {
    this.wasteHeatService.initDefaultEmptyInputs();
    this.wasteHeatService.resetData.next(true);
  }

  save() {
    let inputData: WasteHeatInput = this.wasteHeatService.wasteHeatInput.getValue();
    this.emitSave.emit({ 
      inputData: inputData, 
      opportunityType: Treasure.wasteHeat
    });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  btnGenerateExample() {
    this.wasteHeatService.generateExampleData(this.settings);
    this.wasteHeatService.generateExample.next(true);
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

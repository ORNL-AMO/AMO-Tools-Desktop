import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { Treasure, WaterHeatingTreasureHunt } from '../../../shared/models/treasure-hunt';
import { WaterHeatingService } from './water-heating.service';

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
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  
  waterHeatingInputSub: Subscription;
  headerHeight: number;
  tabSelect: string = 'results';
  
  constructor(private waterHeatingService: WaterHeatingService,
              private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    let existingInputs = this.waterHeatingService.waterHeatingInput.getValue();
    if(!existingInputs) {
      this.waterHeatingService.initDefaultEmptyInputs();
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
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

}

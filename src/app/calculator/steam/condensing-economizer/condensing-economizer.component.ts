import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { CondensingEconTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { CondensingEconomizerService } from './condensing-economizer.service';

@Component({
  selector: 'app-condensing-economizer',
  templateUrl: './condensing-economizer.component.html',
  styleUrls: ['./condensing-economizer.component.css']
})
export class CondensingEconomizerComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @Input()
  operatingHours: OperatingHours;
  @Output("emitSave")
  emitSave = new EventEmitter<CondensingEconTreasureHunt>();
  @Output("emitCancel")
  emitCancel = new EventEmitter<boolean>();

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef; 
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  condensingEconomizerInputSub: Subscription;
  containerHeight: number;
  tabSelect: string = 'results';

  constructor(private condensingEconomizerService: CondensingEconomizerService,
              private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    let existingInputs = this.condensingEconomizerService.condensingEconomizerInput.getValue();
    if(!existingInputs) {
      if (this.inTreasureHunt) {
        this.condensingEconomizerService.initDefaultEmptyInputs(this.settings);
      } else {
        this.condensingEconomizerService.initDefaultEmptyInputs(this.settings);
      }
      this.condensingEconomizerService.initDefaultEmptyOutputs();
    }

    this.condensingEconomizerInputSub = this.condensingEconomizerService.condensingEconomizerInput.subscribe(input => {
      if (input) {
        this.calculate();
      }
    });
  }

  ngOnDestroy() {
    this.condensingEconomizerInputSub.unsubscribe();
    if (this.inTreasureHunt) {
      this.condensingEconomizerService.condensingEconomizerInput.next(undefined);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  calculate() {
    this.condensingEconomizerService.calculate(this.settings);
  }

  save() {
    let inputData = this.condensingEconomizerService.condensingEconomizerInput.getValue(); 
    this.emitSave.emit({
      inputData: inputData,
      energySourceData: {
        energySourceType: 'Fuel',  
        unit: 'MMBtu'
      },
      opportunityType: Treasure.condensingEconomizer
    });
  }

  cancel() {
    this.condensingEconomizerService.initDefaultEmptyInputs(this.settings);
    this.emitCancel.emit(true);
  }

  btnResetData() {
    this.condensingEconomizerService.initDefaultEmptyInputs(this.settings);
    this.condensingEconomizerService.resetData.next(true);
  }

  btnGenerateExample() {
    this.condensingEconomizerService.generateExampleData(this.settings);
    this.condensingEconomizerService.generateExample.next(true);
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
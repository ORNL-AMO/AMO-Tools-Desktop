import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { OpeningLoss, OpeningLossOutput } from '../../../shared/models/phast/losses/openingLoss';
import { Settings } from '../../../shared/models/settings';
import { OpeningLossTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { FlueGasService } from '../flue-gas/flue-gas.service';
import { OpeningService } from './opening.service';

@Component({
  selector: 'app-opening',
  templateUrl: './opening.component.html',
  styleUrls: ['./opening.component.css']
})
export class OpeningComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @Input()
  operatingHours: OperatingHours;
  @Output("emitSave")
  emitSave = new EventEmitter<OpeningLossTreasureHunt>();
  @Output("emitCancel")
  emitCancel = new EventEmitter<boolean>();
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  containerHeight: number;
  isModalOpen: boolean;
  modalSubscription: Subscription;

  baselineData: Array<OpeningLoss>;
  modificationData: Array<OpeningLoss>;
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;

  tabSelect: string = 'results';
  baselineSelected: boolean = true;
  modificationExists: boolean = false;

  constructor(private settingsDbService: SettingsDbService, private flueGasService: FlueGasService,
              private openingService: OpeningService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    let existingInputs = this.openingService.baselineData.getValue();
    if (!existingInputs) {
      this.resetOpeningInputs();
    }
    this.initSubscriptions();
    if(this.modificationData) {
      this.modificationExists = true;
    }
  }

  ngOnDestroy() {
    this.modalSubscription.unsubscribe();
    this.baselineDataSub.unsubscribe();
    this.modificationDataSub.unsubscribe();
    if (this.inTreasureHunt) {
      this.openingService.modificationData.next(undefined);
      this.openingService.baselineData.next(undefined);
      this.openingService.energySourceType.next(undefined);
      this.flueGasService.baselineData.next(undefined);
      this.flueGasService.modificationData.next(undefined);
    }
  }

  initSubscriptions() {
    this.modalSubscription = this.openingService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    })
    this.baselineDataSub = this.openingService.baselineData.subscribe(baselineData => {
      if (baselineData) {
        this.baselineData = baselineData;
        this.openingService.calculate(this.settings);
      }
    })
    this.modificationDataSub = this.openingService.modificationData.subscribe(modificationData => {
      if (modificationData) {
        this.modificationData = modificationData;
        this.openingService.calculate(this.settings);
      }
    })
  }
  
  setTab(str: string) {
    this.tabSelect = str;
  }

  addLoss() {
    let hoursPerYear: number;
    if (this.inTreasureHunt) {
      hoursPerYear = this.operatingHours.hoursPerYear;
    }
    this.openingService.addLoss(hoursPerYear, this.modificationExists);
  }

  createModification() {
    this.openingService.initModification();
    this.modificationExists = true;
    this.setModificationSelected();
   }

   btnResetData() {
    this.modificationExists = false;
    this.resetOpeningInputs();
    this.openingService.resetData.next(true);
  }

  resetOpeningInputs() {
    if (this.inTreasureHunt) {
      this.openingService.initTreasureHuntEmptyInputs(this.operatingHours.hoursPerYear, this.settings);
    } else {
      this.openingService.initDefaultEmptyInputs();
    }
  }

  btnGenerateExample() {
    this.modificationExists = true;
    this.openingService.generateExampleData(this.settings, this.inTreasureHunt);
  }

  setBaselineSelected() {
    this.baselineSelected = true;
  }

  setModificationSelected() {
    this.baselineSelected = false;
  }

  focusField(str: string) {
    this.openingService.currentField.next(str);
  }

  save() {
    let output: OpeningLossOutput = this.openingService.output.getValue();
    this.emitSave.emit({
      baseline: this.baselineData,
      modification: this.modificationData,
      energySourceData: {
        energySourceType: this.baselineData[0].energySourceType,
        unit: output.energyUnit,
      },
      opportunityType: Treasure.openingLoss
    });
  }

  cancel() {
    this.openingService.initDefaultEmptyInputs();
    this.emitCancel.emit(true);
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
    }
  }
}

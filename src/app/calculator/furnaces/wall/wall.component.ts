import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { OperatingHours } from '../../../shared/models/operations';
import { WallLoss, WallLossOutput } from '../../../shared/models/phast/losses/wallLoss';
import { Settings } from '../../../shared/models/settings';
import { Treasure, WallLossTreasureHunt } from '../../../shared/models/treasure-hunt';
import { FlueGasService } from '../flue-gas/flue-gas.service';
import { WallService } from './wall.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
    selector: "app-wall",
    templateUrl: "./wall.component.html",
    styleUrls: ["./wall.component.css"],
    standalone: false
})
export class WallComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @Output("emitSave")
  emitSave = new EventEmitter<WallLossTreasureHunt>();
  @Output("emitCancel")
  emitCancel = new EventEmitter<boolean>();
  @Input()
  operatingHours: OperatingHours;

  @ViewChild("leftPanelHeader", { static: false }) leftPanelHeader: ElementRef;
  @ViewChild("contentContainer", { static: false })
  contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  containerHeight: number;
  columnHeight: number;
  isModalOpen: boolean;
  isEditingName: boolean;

  baselineData: Array<WallLoss>;
  modificationData: Array<WallLoss>;
  modalSubscription: Subscription;
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;

  tabSelect: string = "results";
  baselineSelected = true;
  modificationExists = false;
  smallScreenTab: string = 'baseline';

  constructor(
    private settingsDbService: SettingsDbService,
    private wallService: WallService,
    private flueGasService: FlueGasService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-PH-wall');
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    let existingInputs = this.wallService.baselineData.getValue();
    if (!existingInputs) {
     this.resetWallLossInputs();
    }
    this.initSubscriptions();
    if (this.modificationData) {
      this.modificationExists = true;
    }
  }

  ngOnDestroy() {
    this.modalSubscription.unsubscribe();
    this.baselineDataSub.unsubscribe();
    this.modificationDataSub.unsubscribe();
    if (this.inTreasureHunt) {
      this.wallService.modificationData.next(undefined);
      this.wallService.baselineData.next(undefined);
      this.wallService.energySourceType.next(undefined);
      this.flueGasService.baselineData.next(undefined);
      this.flueGasService.modificationData.next(undefined);
    }
  }

  initSubscriptions() {
    this.modalSubscription = this.wallService.modalOpen.subscribe(
      (modalOpen) => {
        this.isModalOpen = modalOpen;
      }
    );
    this.baselineDataSub = this.wallService.baselineData.subscribe((baselineData) => {
      if (baselineData) {
        this.baselineData = baselineData;
        this.wallService.calculate(this.settings);
      }
    });
    this.modificationDataSub = this.wallService.modificationData.subscribe((modificationData) => {
      if (modificationData) {
        this.modificationData = modificationData;
        this.wallService.calculate(this.settings);
      }
    }
    );
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  addLoss() {
    let hoursPerYear: number;
    if (this.inTreasureHunt) {
      hoursPerYear = this.operatingHours.hoursPerYear;
    }
    this.wallService.addLoss(hoursPerYear, this.modificationExists);
  }

  createModification() {
    this.wallService.initModification();
    this.modificationExists = true;
    this.setModificationSelected();
  }

  btnResetData() {
    this.wallService.resetData.next(true);
    this.resetWallLossInputs();
    this.modificationExists = false;
  }

  resetWallLossInputs() {
    if (this.inTreasureHunt) {
      this.wallService.initTreasureHuntEmptyInputs(this.operatingHours.hoursPerYear, this.settings);
    } else {
      this.wallService.initDefaultEmptyInputs();
    }
  }

  btnGenerateExample() {
    this.modificationExists = true;
    this.wallService.generateExampleData(this.settings, this.inTreasureHunt);
  }

  setBaselineSelected() {
    this.baselineSelected = true;
  }

  setModificationSelected() {
    this.baselineSelected = false;
  }

  focusField(str: string) {
    this.wallService.currentField.next(str);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  save() {
    let output: WallLossOutput = this.wallService.output.getValue();
    this.emitSave.emit({
      baseline: this.baselineData,
      modification: this.modificationData,
      energySourceData: {
        energySourceType: this.baselineData[0].energySourceType,
        unit: output.energyUnit,
      },
      opportunityType: Treasure.wallLoss
    });
  }

  cancel() {
    this.wallService.initDefaultEmptyInputs();
    this.emitCancel.emit(true);
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  
  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
    if (this.smallScreenTab === 'baseline') {
      this.baselineSelected = true;
    } else if (this.smallScreenTab === 'modification') {
      this.baselineSelected = false;
    }
  }
}

import { ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef, HostListener, Input } from '@angular/core';
import { ValveEnergyLossService } from './valve-energy-loss.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Subscription } from 'rxjs';
import { ValveEnergyLossInputs, ValveEnergyLossResults } from '../../../shared/models/calculators';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';

@Component({
  selector: 'app-valve-energy-loss',
  templateUrl: './valve-energy-loss.component.html',
  styleUrl: './valve-energy-loss.component.css',
  standalone: false
})
export class ValveEnergyLossComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @Input()
  operatingHours: OperatingHours;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  containerHeight: number;
  isModalOpen: boolean;
  modalSubscription: Subscription;
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;
  resultsSubscription: Subscription;
  results: ValveEnergyLossResults;

  currentField: string;
  tabSelect: string = 'results';
  baselineSelected = true;
  modificationExists = false;
  smallScreenTab: string = 'baseline';

  constructor(private valveEnergyLossService: ValveEnergyLossService,
    private settingsDbService: SettingsDbService,
    private cd: ChangeDetectorRef,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-PUMP-valve-energy-loss');
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    let existingInputs = this.valveEnergyLossService.baselineData.getValue();
    if (!existingInputs) {
      let treasureHuntHours: number;
      if (this.inTreasureHunt) {
        treasureHuntHours = this.operatingHours.hoursPerYear;
      }
      this.valveEnergyLossService.initEmptyInputs(treasureHuntHours);
      this.valveEnergyLossService.initDefaultEmptyOutput();
    }
    this.initSubscriptions();
    if (this.valveEnergyLossService.modificationData.getValue()) {
      this.modificationExists = true;
    }
  }

  ngOnDestroy() {
    this.modalSubscription.unsubscribe();
    this.baselineDataSub.unsubscribe();
    this.modificationDataSub.unsubscribe();
    this.resultsSubscription.unsubscribe();
  }

  initSubscriptions() {
    this.modalSubscription = this.valveEnergyLossService.modalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    });

    this.baselineDataSub = this.valveEnergyLossService.baselineData.subscribe(baselineData => {
      if (baselineData) {
        this.setBaselineSelected();
        this.calculate();
      }
    });
    this.modificationDataSub = this.valveEnergyLossService.modificationData.subscribe(modificationData => {
      if (modificationData) {
        this.calculate();
      }
    });
    this.resultsSubscription = this.valveEnergyLossService.results.subscribe(val => {
      if (val) {
        this.results = val;
      }
    });
  }


  calculate(){
    let baselineData: ValveEnergyLossInputs = this.valveEnergyLossService.baselineData.getValue();
    let modificationData: ValveEnergyLossInputs = this.valveEnergyLossService.modificationData.getValue();
    if (this.modificationExists && modificationData) {      
      this.valveEnergyLossService.calculateEnergyLoss(baselineData, modificationData);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  createModification() {
    this.valveEnergyLossService.initModification();
    this.modificationExists = true;
    this.setModificationSelected();
    // this.flueGasService.calculate(this.settings, false, true);
  }

  btnResetData() {
    this.valveEnergyLossService.initEmptyInputs();
    this.valveEnergyLossService.initDefaultEmptyOutput();
    this.modificationExists = false;
    this.valveEnergyLossService.resetData.next(true);
    this.baselineSelected = true;
    this.valveEnergyLossService.modificationData.next(undefined);
  }

  btnGenerateExample() {
    this.valveEnergyLossService.generateExampleData(this.settings);
    this.valveEnergyLossService.generateExampleResults();
    this.modificationExists = true;
    this.baselineSelected = true;
  }


  save() {
    //TODO save for when in TH
    // let baselineData: ValveEnergyLossInputs = this.valveEnergyLossService.baselineData.getValue();
    // let modificationData: ValveEnergyLossInputs = this.valveEnergyLossService.modificationData.getValue();

  }

  setBaselineSelected() {
    if (this.baselineSelected == false) {
      this.baselineSelected = true;
    }
  }

  setModificationSelected() {
    if (this.baselineSelected == true) {
      this.baselineSelected = false;
    }
  }

  focusField(str: string) {
    this.valveEnergyLossService.currentField.next(str);
  }

  setTab(str: string) {
    this.tabSelect = str;
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

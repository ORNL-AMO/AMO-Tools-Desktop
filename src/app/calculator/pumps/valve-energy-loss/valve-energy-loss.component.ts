import { ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef, HostListener, Input } from '@angular/core';
import { ValveEnergyLossService } from './valve-energy-loss.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Subscription } from 'rxjs';
import { ValveEnergyLossResults } from '../../../shared/models/calculators';
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
  baselineEnergySub: Subscription;
  modificationEnergySub: Subscription;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  containerHeight: number;
  isModalOpen: boolean;
  modalSubscription: Subscription;
  results: { baseline: number, modification: number };
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;
  outputSubscription: Subscription;
  output: ValveEnergyLossResults;

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

    // let existingInputs = this.flueGasService.baselineData.getValue();
    // if (!existingInputs) {
    //   let treasureHuntHours: number;
    //   if (this.inTreasureHunt) {
    //     treasureHuntHours = this.operatingHours.hoursPerYear;
    //     this.method = 'By Volume';
    //   }
    //   this.flueGasService.initDefaultEmptyOutput();
    //   this.flueGasService.initDefaultEmptyInputs(treasureHuntHours);
    // } else {
    //   this.method = existingInputs.flueGasType;
    // }
    // this.initSubscriptions();
    // if (this.flueGasService.modificationData.getValue()) {
    //   this.modificationExists = true;
    // }
  }

  ngOnDestroy() {
    this.modalSubscription.unsubscribe();
    this.baselineDataSub.unsubscribe();
    this.modificationDataSub.unsubscribe();
    this.baselineEnergySub.unsubscribe();
    this.modificationEnergySub.unsubscribe();
    this.outputSubscription.unsubscribe();
  }

  initSubscriptions() {
    // this.modalSubscription = this.flueGasService.modalOpen.subscribe(modalOpen => {
    //   this.isModalOpen = modalOpen;
    // });

    // this.baselineDataSub = this.flueGasService.baselineData.subscribe(baselineData => {
    //   if (baselineData) {
    //     this.setBaselineSelected();
    //     this.flueGasService.calculate(this.settings, false, true);
    //   }
    // });
    // this.modificationDataSub = this.flueGasService.modificationData.subscribe(modificationData => {
    //   if (modificationData) {
    //     this.flueGasService.calculate(this.settings, false, true);
    //   }
    // });
    // this.outputSubscription = this.flueGasService.output.subscribe(val => {
    //   if (val) {
    //     this.output = val;
    //   }
    // });
    // this.baselineEnergySub = this.flueGasService.baselineEnergyData.subscribe(baselineEnergyData => {
    //   if (baselineEnergyData) {
    //     this.flueGasService.calculate(this.settings, false, true);
    //   }
    // });
    // this.modificationEnergySub = this.flueGasService.modificationEnergyData.subscribe(modificationEnergyData => {
    //   if (modificationEnergyData) {
    //     this.flueGasService.calculate(this.settings, false, true);
    //   }
    // });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  createModification() {
    //this.flueGasService.initModification();
    this.modificationExists = true;
    this.setModificationSelected();
    // this.flueGasService.calculate(this.settings, false, true);
  }

  btnResetData() {
    this.modificationExists = false;
    //this.flueGasService.initDefaultEmptyInputs();
    //this.flueGasService.resetData.next(true);
    this.baselineSelected = true;
    //this.flueGasService.modificationData.next(undefined);
  }

  btnGenerateExample() {
    this.modificationExists = true;
    //this.flueGasService.generateExampleData(this.settings);
    this.baselineSelected = true;
  }


  save() {
    // let baselineData: FlueGas = this.flueGasService.baselineData.getValue();
    // let baselineEnergyData: FlueGasEnergyData = this.flueGasService.baselineEnergyData.getValue();
    // let modificationData: FlueGas = this.flueGasService.modificationData.getValue();
    // let modificationEnergyData: FlueGasEnergyData = this.flueGasService.modificationEnergyData.getValue();

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

import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { StandaloneService } from '../../standalone.service';
import { CombinedHeatPower, CombinedHeatPowerOutput } from '../../../shared/models/standalone';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CombinedHeatPowerService } from './combined-heat-power.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-combined-heat-power',
  templateUrl: './combined-heat-power.component.html',
  styleUrls: ['./combined-heat-power.component.css']
})
export class CombinedHeatPowerComponent implements OnInit {

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
   setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  settings: Settings;
  smallScreenTab: string = 'form';
  containerHeight: number;
  headerHeight: number;

  inputs: CombinedHeatPower = {
    annualOperatingHours: 8760,
    annualElectricityConsumption: 0,
    annualThermalDemand: 0,
    boilerThermalFuelCosts: 0,
    avgElectricityCosts: 0,
    option: 0,
    boilerThermalFuelCostsCHPcase: 0,
    CHPfuelCosts: 0,
    percentAvgkWhElectricCostAvoidedOrStandbyRate: 75,
    displacedThermalEfficiency: 0,
    chpAvailability: 0,
    thermalUtilization: 0
  };

  results: CombinedHeatPowerOutput = {
    annualOperationSavings: 0,
    totalInstalledCostsPayback: 0,
    simplePayback: 0,
    fuelCosts: 0,
    thermalCredit: 0,
    incrementalOandM: 0,
    totalOperatingCosts: 0
  };
  currentField: string = 'annualOperatingHours';
  tabSelect: string = 'results';
  constructor(private settingsDbService: SettingsDbService, private combinedHeatPowerService: CombinedHeatPowerService, private standaloneService: StandaloneService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (this.combinedHeatPowerService.inputData) {
      this.inputs = this.combinedHeatPowerService.inputData;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.combinedHeatPowerService.inputData = this.inputs;
  }

  btnResetData() {
    this.inputs = this.combinedHeatPowerService.getResetData();
    this.combinedHeatPowerService.inputData = this.inputs;
    this.calculate();
  }

  btnGenerateExample() {
    this.inputs = this.combinedHeatPowerService.generateExample(this.settings);
    this.combinedHeatPowerService.inputData = this.inputs;
    this.calculate();
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setCurrentField(str: string) {
    this.currentField = str;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  calculate() {
    this.results = this.standaloneService.CHPcalculator(this.inputs, this.settings);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

}

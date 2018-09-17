import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { StandaloneService } from '../../standalone.service';
import { CombinedHeatPower, CombinedHeatPowerOutput } from '../../../shared/models/standalone';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CombinedHeatPowerService } from './combined-heat-power.service';

@Component({
  selector: 'app-combined-heat-power',
  templateUrl: './combined-heat-power.component.html',
  styleUrls: ['./combined-heat-power.component.css']
})
export class CombinedHeatPowerComponent implements OnInit {

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  inputs: CombinedHeatPower = {
    annualOperatingHours: 0,
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
  }

  results: CombinedHeatPowerOutput = {
    annualOperationSavings: 0,
    totalInstalledCostsPayback: 0,
    simplePayback: 0,
    fuelCosts: 0,
    thermalCredit: 0,
    incrementalOandM: 0,
    totalOperatingCosts: 0
  }
  currentField: string = 'annualOperatingHours';
  tabSelect: string = 'results';
  constructor(private settingsDbService: SettingsDbService, private combinedHeatPowerService: CombinedHeatPowerService, private standaloneService: StandaloneService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if(this.combinedHeatPowerService.inputData){
      this.inputs = this.combinedHeatPowerService.inputData;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy(){
    this.combinedHeatPowerService.inputData = this.inputs;
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }
  
  setCurrentField(str: string) {
    this.currentField = str;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  calculate() {
    this.results = this.standaloneService.CHPcalculator(this.inputs);
  }

}

import { Component, OnInit, Input, HostListener, ViewChild, ElementRef } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SteamService } from '../steam.service';
import { HeatLossService } from './heat-loss.service';
import { HeatLossInput } from '../../../shared/models/steam/steam-inputs';
import { HeatLossOutput } from '../../../shared/models/steam/steam-outputs';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-heat-loss-calculator',
  templateUrl: './heat-loss.component.html',
  styleUrls: ['./heat-loss.component.css']
})
export class HeatLossComponent implements OnInit {
  @Input()
  settings: Settings;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  headerHeight: number;
  containerHeight: number;  
  smallScreenTab: string = 'form';

  tabSelect: string = 'results';
  currentField: string = 'default';
  heatLossForm: UntypedFormGroup;
  input: HeatLossInput;
  results: HeatLossOutput;
  constructor(private settingsDbService: SettingsDbService, 
    private steamService: SteamService, private heatLossService: HeatLossService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-steam-heat-loss');
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.initForm();
    this.input = this.heatLossService.getObjFromForm(this.heatLossForm);
    this.calculate(this.heatLossForm);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
  changeField(str: string) {
    this.currentField = str;
  }

  initForm() {
    if (this.heatLossService.heatLossInput) {
      this.heatLossForm = this.heatLossService.getFormFromObj(this.heatLossService.heatLossInput, this.settings);
    }else {
      this.heatLossForm = this.heatLossService.resetForm(this.settings);
    }
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

  calculate(form: UntypedFormGroup) {
    this.input = this.heatLossService.getObjFromForm(form);
    this.heatLossService.heatLossInput = this.input;
    if (form.status === 'VALID') {
      this.results = this.steamService.heatLoss(this.input, this.settings);
    } else {
      this.results = this.getEmptyResults();
    }
  }

  getEmptyResults(): HeatLossOutput {
    let emptyResults: HeatLossOutput = {
      heatLoss: 0,
      inletEnergyFlow: 0,
      inletMassFlow: 0,
      inletPressure: 0,
      inletQuality: 0,
      inletSpecificEnthalpy: 0,
      inletSpecificEntropy: 0,
      inletTemperature: 0,
      outletEnergyFlow: 0,
      outletMassFlow: 0,
      outletPressure: 0,
      outletQuality: 0,
      outletSpecificEnthalpy: 0,
      outletSpecificEntropy: 0,
      outletTemperature: 0
    };

    return emptyResults;
  }

  btnResetData() {
    this.heatLossForm = this.heatLossService.resetForm(this.settings);
    this.calculate(this.heatLossForm);
  }
  btnGenerateExample() {
    this.heatLossForm = this.heatLossService.initForm(this.settings);
    this.calculate(this.heatLossForm);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  } 
}

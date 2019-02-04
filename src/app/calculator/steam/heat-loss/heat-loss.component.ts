import { Component, OnInit, Input, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SteamService } from '../steam.service';
import { HeatLossService } from './heat-loss.service';
import { HeatLossInput } from '../../../shared/models/steam/steam-inputs';
import { HeatLossOutput } from '../../../shared/models/steam/steam-outputs';

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
    this.resizeTabs();
  }
  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;
  headerHeight: number;

  tabSelect: string = 'results';
  currentField: string = 'default';
  heatLossForm: FormGroup;
  input: HeatLossInput;
  results: HeatLossOutput;
  constructor(private settingsDbService: SettingsDbService, private steamService: SteamService, private heatLossService: HeatLossService) { }

  ngOnInit() {
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
    }, 50);
  }

  btnResetData() {
    this.heatLossForm = this.heatLossService.initForm(this.settings);
    this.calculate(this.heatLossForm);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
  changeField(str: string) {
    this.currentField = str;
  }

  initForm() {
    if(this.heatLossService.heatLossInput){
      this.heatLossForm = this.heatLossService.getFormFromObj(this.heatLossService.heatLossInput, this.settings);
    }else{
      this.heatLossForm = this.heatLossService.initForm(this.settings);
    }
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  calculate(form: FormGroup) {
    this.input = this.heatLossService.getObjFromForm(form);
    this.heatLossService.heatLossInput = this.input;
    if (form.status == 'VALID') {
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
    }

    return emptyResults;
  }
}

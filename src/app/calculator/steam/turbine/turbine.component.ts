import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SteamService } from '../steam.service';
import { TurbineInput, TurbineOutput } from '../../../shared/models/steam';
import { TurbineService } from './turbine.service';

@Component({
  selector: 'app-turbine',
  templateUrl: './turbine.component.html',
  styleUrls: ['./turbine.component.css']
})
export class TurbineComponent implements OnInit {
  @Input()
  settings: Settings;

  tabSelect: string = 'results';
  currentField: string = 'default';
  turbineForm: FormGroup;
  input: TurbineInput;
  results: TurbineOutput;
  constructor(private settingsDbService: SettingsDbService, private steamService: SteamService, private turbineService: TurbineService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.getForm();
    this.input = this.turbineService.getObjFromForm(this.turbineForm);
    this.calculate(this.turbineForm);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
  changeField(str: string) {
    this.currentField = str;
  }

  getForm() {
    this.turbineForm = this.turbineService.initForm(this.settings);
  }

  calculate(form: FormGroup) {
    this.input = this.turbineService.getObjFromForm(form);
    // console.log(form);
    if (form.status == 'VALID') {
      this.results = this.steamService.turbine(this.input, this.settings);
    } else {
      this.results = this.getEmptyResults();
    }
  }

  getEmptyResults(): TurbineOutput {
    let emptyResults: TurbineOutput = {
      energyOut: 0,
      generatorEfficiency: 0,
      inletEnergyFlow: 0,
      inletPressure: 0,
      inletQuality: 0,
      inletSpecificEnthalpy: 0,
      inletSpecificEntropy: 0,
      inletTemperature: 0,
      isentropicEfficiency: 0,
      massFlow: 0,
      outletEnergyFlow: 0,
      outletPressure: 0,
      outletQuality: 0,
      outletSpecificEnthalpy: 0,
      outletSpecificEntropy: 0,
      outletTemperature: 0,
      powerOut: 0
    }
    return emptyResults;
  }
}

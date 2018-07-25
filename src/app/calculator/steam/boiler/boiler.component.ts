import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { BoilerInput, BoilerOutput } from '../../../shared/models/steam';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SteamService } from '../steam.service';
import { BoilerService } from './boiler.service';

@Component({
  selector: 'app-boiler',
  templateUrl: './boiler.component.html',
  styleUrls: ['./boiler.component.css']
})
export class BoilerComponent implements OnInit {
  @Input()
  settings: Settings;

  headerHeight: number;
  tabSelect: string = 'results';
  currentField: string = 'default';
  boilerForm: FormGroup;
  input: BoilerInput;
  results: BoilerOutput;
  constructor(private settingsDbService: SettingsDbService, private steamService: SteamService, private boilerService: BoilerService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.getForm();
    this.calculate(this.boilerForm);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
  changeField(str: string) {
    this.currentField = str;
  }

  getForm() {
    this.boilerForm = this.boilerService.initForm();
  }

  calculate(form: FormGroup) {
    if (form.status == 'VALID') {
      this.input = this.boilerService.getObjFromForm(form);
      this.results = this.steamService.boiler(this.input, this.settings);
      console.log(this.results);
    }
  }
}

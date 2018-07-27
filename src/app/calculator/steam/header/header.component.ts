import { Component, OnInit, Input } from '@angular/core';
import { HeaderOutput, HeaderInput, HeaderInputObj } from '../../../shared/models/steam';
import { FormGroup } from '../../../../../node_modules/@angular/forms';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SteamService } from '../steam.service';
import { HeaderService } from './header.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input()
  settings: Settings;

  tabSelect: string = 'results';
  currentField: string = 'default';
  headerPressureForm: FormGroup;
  inletForms: Array<FormGroup>;
  input: HeaderInput;
  results: HeaderOutput;
  numInlets: number = 3;
  numInletOptions: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  constructor(private settingsDbService: SettingsDbService, private steamService: SteamService, private headerService: HeaderService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.getForms();
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
  changeField(str: string) {
    this.currentField = str;
  }

  getForms() {
    this.inletForms = new Array<FormGroup>();
    this.headerPressureForm = this.headerService.initHeaderForm(this.settings);
    this.getInletForms();
  }

  getInletForms() {
    if (this.inletForms.length < this.numInlets) {
      for (let i = (this.inletForms.length); i < this.numInlets; i++) {
        let tmpFrom: FormGroup = this.headerService.initInletForm(this.settings);
        this.inletForms.push(tmpFrom);
      }
    } else {
      while (this.inletForms.length != this.numInlets) {
        this.inletForms.pop();
      }
    }
    this.calculate();
  }

  saveInletForm(form: FormGroup, index: number) {
    this.inletForms[index] = form;
    this.calculate();
  }

  calculate() {
    this.input = this.headerService.getObjFromForm(this.headerPressureForm, this.inletForms);
    if (this.headerPressureForm.status == 'VALID') {
      let formTest: boolean = true;
      this.inletForms.forEach(form => {
        if (form.status != 'VALID') {
          formTest = false;
        }
      })
      if (formTest == true) {
        this.results = this.steamService.header(this.input, this.settings);
        console.log(this.results);
      } else {
        this.results = this.getEmptyResults();
      }
    } else {
      this.results = this.getEmptyResults();
    }
  }

  getEmptyResults(): HeaderOutput {
    let emptyResults: HeaderOutput = {
      header: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0
      },
      inlet1: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0
      },
      inlet2: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0
      },
      inlet3: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0
      },
      inlet4: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0
      },
      inlet5: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0
      },
      inlet6: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0
      },
      inlet7: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0
      },
      inlet8: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0
      },
      inlet9: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0
      }
    }

    return emptyResults;
  }
}
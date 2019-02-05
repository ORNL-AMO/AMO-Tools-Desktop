import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormGroup } from '../../../../../node_modules/@angular/forms';
import { PrvInput } from '../../../shared/models/steam/steam-inputs';
import { SteamService } from '../steam.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { PrvService } from './prv.service';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PrvOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-prv-calculator',
  templateUrl: './prv.component.html',
  styleUrls: ['./prv.component.css']
})
export class PrvComponent implements OnInit {
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
  inletForm: FormGroup;
  feedwaterForm: FormGroup;
  input: PrvInput;
  results: PrvOutput;
  isSuperHeating: boolean = false;

  warning: string = null;
  constructor(private settingsDbService: SettingsDbService, private steamService: SteamService, private prvService: PrvService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.initForm();
    this.input = this.prvService.getObjFromForm(this.inletForm, this.feedwaterForm, this.isSuperHeating);
    this.calculate(this.inletForm, this.feedwaterForm)
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 50);
  }

  btnResetData() {
    this.isSuperHeating = false;
    this.setInletForm(this.prvService.initInletForm(this.settings))
    this.setFeedwaterForm(this.prvService.initFeedwaterForm(this.settings));
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
  changeField(str: string) {
    this.currentField = str;
  }

  initForm() {
    if (this.prvService.prvInput) {
      this.inletForm = this.prvService.getInletFormFromObj(this.prvService.prvInput, this.settings);
      this.feedwaterForm = this.prvService.getFeedwaterFormFromObj(this.prvService.prvInput, this.settings);
      this.isSuperHeating = this.prvService.isSuperHeating;
    } else {
      this.inletForm = this.prvService.initInletForm(this.settings);
      this.feedwaterForm = this.prvService.initFeedwaterForm(this.settings);
    }
  }

  setFeedwaterForm(form: FormGroup) {
    this.feedwaterForm = form;
    this.calculate(this.inletForm, this.feedwaterForm);
  }

  setInletForm(form: FormGroup) {
    this.inletForm = form;
    this.calculate(this.inletForm, this.feedwaterForm);
  }

  calculate(inletForm: FormGroup, feedwaterForm: FormGroup) {
    this.input = this.prvService.getObjFromForm(inletForm, feedwaterForm, this.isSuperHeating);
    this.prvService.prvInput = this.input;
    this.prvService.isSuperHeating = this.isSuperHeating;
    if (this.isSuperHeating) {
      if ((inletForm.status == 'VALID') && (feedwaterForm.status == 'VALID')) {
        this.results = this.steamService.prvWithDesuperheating(this.input, this.settings);
        this.checkWarning(this.results, this.input);
      } else {
        this.results = this.getEmptyResults();
      }
    } else {
      if (inletForm.status == 'VALID') {
        this.results = this.steamService.prvWithoutDesuperheating(this.input, this.settings);
      } else {
        this.results = this.getEmptyResults();
      }
    }
  }


  checkWarning(results: PrvOutput, input: PrvInput) {
    if (results.outletSpecificEnthalpy > results.inletSpecificEnthalpy) {
      this.warning = "Outlet specific enthalpy associated with set desuperheating temperature is greater than inlet specific enthalpy. Desuperheating canceled.";
    }
    else if (input.desuperheatingTemp) {
      let desuperheatingTemp = this.convertUnitsService.value(input.desuperheatingTemp - 273.15).from('C').to(this.settings.steamTemperatureMeasurement);
      if (desuperheatingTemp > results.inletTemperature) {
        this.warning = "Outlet specific enthalpy associated with set desuperheating temperature is greater than inlet specific enthalpy. Desuperheating canceled.";
      }
      else {
        this.warning = null;
      }
    }
    else {
      this.warning = null;
    }
  }



  getEmptyResults(): PrvOutput {
    let emptyResults: PrvOutput = {
      feedwaterEnergyFlow: 0,
      feedwaterMassFlow: 0,
      feedwaterPressure: 0,
      feedwaterQuality: 0,
      feedwaterSpecificEnthalpy: 0,
      feedwaterSpecificEntropy: 0,
      feedwaterTemperature: 0,
      feedwaterVolume: 0,
      inletEnergyFlow: 0,
      inletMassFlow: 0,
      inletPressure: 0,
      inletQuality: 0,
      inletSpecificEnthalpy: 0,
      inletSpecificEntropy: 0,
      inletTemperature: 0,
      inletVolume: 0,
      outletEnergyFlow: 0,
      outletMassFlow: 0,
      outletPressure: 0,
      outletQuality: 0,
      outletSpecificEnthalpy: 0,
      outletSpecificEntropy: 0,
      outletTemperature: 0,
      outletVolume: 0
    }

    return emptyResults;
  }
}

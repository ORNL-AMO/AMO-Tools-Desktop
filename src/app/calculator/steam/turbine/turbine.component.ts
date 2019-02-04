import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SteamService } from '../steam.service';
import { TurbineInput } from '../../../shared/models/steam/steam-inputs';
import { TurbineService } from './turbine.service';
import { TurbineOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-turbine-calculator',
  templateUrl: './turbine.component.html',
  styleUrls: ['./turbine.component.css']
})
export class TurbineComponent implements OnInit {
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
  turbineForm: FormGroup;
  input: TurbineInput;
  results: TurbineOutput;

  warning: string;

  constructor(private settingsDbService: SettingsDbService, private steamService: SteamService, private turbineService: TurbineService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.initForm();
    this.input = this.turbineService.getObjFromForm(this.turbineForm);
    this.calculate(this.turbineForm);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 50);
  }

  btnResetData() {
    this.turbineForm = this.turbineService.initForm(this.settings);
    this.calculate(this.turbineForm);
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
    if (this.turbineService.turbineInput) {
      this.turbineForm = this.turbineService.getFormFromObj(this.turbineService.turbineInput, this.settings);
    } else {
      this.turbineForm = this.turbineService.initForm(this.settings);
    }
  }

  calculate(form: FormGroup) {
    this.input = this.turbineService.getObjFromForm(form);
    this.turbineService.turbineInput = this.input;
    if (this.input.inletPressure < this.input.outletSteamPressure) {
      this.warning = "Outlet pressure of the turbine cannot be greater than the inlet pressure."
    }
    else {
      this.warning = null;
    }

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
      powerOut: 0,
      inletVolume: 0,
      outletVolume: 0,
      outletIdealPressure: 0,
      outletIdealTemperature: 0,
      outletIdealSpecificEnthalpy: 0,
      outletIdealSpecificEntropy: 0,
      outletIdealQuality: 0,
      outletIdealVolume: 0
    }
    return emptyResults;
  }
}

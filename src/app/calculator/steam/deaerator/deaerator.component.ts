import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SteamService } from '../steam.service';
import { DeaeratorInput } from '../../../shared/models/steam/steam-inputs';
import { DeaeratorService } from './deaerator.service';
import { DeaeratorOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-deaerator-calculator',
  templateUrl: './deaerator.component.html',
  styleUrls: ['./deaerator.component.css']
})
export class DeaeratorComponent implements OnInit {
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
  deaeratorForm: FormGroup;
  input: DeaeratorInput;
  results: DeaeratorOutput;
  constructor(private settingsDbService: SettingsDbService, private steamService: SteamService, private deaeratorService: DeaeratorService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.initForm();
    this.input = this.deaeratorService.getObjFromForm(this.deaeratorForm);
    this.calculate(this.deaeratorForm);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 50);
  }

  btnResetData() {
    this.deaeratorForm = this.deaeratorService.initForm(this.settings);
    this.calculate(this.deaeratorForm);
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
    if (this.deaeratorService.deaeratorInput) {
      this.deaeratorForm = this.deaeratorService.getFormFromObj(this.deaeratorService.deaeratorInput, this.settings);
    } else {
      this.deaeratorForm = this.deaeratorService.initForm(this.settings);
    }
  }

  calculate(form: FormGroup) {
    this.input = this.deaeratorService.getObjFromForm(form);
    this.deaeratorService.deaeratorInput = this.input;
    if (form.status == 'VALID') {
      this.results = this.steamService.deaerator(this.input, this.settings);
    } else {
      this.results = this.getEmptyResults();
    }
  }

  getEmptyResults(): DeaeratorOutput {
    let emptyResults: DeaeratorOutput = {
      feedwaterEnergyFlow: 0,
      feedwaterMassFlow: 0,
      feedwaterPressure: 0,
      feedwaterQuality: 0,
      feedwaterSpecificEnthalpy: 0,
      feedwaterSpecificEntropy: 0,
      feedwaterTemperature: 0,
      feedwaterVolume: 0,
      inletSteamEnergyFlow: 0,
      inletSteamMassFlow: 0,
      inletSteamPressure: 0,
      inletSteamQuality: 0,
      inletSteamSpecificEnthalpy: 0,
      inletSteamSpecificEntropy: 0,
      inletSteamTemperature: 0,
      inletWaterEnergyFlow: 0,
      inletWaterMassFlow: 0,
      inletWaterPressure: 0,
      inletWaterQuality: 0,
      inletWaterSpecificEnthalpy: 0,
      inletWaterSpecificEntropy: 0,
      inletWaterTemperature: 0,
      ventedSteamEnergyFlow: 0,
      ventedSteamMassFlow: 0,
      ventedSteamPressure: 0,
      ventedSteamQuality: 0,
      ventedSteamSpecificEnthalpy: 0,
      ventedSteamSpecificEntropy: 0,
      ventedSteamTemperature: 0,
      ventedSteamVolume: 0,
      inletSteamVolume: 0,
      inletWaterVolume: 0
    }
    return emptyResults;
  }
}

import {Component, OnInit, Input, ElementRef, ViewChild, HostListener} from '@angular/core';
import {Settings} from '../../../shared/models/settings';
import {FormGroup} from '@angular/forms';
import {BoilerInput} from '../../../shared/models/steam/steam-inputs';
import {SettingsDbService} from '../../../indexedDb/settings-db.service';
import {SteamService} from '../steam.service';
import {BoilerService} from './boiler.service';
import {BoilerOutput} from '../../../shared/models/steam/steam-outputs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-boiler-calculator',
  templateUrl: './boiler.component.html',
  styleUrls: ['./boiler.component.css']
})
export class BoilerComponent implements OnInit {
  @Input()
  settings: Settings;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;

  containerHeight: number;  
  smallScreenTab: string = 'form';
  headerHeight: number;
  tabSelect: string = 'results';
  currentField: string = 'default';
  boilerForm: FormGroup;
  input: BoilerInput;
  results: BoilerOutput;
  isModalOpen: boolean;
  modalOpenSub: Subscription;
  constructor(private settingsDbService: SettingsDbService, private steamService: SteamService, private boilerService: BoilerService) {
  }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.initForm();
    this.calculate(this.boilerForm);
    this.modalOpenSub = this.boilerService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    })
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.modalOpenSub.unsubscribe();
    this.boilerService.modalOpen.next(false);
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

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  initForm() {
    if (this.boilerService.boilerInput) {
      this.boilerForm = this.boilerService.getFormFromObj(this.boilerService.boilerInput, this.settings);
    } else {
      this.boilerForm = this.boilerService.resetForm(this.settings);
    }
  }

  calculate(form: FormGroup) {
    this.input = this.boilerService.getObjFromForm(form);
    this.boilerService.boilerInput = this.input;
    if (form.status === 'VALID') {
      this.results = this.steamService.boiler(this.input, this.settings);
    } else {
      this.results = this.getEmptyResults();
    }
  }

  getEmptyResults(): BoilerOutput {
    let results: BoilerOutput = {
      steamPressure: 0,
      steamTemperature: 0,
      steamSpecificEnthalpy: 0,
      steamSpecificEntropy: 0,
      steamQuality: 0,
      steamMassFlow: 0,
      steamEnergyFlow: 0,
      steamVolume: 0,
      blowdownPressure: 0,
      blowdownTemperature: 0,
      blowdownSpecificEnthalpy: 0,
      blowdownSpecificEntropy: 0,
      blowdownQuality: 0,
      blowdownMassFlow: 0,
      blowdownEnergyFlow: 0,
      blowdownVolume: 0,
      feedwaterPressure: 0,
      feedwaterTemperature: 0,
      feedwaterSpecificEnthalpy: 0,
      feedwaterSpecificEntropy: 0,
      feedwaterQuality: 0,
      feedwaterMassFlow: 0,
      feedwaterEnergyFlow: 0,
      feedwaterVolume: 0,
      boilerEnergy: 0,
      fuelEnergy: 0,
      blowdownRate: 0,
      combustionEff: 0
    };
    return results;
  }

  btnResetData() {
    this.boilerForm = this.boilerService.resetForm(this.settings);
    this.calculate(this.boilerForm);
  }

  btnGenerateExample() {
    this.boilerForm = this.boilerService.initForm(this.settings);
    this.calculate(this.boilerForm);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

}

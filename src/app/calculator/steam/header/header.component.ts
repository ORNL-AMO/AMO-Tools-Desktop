import {Component, OnInit, Input, ViewChild, ElementRef, HostListener} from '@angular/core';
import {HeaderInput} from '../../../shared/models/steam/steam-inputs';
import {FormGroup} from '../../../../../node_modules/@angular/forms';
import {SettingsDbService} from '../../../indexedDb/settings-db.service';
import {SteamService} from '../steam.service';
import {HeaderService} from './header.service';
import {Settings} from '../../../shared/models/settings';
import {HeaderOutput} from '../../../shared/models/steam/steam-outputs';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
    selector: 'app-header-calculator',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    standalone: false
})
export class HeaderComponent implements OnInit {
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
  headerPressureForm: FormGroup;
  inletForms: Array<FormGroup>;
  input: HeaderInput;
  results: HeaderOutput;
  numInletOptions: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  inletThermoQuantity: number = 0;

  constructor(private settingsDbService: SettingsDbService, 
    private steamService: SteamService, private headerService: HeaderService,
    private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-STEAM-header');
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.initForms();
    this.calculate();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.headerService.headerInput = this.input;
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

  changeField(str: string, index?: number) {
    this.currentField = str;
    if (index) {
      this.inletThermoQuantity = this.inletForms[index].controls.thermodynamicQuantity.value;
    }
  }

  initForms() {
    this.inletForms = new Array<FormGroup>();
    if (this.headerService.headerInput) {
      this.input = this.headerService.headerInput;
      this.headerService.headerInput.inlets.forEach(inlet => {
        let tmpForm: FormGroup = this.headerService.getInletFormFromObj(inlet, this.settings);
        this.inletForms.push(tmpForm);
      });
      this.headerPressureForm = this.headerService.getHeaderFormFromObj(this.headerService.headerInput, this.settings);
    } else {
      this.headerPressureForm = this.headerService.resetHeaderForm(this.settings);
      this.getInletForms();
    }
  }

  getInletForms() {
    if (this.headerPressureForm.controls.numInlets.value > this.inletForms.length) {
      for (let i = (this.inletForms.length); i < this.headerPressureForm.controls.numInlets.value; i++) {
        let tmpForm: FormGroup = this.headerService.resetInletForm(this.settings);
        this.inletForms.push(tmpForm);
      }
    } else {
      while (this.inletForms.length !== this.headerPressureForm.controls.numInlets.value) {
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
    this.headerService.headerInput = this.input;
    if (this.headerPressureForm.status === 'VALID') {
      let formTest: boolean = true;
      this.inletForms.forEach(form => {
        if (form.status !== 'VALID') {
          formTest = false;
        }
      });
      if (formTest === true) {
        this.results = this.steamService.header(this.input, this.settings);
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
        temperature: 0,
        specificVolume: 0
      },
      inlet1: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0,
        specificVolume: 0
      },
      inlet2: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0,
        specificVolume: 0
      },
      inlet3: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0,
        specificVolume: 0
      },
      inlet4: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0,
        specificVolume: 0
      },
      inlet5: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0,
        specificVolume: 0
      },
      inlet6: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0,
        specificVolume: 0
      },
      inlet7: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0,
        specificVolume: 0
      },
      inlet8: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0,
        specificVolume: 0
      },
      inlet9: {
        energyFlow: 0,
        massFlow: 0,
        pressure: 0,
        quality: 0,
        specificEnthalpy: 0,
        specificEntropy: 0,
        temperature: 0,
        specificVolume: 0
      }
    };

    return emptyResults;
  }

  btnResetData() {
    this.inletForms = new Array<FormGroup>();
    this.headerPressureForm = this.headerService.resetHeaderForm(this.settings);
    this.getInletForms();
  }

  btnGenerateExample() {
    this.inletForms = new Array<FormGroup>();
    this.inletForms = this.headerService.initInletForm(this.settings);
    this.headerPressureForm = this.headerService.initHeaderForm(this.settings);
    this.getInletForms();
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}

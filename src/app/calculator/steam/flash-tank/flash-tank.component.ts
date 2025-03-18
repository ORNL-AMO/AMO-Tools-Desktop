import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormGroup } from '../../../../../node_modules/@angular/forms';
import { FlashTankInput } from '../../../shared/models/steam/steam-inputs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SteamService } from '../steam.service';
import { Settings } from '../../../shared/models/settings';
import { FlashTankService } from './flash-tank.service';
import { FlashTankOutput } from '../../../shared/models/steam/steam-outputs';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
    selector: 'app-flash-tank-calculator',
    templateUrl: './flash-tank.component.html',
    styleUrls: ['./flash-tank.component.css'],
    standalone: false
})
export class FlashTankComponent implements OnInit {
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
  headerHeight: number;
  containerHeight: number;  
  smallScreenTab: string = 'form';

  tabSelect: string = 'results';
  currentField: string = 'default';
  flashTankForm: FormGroup;
  input: FlashTankInput;
  results: FlashTankOutput;
  constructor(private settingsDbService: SettingsDbService, 
    private steamService: SteamService, private flashTankService: FlashTankService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-STEAM-flash-tank');
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.initForm();
    this.input = this.flashTankService.getObjFromForm(this.flashTankForm);
    this.calculate(this.flashTankForm);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
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
    if (this.flashTankService.flashTankInput) {
      this.flashTankForm = this.flashTankService.getFormFromObj(this.flashTankService.flashTankInput, this.settings);
    } else {
      this.flashTankForm = this.flashTankService.resetForm(this.settings);
    }
  }

  calculate(form: FormGroup) {
    this.input = this.flashTankService.getObjFromForm(form);
    this.flashTankService.flashTankInput = this.input;
    if (form.status === 'VALID') {
      this.results = this.steamService.flashTank(this.input, this.settings);
    } else {
      this.results = this.getEmptyResults();
    }
  }

  getEmptyResults(): FlashTankOutput {
    let emptyResults: FlashTankOutput = {
      inletWaterEnergyFlow: 0,
      inletWaterMassFlow: 0,
      inletWaterPressure: 0,
      inletWaterQuality: 0,
      inletWaterSpecificEnthalpy: 0,
      inletWaterSpecificEntropy: 0,
      inletWaterTemperature: 0,
      inletWaterVolume: 0,
      outletGasEnergyFlow: 0,
      outletGasMassFlow: 0,
      outletGasPressure: 0,
      outletGasQuality: 0,
      outletGasSpecificEnthalpy: 0,
      outletGasSpecificEntropy: 0,
      outletGasTemperature: 0,
      outletGasVolume: 0,
      outletLiquidEnergyFlow: 0,
      outletLiquidMassFlow: 0,
      outletLiquidPressure: 0,
      outletLiquidQuality: 0,
      outletLiquidSpecificEnthalpy: 0,
      outletLiquidSpecificEntropy: 0,
      outletLiquidTemperature: 0,
      outletLiquidVolume: 0
    };

    return emptyResults;
  }

  btnResetData() {
    this.flashTankForm = this.flashTankService.resetForm(this.settings);
    this.calculate(this.flashTankForm);
  }

  btnGenerateExample() {
    this.flashTankForm = this.flashTankService.initForm(this.settings);
    this.calculate(this.flashTankForm);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}

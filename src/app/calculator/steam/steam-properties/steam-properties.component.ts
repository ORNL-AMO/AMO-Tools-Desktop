import { Component, Input, OnInit, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { Settings } from "../../../shared/models/settings";
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SteamPropertiesInput } from '../../../shared/models/steam/steam-inputs';
import { SteamService } from '../steam.service';
import { SteamPropertiesOutput } from '../../../shared/models/steam/steam-outputs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { LessThanValidator } from '../../../shared/validators/less-than';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';


@Component({
    selector: 'app-steam-properties-calculator',
    templateUrl: './steam-properties.component.html',
    styleUrls: ['./steam-properties.component.css'],
    standalone: false
})
export class SteamPropertiesComponent implements OnInit {
  @Input()
  settings: Settings;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getChartHeight();
    this.getChartWidth();
    this.resizeTabs();
  }

  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  headerHeight: number;
  containerHeight: number;  
  smallScreenTab: string = 'form';

  @ViewChild('lineChartContainer', { static: false }) lineChartContainer: ElementRef;
  chartContainerHeight: number;
  chartContainerWidth: number;

  steamPropertiesForm: UntypedFormGroup;
  steamPropertiesOutput: SteamPropertiesOutput;
  tabSelect: string = 'results';
  currentField: string = 'pressure';
  graphToggle: string = '0';
  graphToggleForm: UntypedFormGroup;
  data: { pressure: number, thermodynamicQuantity: number, temperature: number, enthalpy: number, entropy: number, volume: number, quality: number};

  validPlot: boolean = false;
  ranges: { minPressure: number, maxPressure: number, minQuantityValue: number, maxQuantityValue: number };
  toggleResetData: boolean = false;
  toggleExampleData: boolean = false;

  constructor(private formBuilder: UntypedFormBuilder,
     private convertUnitsService: ConvertUnitsService, 
     private settingsDbService: SettingsDbService, private changeDetectorRef: ChangeDetectorRef, 
     private steamService: SteamService,
     private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-STEAM-properties');
    this.graphToggleForm = this.formBuilder.group({
      'graphToggle': [0, Validators.required]
    });

    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    this.steamPropertiesOutput = this.getEmptyResults();
    this.getForm(0);
    this.calculate(this.steamPropertiesForm);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getChartWidth();
      this.getChartHeight();
      this.changeDetectorRef.detectChanges();
    }, 50);
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }


  getForm(quantityValue: number) {
    this.ranges = this.getRanges(quantityValue);
    if (this.steamService.steamPropertiesInput) {
      this.steamPropertiesForm = this.formBuilder.group({
        'pressure': [this.steamService.steamPropertiesInput.pressure, [Validators.required, Validators.min(this.ranges.minPressure), LessThanValidator.lessThan(this.ranges.maxPressure)]],
        'thermodynamicQuantity': [this.steamService.steamPropertiesInput.thermodynamicQuantity, Validators.required],
        'quantityValue': [this.steamService.steamPropertiesInput.quantityValue, [Validators.required, Validators.min(this.ranges.minQuantityValue), Validators.max(this.ranges.maxQuantityValue)]]
      });
    } else {
      this.steamPropertiesForm = this.formBuilder.group({
        'pressure': ['', [Validators.required, Validators.min(this.ranges.minPressure), LessThanValidator.lessThan(this.ranges.maxPressure)]],
        'thermodynamicQuantity': [quantityValue, Validators.required],
        'quantityValue': ['', [Validators.required, Validators.min(this.ranges.minQuantityValue), Validators.max(this.ranges.maxQuantityValue)]]
      });
    }
  }

  updateForm(quantityValue: number) {
    this.ranges = this.getRanges(quantityValue);
    this.steamPropertiesForm.controls.quantityValue.setValidators([Validators.required, Validators.min(this.ranges.minQuantityValue), Validators.max(this.ranges.maxQuantityValue)]);
  }

  setTab(str: string) {
    this.tabSelect = str;
    setTimeout(() => {
      this.getChartWidth();
      this.getChartHeight();
      this.changeDetectorRef.detectChanges();
    }, 50);
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setField(str: string) {
    this.currentField = str;
  }

  getChartWidth() {
    if (this.lineChartContainer) {
      this.chartContainerWidth = this.lineChartContainer.nativeElement.clientWidth * .9;
    } else {
      this.chartContainerWidth = 600;
    }
  }

  getChartHeight() {
    if (this.lineChartContainer) {
      this.chartContainerHeight = this.lineChartContainer.nativeElement.clientHeight * .8;
    } else {
      this.chartContainerHeight = 800;
    }
  }

  calculate(form: UntypedFormGroup) {
    let input: SteamPropertiesInput = {
      quantityValue: form.controls.quantityValue.value,
      thermodynamicQuantity: form.controls.thermodynamicQuantity.value,
      pressure: form.controls.pressure.value
    };
    this.steamService.steamPropertiesInput = input;
    if (form.status === 'VALID') {
      this.steamPropertiesOutput = this.steamService.steamProperties(input, this.settings);
      this.validPlot = true;
    }
  }

  getEmptyResults(): SteamPropertiesOutput {
    return {
      pressure: 0,
      temperature: 0,
      specificEnthalpy: 0,
      specificEntropy: 0,
      quality: 0,
      specificVolume: 0
    };
  }

  addRow() {
    this.data = {
      pressure: this.steamPropertiesOutput.pressure,
      thermodynamicQuantity: this.steamPropertiesForm.controls.thermodynamicQuantity.value,
      temperature: this.steamPropertiesOutput.temperature,
      enthalpy: this.steamPropertiesOutput.specificEnthalpy,
      entropy: this.steamPropertiesOutput.specificEntropy,
      volume: this.steamPropertiesOutput.specificVolume,
      quality: this.steamPropertiesOutput.quality
    };
  }

  toggleGraph() {
    this.graphToggle = this.graphToggleForm.controls.graphToggle.value.toString();
  }

  getRanges(quantityValue: number): { minPressure: number, maxPressure: number, minQuantityValue: number, maxQuantityValue: number } {
    let quantityRanges: { min: number, max: number } = this.steamService.getQuantityRange(this.settings, quantityValue);
    let minPressure: number = Number(this.convertUnitsService.value(1).from('kPaa').to(this.settings.steamPressureMeasurement).toFixed(3));
    let maxPressure: number = Number(this.convertUnitsService.value(100).from('MPaa').to(this.settings.steamPressureMeasurement).toFixed(3));
    return {
      minQuantityValue: quantityRanges.min,
      maxQuantityValue: quantityRanges.max,
      minPressure: minPressure,
      maxPressure: maxPressure
    };
  }

  btnResetData() {
    this.steamService.steamPropertiesInput = {
      thermodynamicQuantity: 0,
      pressure: 0,
      quantityValue: 0
    };
    this.steamPropertiesOutput = this.getEmptyResults();
    this.getForm(0);
    this.calculate(this.steamPropertiesForm);
    this.toggleResetData = !this.toggleResetData;
  }

  btnGenerateExample() {
    let tmpPressure = 1678;
    let tmpQuantityValue = 158.5;
    if (this.settings.steamPressureMeasurement !== 'psig') {
      tmpPressure = Math.round(this.convertUnitsService.value(tmpPressure).from('psig').to(this.settings.steamPressureMeasurement) * 100) / 100;
    }
    if (this.settings.steamTemperatureMeasurement !== 'F') {
      tmpQuantityValue = Math.round(this.convertUnitsService.value(tmpQuantityValue).from('F').to(this.settings.steamTemperatureMeasurement) * 100) / 100;
    }
    this.steamService.steamPropertiesInput = {
      thermodynamicQuantity: 0,
      pressure: tmpPressure,
      quantityValue: tmpQuantityValue,
    };
    this.steamPropertiesOutput = this.getEmptyResults();
    this.getForm(0);
    this.calculate(this.steamPropertiesForm);
    this.toggleExampleData = !this.toggleExampleData;
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}

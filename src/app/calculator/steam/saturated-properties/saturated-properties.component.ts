import { Component, Input, OnInit, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Settings } from "../../../shared/models/settings";
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SaturatedPropertiesInput } from '../../../shared/models/steam/steam-inputs';
import { SteamService } from '../steam.service';
import { SaturatedPropertiesOutput } from '../../../shared/models/steam/steam-outputs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-saturated-properties-calculator',
  templateUrl: './saturated-properties.component.html',
  styleUrls: ['./saturated-properties.component.css']
})
export class SaturatedPropertiesComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('lineChartContainer') lineChartContainer: ElementRef;
  chartContainerHeight: number;
  chartContainerWidth: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getChartHeight();
    this.getChartWidth();
    this.resizeTabs();
  }

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  headerHeight: number;

  ranges: { minTemp: number, maxTemp: number, minPressure: number, maxPressure: number };
  saturatedPropertiesForm: FormGroup;
  saturatedPropertiesOutput: SaturatedPropertiesOutput;
  pressureOrTemperature: number;
  tabSelect: string = 'results';
  currentField: string = 'pressure';

  data: { pressure: number, temperature: number, satLiquidEnthalpy: number, evapEnthalpy: number, satGasEnthalpy: number, satLiquidEntropy: number, evapEntropy: number, satGasEntropy: number, satLiquidVolume: number, evapVolume: number, satGasVolume: number };

  graphToggle: string = '0';
  graphToggleForm: FormGroup;
  plotReady: boolean = false;
  toggleResetData: boolean = true;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private settingsDbService: SettingsDbService, private changeDetectorRef: ChangeDetectorRef, private steamService: SteamService) { }

  ngOnInit() {

    this.graphToggleForm = this.formBuilder.group({
      'graphToggle': [0, Validators.required]
    });

    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    this.ranges = this.getRanges();
    this.saturatedPropertiesOutput = this.getEmptyResults();
    this.initForm();
    this.calculate(this.saturatedPropertiesForm);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getChartWidth();
      this.getChartHeight();
      this.resizeTabs();
      this.changeDetectorRef.detectChanges();
    }, 100)
  }

  btnResetData() {
    this.saturatedPropertiesOutput = this.getEmptyResults();
    this.steamService.saturatedPropertiesInputs = null;
    this.initForm();
    this.calculate(this.saturatedPropertiesForm);
    this.toggleResetData = !this.toggleResetData;
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }
  initForm() {
    let pressureMin: number = Number(this.convertUnitsService.value(1).from('kPaa').to(this.settings.steamPressureMeasurement).toFixed(3));
    let pressureMax: number = Number(this.convertUnitsService.value(22064).from('kPaa').to(this.settings.steamPressureMeasurement).toFixed(3));
    if(this.steamService.saturatedPropertiesInputs){
      this.saturatedPropertiesForm = this.formBuilder.group({
        'pressureOrTemperature': [this.steamService.saturatedPropertiesInputs.pressureOrTemperature, Validators.required],
        'saturatedPressure': [this.steamService.saturatedPropertiesInputs.inputs.saturatedPressure, [Validators.required, Validators.min(pressureMin), Validators.max(pressureMax)]],
        'saturatedTemperature': [this.steamService.saturatedPropertiesInputs.inputs.saturatedTemperature]
      });
    }else{
      this.saturatedPropertiesForm = this.formBuilder.group({
        'pressureOrTemperature': [0, Validators.required],
        'saturatedPressure': ['',  [Validators.required, Validators.min(pressureMin), Validators.max(pressureMax)]],
        'saturatedTemperature': ['']
      });
    }

  }

  setTab(str: string) {
    this.tabSelect = str;
    setTimeout(() => {
      this.getChartWidth();
      this.getChartHeight();
      this.changeDetectorRef.detectChanges();
    }, 50)
  }

  setField(str: string) {
    this.currentField = str;
  }

  getChartWidth() {
    if (this.lineChartContainer) {
      this.chartContainerWidth = this.lineChartContainer.nativeElement.clientWidth * .9;
    }
    else {
      this.chartContainerWidth = 600;
    }
  }

  getChartHeight() {
    if (this.lineChartContainer) {
      this.chartContainerHeight = this.lineChartContainer.nativeElement.clientHeight * .7;
    }
    else {
      this.chartContainerHeight = 800;
    }
  }
  calculate(form: FormGroup) {
    let input: SaturatedPropertiesInput = {
      saturatedTemperature: form.controls.saturatedTemperature.value,
      saturatedPressure: form.controls.saturatedPressure.value,
    }
    this.pressureOrTemperature = form.controls.pressureOrTemperature.value;
    this.steamService.saturatedPropertiesInputs = {
      pressureOrTemperature: this.pressureOrTemperature,
      inputs: {
        saturatedTemperature: form.controls.saturatedTemperature.value,
        saturatedPressure: form.controls.saturatedPressure.value
      }
    }
    if (form.status == 'VALID') {
      this.saturatedPropertiesOutput = this.steamService.saturatedProperties(input, this.pressureOrTemperature, this.settings);
      this.plotReady = true;
    }
  }

  getEmptyResults(): SaturatedPropertiesOutput {
    return {
      saturatedPressure: 0,
      saturatedTemperature: 0,
      liquidEnthalpy: 0,
      gasEnthalpy: 0,
      evaporationEnthalpy: 0,
      liquidEntropy: 0,
      gasEntropy: 0,
      evaporationEntropy: 0,
      liquidVolume: 0,
      gasVolume: 0,
      evaporationVolume: 0
    };
  }

  addRow() {
    this.data = {
      pressure: this.saturatedPropertiesOutput.saturatedPressure,
      temperature: this.saturatedPropertiesOutput.saturatedTemperature,
      satLiquidEnthalpy: this.saturatedPropertiesOutput.liquidEnthalpy,
      evapEnthalpy: this.saturatedPropertiesOutput.evaporationEnthalpy,
      satGasEnthalpy: this.saturatedPropertiesOutput.gasEnthalpy,
      satLiquidEntropy: this.saturatedPropertiesOutput.liquidEntropy,
      evapEntropy: this.saturatedPropertiesOutput.evaporationEntropy,
      satGasEntropy: this.saturatedPropertiesOutput.gasEntropy,
      satLiquidVolume: this.saturatedPropertiesOutput.liquidVolume,
      evapVolume: this.saturatedPropertiesOutput.evaporationVolume,
      satGasVolume: this.saturatedPropertiesOutput.gasVolume
    };
  }

  toggleGraph() {
    this.graphToggle = this.graphToggleForm.controls.graphToggle.value.toString();
  }

  getRanges(): { minTemp: number, maxTemp: number, minPressure: number, maxPressure: number } {
    let minTemp: number, maxTemp: number;
    if (this.settings.steamTemperatureMeasurement == 'F') {
      minTemp = 32;
      maxTemp = 705.1;
    } else {
      minTemp = 0;
      maxTemp = 373.9;
    }
    let minPressure: number = Number(this.convertUnitsService.value(1).from('kPaa').to(this.settings.steamPressureMeasurement).toFixed(3));
    let maxPressure: number = Number(this.convertUnitsService.value(22064).from('kPaa').to(this.settings.steamPressureMeasurement).toFixed(3));
    return { minTemp: minTemp, maxTemp: maxTemp, minPressure: minPressure, maxPressure: maxPressure }
  }
}

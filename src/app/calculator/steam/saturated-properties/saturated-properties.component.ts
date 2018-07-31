import { Component, Input, OnInit, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SettingsService } from "../../../settings/settings.service";
import { Settings } from "../../../shared/models/settings";
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SaturatedPropertiesOutput, SaturatedPropertiesInput } from '../../../shared/models/steam';
import { SteamService } from '../steam.service';

@Component({
  selector: 'app-saturated-properties',
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
  }


  saturatedPropertiesForm: FormGroup;
  saturatedPropertiesOutput: SaturatedPropertiesOutput;
  pressureOrTemperature: number;
  tabSelect: string = 'results';
  currentField: string = 'pressure';

  data: { pressure: number, temperature: number, satLiquidEnthalpy: number, evapEnthalpy: number, satGasEnthalpy: number, satLiquidEntropy: number, evapEntropy: number, satGasEntropy: number, satLiquidVolume: number, evapVolume: number, satGasVolume: number };

  graphToggle: string = '0';
  graphToggleForm: FormGroup;
  plotReady: boolean = false;

  constructor(private formBuilder: FormBuilder, private settingsDbService: SettingsDbService, private changeDetectorRef: ChangeDetectorRef, private steamService: SteamService) { }

  ngOnInit() {
    this.saturatedPropertiesForm = this.formBuilder.group({
      'pressureOrTemperature': [0, Validators.required],
      'saturatedPressure': [0, Validators.required],
      'saturatedTemperature': [0, Validators.required]
    });

    this.graphToggleForm = this.formBuilder.group({
      'graphToggle': [0, Validators.required]
    });

    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }

    this.saturatedPropertiesOutput = {
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

  ngAfterViewInit() {
    setTimeout(() => {
      this.getChartWidth();
      this.getChartHeight();
      this.changeDetectorRef.detectChanges();
    }, 100)
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setField(str: string) {
    this.currentField = str;
  }

  getChartWidth() {
    console.log('get');
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

  setPressureOrTemperature(val: number) {
    this.pressureOrTemperature = val;
    if (val == 1) {
      this.setField('temp');
    }
    else {
      this.setField('pressure');
    }
  }

  calculate(input: SaturatedPropertiesInput) {
    this.saturatedPropertiesOutput = this.steamService.saturatedProperties(input, this.pressureOrTemperature, this.settings);
    this.plotReady = true;
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
}

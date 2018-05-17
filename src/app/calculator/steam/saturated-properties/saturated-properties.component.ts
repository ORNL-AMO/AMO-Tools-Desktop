import { Component, Input, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
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

  saturatedPropertiesForm: FormGroup;
  saturatedPropertiesOutput: SaturatedPropertiesOutput;
  pressureOrTemperature: number;
  tabSelect: string = 'results';
  currentField: string = 'pressure';


  plotReady: boolean = false;

  constructor(private formBuilder: FormBuilder, private settingsDbService: SettingsDbService, private changeDetectorRef: ChangeDetectorRef, private steamService: SteamService) { }

  ngOnInit() {
    this.saturatedPropertiesForm = this.formBuilder.group({
      'pressureOrTemperature': [0, Validators.required],
      'saturatedPressure': [100, Validators.required],
      'saturatedTemperature': [100, Validators.required]
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
    this.changeDetectorRef.detectChanges();
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setField(str: string) {
    this.currentField = str;
  }

  getChartWidth(): number {
    if (this.lineChartContainer) {
      this.chartContainerWidth = this.lineChartContainer.nativeElement.clientWidth * .9;
      return this.chartContainerWidth;
    }
    else {
      return 600;
    }
  }

  getChartHeight(): number {
    if (this.lineChartContainer) {
      this.chartContainerHeight = this.lineChartContainer.nativeElement.clientHeight * .8;
      return this.chartContainerHeight;
    }
    else {
      return 800;
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



}

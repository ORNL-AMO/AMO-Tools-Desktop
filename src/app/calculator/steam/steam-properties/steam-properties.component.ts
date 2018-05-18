import { Component, Input, OnInit, ViewChild, ElementRef, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Settings } from "../../../shared/models/settings";
import { SettingsService } from "../../../settings/settings.service";
import { ConvertUnitsService } from "../../../shared/convert-units/convert-units.service";
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { WindowRefService } from '../../../indexedDb/window-ref.service';
import { SteamPropertiesOutput, SteamPropertiesInput } from '../../../shared/models/steam';
import { SteamService } from '../steam.service';


@Component({
  selector: 'app-steam-properties',
  templateUrl: './steam-properties.component.html',
  styleUrls: ['./steam-properties.component.css']
})
export class SteamPropertiesComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('lineChartContainer') lineChartContainer: ElementRef;
  chartContainerHeight: number;
  chartContainerWidth: number;

  steamPropertiesForm: FormGroup;
  steamPropertiesOutput: SteamPropertiesOutput;
  tabSelect: string = 'results';
  currentField: string = 'pressure';

  plotReady: boolean = false;

  constructor(private formBuilder: FormBuilder, private settingsDbService: SettingsDbService, private changeDetectorRef: ChangeDetectorRef, private steamService: SteamService) { }

  ngOnInit() {
    this.steamPropertiesForm = this.formBuilder.group({
      'pressure': [100, Validators.required],
      'thermodynamicQuantity': [0, Validators.required],
      'quantityValue': [100, Validators.required]
    });

    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }

    this.steamPropertiesOutput = {
      pressure: 0, temperature: 0, quality: 0, specificEnthalpy: 0, specificEntropy: 0, specificVolume: 0
    };
  }

  ngAfterViewInit() {
    this.changeDetectorRef.detectChanges();
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setField(str: string) {
    console.log('setField = ' + str);
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


  calculate(input: SteamPropertiesInput) {
    console.log('calculate()');
    this.steamPropertiesOutput = this.steamService.steamProperties(input, this.settings);
    this.plotReady = true;
  }
}

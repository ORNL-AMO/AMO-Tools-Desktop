import { Component, Input, OnInit, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Settings } from "../../../shared/models/settings";
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
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

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getChartHeight();
    this.getChartWidth();
  }

  @ViewChild('lineChartContainer') lineChartContainer: ElementRef;
  chartContainerHeight: number;
  chartContainerWidth: number;

  steamPropertiesForm: FormGroup;
  steamPropertiesOutput: SteamPropertiesOutput;
  tabSelect: string = 'results';
  currentField: string = 'pressure';
  graphToggle: string = '0';
  graphToggleForm: FormGroup;
  data: { pressure: number, thermodynamicQuantity: number, temperature: number, enthalpy: number, entropy: number, volume: number };

  plotReady: boolean = false;
  ranges: { minPressure: number, maxPressure: number, minQuantityValue: number, maxQuantityValue: number }
  constructor(private formBuilder: FormBuilder, private settingsDbService: SettingsDbService, private changeDetectorRef: ChangeDetectorRef, private steamService: SteamService) { }

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
    this.steamPropertiesOutput = this.getEmptyResults();
    this.getForm(0);
    this.calculate(this.steamPropertiesForm);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getChartWidth();
      this.getChartHeight();
      this.changeDetectorRef.detectChanges();
    }, 100)
  }

  getForm(quantityValue: number) {
    this.ranges = this.getRanges(quantityValue);
    this.steamPropertiesForm = this.formBuilder.group({
      'pressure': ['', [Validators.required, Validators.min(this.ranges.minPressure), Validators.max(this.ranges.maxPressure)]],
      'thermodynamicQuantity': [quantityValue, Validators.required],
      'quantityValue': ['', [Validators.required, Validators.min(this.ranges.minQuantityValue), Validators.max(this.ranges.maxQuantityValue)]]
    });
  }

  updateForm(quantityValue: number) {
    this.ranges = this.getRanges(quantityValue);
    this.steamPropertiesForm.controls.quantityValue.setValidators([Validators.required, Validators.min(this.ranges.minQuantityValue), Validators.max(this.ranges.maxQuantityValue)])
  }

  setTab(str: string) {
    this.tabSelect = str;
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
      this.chartContainerHeight = this.lineChartContainer.nativeElement.clientHeight * .8;
    }
    else {
      this.chartContainerHeight = 800;
    }
  }

  calculate(form: FormGroup) {
    let input: SteamPropertiesInput = {
      quantityValue: form.controls.quantityValue.value,
      thermodynamicQuantity: form.controls.thermodynamicQuantity.value,
      pressure: form.controls.pressure.value
    }
    if (form.status == 'VALID') {
      this.steamPropertiesOutput = this.steamService.steamProperties(input, this.settings);
      this.plotReady = true;
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
    }
  }

  addRow() {
    this.data = {
      pressure: this.steamPropertiesOutput.pressure,
      thermodynamicQuantity: this.steamPropertiesForm.controls.thermodynamicQuantity.value,
      temperature: this.steamPropertiesOutput.temperature,
      enthalpy: this.steamPropertiesOutput.specificEnthalpy,
      entropy: this.steamPropertiesOutput.specificEntropy,
      volume: this.steamPropertiesOutput.specificVolume
    };
  }

  toggleGraph() {
    this.graphToggle = this.graphToggleForm.controls.graphToggle.value.toString();
  }

  getRanges(quantityValue: number): { minPressure: number, maxPressure: number, minQuantityValue: number, maxQuantityValue: number } {
    let minPressure: number, maxPressure: number;
    let quantityRanges: { min: number, max: number } = this.steamService.getQuantityRange(this.settings, quantityValue);
    if (this.settings.steamPressureMeasurement == 'psi') {
      minPressure = 0.2;
      maxPressure = 14503.7;
    } else if (this.settings.steamPressureMeasurement == 'kPa') {
      minPressure = 1;
      maxPressure = 100000;
    } else if (this.settings.steamPressureMeasurement == 'bar') {
      minPressure = 0.01;
      maxPressure = 1000;
    }
    return { minQuantityValue: quantityRanges.min, maxQuantityValue: quantityRanges.max, minPressure: minPressure, maxPressure: maxPressure }
  }
}

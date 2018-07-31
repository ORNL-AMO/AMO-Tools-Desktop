import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';


@Component({
  selector: 'app-nema-energy-efficiency',
  templateUrl: './nema-energy-efficiency.component.html',
  styleUrls: ['./nema-energy-efficiency.component.css']
})
export class NemaEnergyEfficiencyComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  currentField: string;
  nemaForm: FormGroup;
  tabSelect: string = 'results';
  constructor(private psatService: PsatService, private settingsDbService: SettingsDbService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    if (!this.psat) {
      this.nemaForm = this.formBuilder.group({
        frequency: ['50 Hz', [Validators.required]],
        horsePower: ['200', [Validators.required]],
        efficiencyClass: ['Standard Efficiency', [Validators.required]],
        motorRPM: [1200, [Validators.required]],
        efficiency: ['', [Validators.min(1), Validators.max(100)]]
      })
    } else {
      let lineFreq: string = this.psatService.getLineFreqFromEnum(this.psat.inputs.line_frequency);
      let efficiency: string = this.psatService.getEfficiencyClassFromEnum(this.psat.inputs.efficiency_class);
      this.nemaForm = this.formBuilder.group({
        frequency: [lineFreq, [Validators.required]],
        horsePower: [this.psat.inputs.motor_rated_power.toString(), [Validators.required]],
        efficiencyClass: [efficiency, [Validators.required]],
        motorRPM: [this.psat.inputs.motor_rated_speed, [Validators.required]],
        efficiency: [this.psat.inputs.efficiency, [Validators.min(1), Validators.max(100)]]
      })
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
      if (this.settings.powerMeasurement != 'hp') {
        this.nemaForm.patchValue({
          horsePower: 150
        })
      }
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
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
}

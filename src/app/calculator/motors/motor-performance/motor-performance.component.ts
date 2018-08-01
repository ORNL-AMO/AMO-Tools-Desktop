import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';

@Component({
  selector: 'app-motor-performance',
  templateUrl: './motor-performance.component.html',
  styleUrls: ['./motor-performance.component.css']
})
export class MotorPerformanceComponent implements OnInit {
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
  performanceForm: FormGroup;

  toggleCalculate: boolean = false;
  tabSelect: string = 'results';
  constructor(private psatService: PsatService, private settingsDbService: SettingsDbService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.getForm();

    //use system settings for standalone calculator
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
      if (this.settings.powerMeasurement != 'hp') {
        this.performanceForm.patchValue({
          horsePower: '150'
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

  calculate() {
    this.toggleCalculate = !this.toggleCalculate;
  }
  setTab(str: string) {
    this.tabSelect = str;
  }
  changeField(str: string) {
    this.currentField = str;
  }


  getForm(){
    if (!this.psat) {
      this.performanceForm = this.formBuilder.group({
        frequency: [this.psatService.getLineFreqFromEnum(0), [Validators.required]],
        horsePower: ['200', [Validators.required]],
        motorRPM: [1780, [Validators.required]],
        efficiencyClass: [this.psatService.getEfficiencyClassFromEnum(1), [Validators.required]],
        motorVoltage: [460, [Validators.required]],
        fullLoadAmps: [225.4, [Validators.required]],
        sizeMargin: [1, [Validators.required]],
        efficiency: [0, [Validators.min(0), Validators.max(100)]]
      });
    } else {
      this.performanceForm = this.formBuilder.group({
        frequency: [this.psatService.getLineFreqFromEnum(this.psat.inputs.line_frequency), [Validators.required]],
        horsePower: [this.psat.inputs.motor_rated_power.toString(), [Validators.required]],
        motorRPM: [this.psat.inputs.motor_rated_speed, [Validators.required]],
        efficiencyClass: [this.psatService.getEfficiencyClassFromEnum(this.psat.inputs.efficiency_class), [Validators.required]],
        motorVoltage: [this.psat.inputs.motor_rated_voltage, [Validators.required]],
        fullLoadAmps: [this.psat.inputs.motor_rated_fla, [Validators.required]],
        sizeMargin: [this.psat.inputs.margin, [Validators.required]],
        efficiency: [this.psat.inputs.efficiency, [Validators.min(0), Validators.max(100)]]
      });
    }

  }
}

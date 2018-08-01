import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup, FormBuilder } from '@angular/forms';
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
        frequency: this.psatService.getLineFreqFromEnum(0),
        horsePower: '200',
        motorRPM: 1780,
        efficiencyClass: this.psatService.getEfficiencyClassFromEnum(1),
        motorVoltage: 460,
        fullLoadAmps: 225.4,
        sizeMargin: 1
      });
    } else {
      this.performanceForm = this.psatService.getFormFromPsat(this.psat.inputs);
      this.performanceForm = this.formBuilder.group({
        frequency: this.psatService.getLineFreqFromEnum(this.psat.inputs.line_frequency),
        horsePower: this.psat.inputs.motor_rated_power.toString(),
        motorRPM: this.psat.inputs.motor_rated_speed,
        efficiencyClass: this.psatService.getEfficiencyClassFromEnum(this.psat.inputs.efficiency_class),
        motorVoltage: this.psat.inputs.motor_rated_voltage,
        fullLoadAmps: this.psat.inputs.motor_rated_fla,
        sizeMargin: this.psat.inputs.margin
      });
    }

  }
}

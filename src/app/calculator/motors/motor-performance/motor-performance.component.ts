import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { MotorPerformanceService } from './motor-performance.service';

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
  constructor(private settingsDbService: SettingsDbService, private motorPerformanceService: MotorPerformanceService) { }

  ngOnInit() {
    this.initForm();
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
    if (!this.psat) {
      this.motorPerformanceService.motorPerformanceInputs = this.motorPerformanceService.getObjFromForm(this.performanceForm);
      console.log(this.motorPerformanceService.motorPerformanceInputs);
    }
    this.toggleCalculate = !this.toggleCalculate;
  }
  setTab(str: string) {
    this.tabSelect = str;
  }
  changeField(str: string) {
    this.currentField = str;
  }


  initForm() {
    if (this.psat) {
      this.performanceForm = this.motorPerformanceService.initFormFromPsat(this.psat);
    } else if (this.motorPerformanceService.motorPerformanceInputs) {
      this.performanceForm = this.motorPerformanceService.initFormFromObj(this.motorPerformanceService.motorPerformanceInputs);
    } else {
      this.performanceForm = this.motorPerformanceService.initForm();
    }

  }
}

import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FormBuilder, Validators } from "@angular/forms";
import { FormGroup } from '@angular/forms';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';

@Component({
  selector: 'app-percent-load-estimation',
  templateUrl: './percent-load-estimation.component.html',
  styleUrls: ['./percent-load-estimation.component.css']
})
export class PercentLoadEstimationComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  loadEstimationResult: number;
  percentLoadEstimationForm: FormGroup;
  tabSelect: string = 'results';
  toggleCalculate = false;
  loadEstimationMethod: number = 0;
  percentLoadEstimation: number;

  slipMethodData: SlipMethod = {
    synchronousSpeed: 0,
    measuredSpeed: 0,
    nameplateFullLoadSpeed: 0
  }

  constructor(private formBuilder: FormBuilder, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    if (!this.percentLoadEstimationForm) {
      this.percentLoadEstimationForm = this.formBuilder.group({
        // 'lineFrequency': [50, ],
        'lineFrequency': [60,],
        'measuredSpeed': ['', Validators.required],
        'nameplateFullLoadSpeed': ['', Validators.required],
        'synchronousSpeed': ['',],
        'loadEstimation': ['',]
      });
    }

    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
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

  calculate() {
    this.percentLoadEstimation = ((this.percentLoadEstimationForm.controls.synchronousSpeed.value - this.percentLoadEstimationForm.controls.measuredSpeed.value)
      / (this.percentLoadEstimationForm.controls.synchronousSpeed.value - this.percentLoadEstimationForm.controls.nameplateFullLoadSpeed.value)) * 100;
  }

  calculateSlipMethod(data: SlipMethod){
    this.percentLoadEstimation = ((data.synchronousSpeed - data.measuredSpeed)
      / (data.synchronousSpeed - data.nameplateFullLoadSpeed)) * 100;
  }

}


export interface SlipMethod {
  synchronousSpeed: number,
  measuredSpeed: number,
  nameplateFullLoadSpeed: number
}
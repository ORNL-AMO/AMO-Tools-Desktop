import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FSAT } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { FsatService } from '../../../fsat/fsat.service';

@Component({
  selector: 'app-fan-efficiency',
  templateUrl: './fan-efficiency.component.html',
  styleUrls: ['./fan-efficiency.component.css']
})
export class FanEfficiencyComponent implements OnInit {
  @Input()
  fsat: FSAT;
  @Input()
  settings: Settings;
  @Input()
  inAssessment: boolean;

  inputs: FanEfficiencyInputs = {
    fanType: undefined,
    fanSpeed: undefined,
    flowRate: undefined,
    inletPressure: undefined,
    outletPressure: undefined,
    compressibility: undefined
  };

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  toggleCalculate: boolean = true;
  tabSelect: string = 'results';
  fanEfficiency: number = 0;
  constructor(private fsatService: FsatService, private settingsDbService: SettingsDbService) { }
  ngOnInit() {
    if (this.inAssessment && this.fsat && this.fsat.fanSetup.fanType != 12) {
      this.inputs.fanType = this.fsat.fanSetup.fanType;
      this.inputs.fanSpeed = this.fsat.fanSetup.fanSpeed;
      this.inputs.flowRate = this.fsat.fieldData.flowRate;
      this.inputs.inletPressure = this.fsat.fieldData.inletPressure;
      this.inputs.outletPressure = this.fsat.fieldData.outletPressure;
      this.inputs.compressibility = this.fsat.fieldData.compressibilityFactor;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    this.calculate();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      if (this.leftPanelHeader.nativeElement.clientHeight) {
        this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      }
    }
  }

  calculate() {
    if (this.checkInputs() == 'VALID') {
      this.fanEfficiency = this.fsatService.optimalFanEfficiency(this.inputs, this.settings);
    } else {
      this.fanEfficiency = 0;
    }

    this.toggleCalculate = !this.toggleCalculate;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField() {

  }

  checkInputs() {
    if (this.inputs.fanType != undefined &&
      this.inputs.fanSpeed != undefined &&
      this.inputs.flowRate != undefined &&
      this.inputs.inletPressure != undefined &&
      this.inputs.outletPressure != undefined &&
      this.inputs.compressibility != undefined
    ) {
      return 'VALID';
    } else {
      return 'INVALID';
    }
  }
}

export interface FanEfficiencyInputs {
  fanType: number,
  fanSpeed: number,
  flowRate: number,
  inletPressure: number,
  outletPressure: number,
  compressibility: number
}
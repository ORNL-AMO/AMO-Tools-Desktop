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

  inputs: FanEfficiencyInputs = {
    fanType: 1,
    fanSpeed: 1,
    flowRate: 1,
    inletPressure: 1,
    outletPressure: 1,
    compressibility: 1
  };

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  // @HostListener('window:resize', ['$event'])
  // onResize(event) {
  //   this.resizeTabs();
  // }

  headerHeight: number;

  toggleCalculate: boolean = true;
  tabSelect: string = 'results';
  fanEfficiency: number = 0;
  constructor(private fsatService: FsatService, private settingsDbService: SettingsDbService, private convertUnitsService: ConvertUnitsService) { }
  ngOnInit() {
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
    if (this.leftPanelHeader) {
      if (this.leftPanelHeader.nativeElement.clientHeight) {
        this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      }
    }
  }

  calculate() {
    console.log(this.inputs);
    this.fanEfficiency = this.fsatService.optimalFanEfficiency(this.inputs);
    this.toggleCalculate = !this.toggleCalculate;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(){

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
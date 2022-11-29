import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, EventEmitter } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { UntypedFormGroup } from '@angular/forms';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AchievableEfficiencyService } from './achievable-efficiency.service';
@Component({
  selector: 'app-achievable-efficiency',
  templateUrl: './achievable-efficiency.component.html',
  styleUrls: ['./achievable-efficiency.component.css']
})
export class AchievableEfficiencyComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  headerHeight: number;

  currentField:string;
  efficiencyForm: UntypedFormGroup;
  toggleCalculate: boolean = true;
  toggleResetData: boolean = true;
  toggleExampleData: boolean = true;
  tabSelect: string = 'results';
  
  containerHeight: number;
  smallScreenTab: string = 'form';

  constructor(private achievableEfficiencyService: AchievableEfficiencyService, private psatService: PsatService, private settingsDbService: SettingsDbService, private convertUnitsService: ConvertUnitsService) { }
  ngOnInit() {
    //if stand alone calculator use system settings
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.initForm();
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

  ngOnDestroy() {
    if (!this.psat) {
      this.achievableEfficiencyService.flowRate = this.efficiencyForm.controls.flowRate.value;
      this.achievableEfficiencyService.pumpType = this.efficiencyForm.controls.pumpType.value;
    }
  }

  initForm() {
    if (!this.psat) {
      //patch default/starter values for stand alone calculator
      if (this.achievableEfficiencyService.flowRate && this.achievableEfficiencyService.pumpType) {
        this.efficiencyForm = this.achievableEfficiencyService.getForm(this.achievableEfficiencyService.pumpType, this.achievableEfficiencyService.flowRate);
      }
      else {
        let tmpFlowRate: number = 2000;
        if (this.settings.flowMeasurement !== 'gpm') {
          tmpFlowRate = this.convertUnitsService.value(tmpFlowRate).from('gpm').to(this.settings.flowMeasurement);
          tmpFlowRate = this.psatService.roundVal(tmpFlowRate, 2);
        }
        this.efficiencyForm = this.achievableEfficiencyService.getForm(6, tmpFlowRate);
      }
    } else {
      this.efficiencyForm = this.achievableEfficiencyService.getForm(this.psat.inputs.pump_style, this.psat.inputs.flow_rate);
    }
  }

  resetForm() {
    if (!this.psat) {
      //patch default/starter values for stand alone calculator
      if (this.achievableEfficiencyService.flowRate && this.achievableEfficiencyService.pumpType) {
        this.efficiencyForm = this.achievableEfficiencyService.getForm(this.achievableEfficiencyService.pumpType, this.achievableEfficiencyService.flowRate);
      }
      else {
        let tmpFlowRate: number = 0;
        if (this.settings.flowMeasurement !== 'gpm') {
          tmpFlowRate = this.convertUnitsService.value(tmpFlowRate).from('gpm').to(this.settings.flowMeasurement);
          tmpFlowRate = this.psatService.roundVal(tmpFlowRate, 2);
        }
        this.efficiencyForm = this.achievableEfficiencyService.getForm(0, tmpFlowRate);
      }
    } else {
      this.efficiencyForm = this.achievableEfficiencyService.getForm(this.psat.inputs.pump_style, this.psat.inputs.flow_rate);
    }
  }

  resizeTabs() {
    if (this.leftPanelHeader && this.contentContainer) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.headerHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
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

  btnResetData() {
    this.resetForm();
    this.toggleResetData = !this.toggleResetData;
    this.calculate();
  }

  generateExample() {
    let tmpFlowRate = 2000;
    if (this.settings.flowMeasurement !== 'gpm') {
      tmpFlowRate = Math.round(this.convertUnitsService.value(tmpFlowRate).from('gpm').to(this.settings.flowMeasurement) * 100) / 100;
    }
    this.efficiencyForm = this.achievableEfficiencyService.getForm(0, tmpFlowRate);
  }

  btnGenerateExample() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.generateExample();
    this.toggleExampleData = !this.toggleExampleData;
    this.calculate();
  }
  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}

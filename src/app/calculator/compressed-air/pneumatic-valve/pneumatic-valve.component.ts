import { Component, OnInit, ElementRef, ViewChild, HostListener, Input } from '@angular/core';
import { StandaloneService } from '../../standalone.service';
import { PneumaticValveCvInput, PneumaticValveCvOutput, PneumaticValveFlowRateInput, PneumaticValveFlowRateOutput } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';
import { PneumaticValveService } from './pneumatic-valve.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-pneumatic-valve',
    templateUrl: './pneumatic-valve.component.html',
    styleUrls: ['./pneumatic-valve.component.css'],
    standalone: false
})
export class PneumaticValveComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  smallScreenTab: string = 'form';
  containerHeight: number;
  headerHeight: number;

  calcMode: string = 'flow-rate';
  flowRateInputs: PneumaticValveFlowRateInput;
  flowRateOutput: PneumaticValveFlowRateOutput;
  cvInputs: PneumaticValveCvInput;
  cvOutput: PneumaticValveCvOutput;
  currentField: string = 'default';
  docsLink: string = environment.measurDocsUrl;

  constructor(
    private standaloneService: StandaloneService,
    private pneumaticValveService: PneumaticValveService,
    private settingsDbService: SettingsDbService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-CA-pneumatic-valve');
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.flowRateInputs = this.pneumaticValveService.flowRateInputs;
    this.cvInputs = this.pneumaticValveService.cvInputs;
    this.calculate();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.pneumaticValveService.flowRateInputs = this.flowRateInputs;
    this.pneumaticValveService.cvInputs = this.cvInputs;
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  calculate() {
    if (this.calcMode === 'flow-rate') {
      this.flowRateOutput = this.standaloneService.pneumaticValveCalculateFlowRate(this.flowRateInputs, this.settings);
    } else {
      this.cvOutput = this.standaloneService.pneumaticValveCv(this.cvInputs, this.settings);
    }
  }

  setCalcMode(mode: string) {
    this.calcMode = mode;
    this.calculate();
  }

  setField(str: string) {
    this.currentField = str;
  }

  btnResetData() {
    if (this.calcMode === 'flow-rate') {
      this.flowRateInputs = this.pneumaticValveService.getDefaultFlowRateData();
    } else {
      this.cvInputs = this.pneumaticValveService.getDefaultCvData();
    }
    this.calculate();
  }

  btnGenerateExample() {
    if (this.calcMode === 'flow-rate') {
      this.flowRateInputs = this.pneumaticValveService.convertFlowRateExample(
        this.pneumaticValveService.getExampleFlowRateData(), this.settings
      );
    } else {
      this.cvInputs = this.pneumaticValveService.convertCvExample(
        this.pneumaticValveService.getExampleCvData(), this.settings
      );
    }
    this.calculate();
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}

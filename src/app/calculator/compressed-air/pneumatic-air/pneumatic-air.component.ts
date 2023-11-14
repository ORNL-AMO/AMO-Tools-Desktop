import { Component, OnInit, ElementRef, ViewChild, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { PneumaticAirRequirementInput, PneumaticAirRequirementOutput } from "../../../shared/models/standalone";
import { Settings } from '../../../shared/models/settings';
import { PneumaticAirService } from './pneumatic-air.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-pneumatic-air',
  templateUrl: './pneumatic-air.component.html',
  styleUrls: ['./pneumatic-air.component.css']
})
export class PneumaticAirComponent implements OnInit {
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

  inputs: PneumaticAirRequirementInput;
  outputs: PneumaticAirRequirementOutput;
  currentField: string = 'default';
  constructor(private standaloneService: StandaloneService, private pneumaticAirService: PneumaticAirService, private settingsDbService: SettingsDbService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-CA-pneumatic-air');
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.inputs = this.pneumaticAirService.inputs;
    this.calculatePneumaticAirRequirement(this.inputs);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.pneumaticAirService.inputs = this.inputs;
  }

  btnResetData() {
    this.inputs = this.pneumaticAirService.getDefaultData();
    this.calculatePneumaticAirRequirement(this.inputs);
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

  calculatePneumaticAirRequirement(inputs: PneumaticAirRequirementInput) {
    this.outputs = this.standaloneService.pneumaticAirRequirement(inputs, this.settings);
  }

  setField(str: string) {
    this.currentField = str;
  }

  btnGenerateExample() {
    let tempInputs: PneumaticAirRequirementInput = this.pneumaticAirService.getExampleData();
    this.inputs = this.pneumaticAirService.convertPneumaticCylinderAirExample(tempInputs, this.settings);
    this.calculatePneumaticAirRequirement(this.inputs);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}

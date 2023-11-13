import { Component, OnInit, ViewChild, ElementRef, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { OperatingCostInput, OperatingCostOutput } from "../../../shared/models/standalone";
import { Settings } from '../../../shared/models/settings';
import { OperatingCostService } from './operating-cost.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-operating-cost',
  templateUrl: './operating-cost.component.html',
  styleUrls: ['./operating-cost.component.css']
})
export class OperatingCostComponent implements OnInit {
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

  headerHeight: number;
  smallScreenTab: string = 'form';
  containerHeight: number;

  inputs: OperatingCostInput;
  outputs: OperatingCostOutput;
  currentField: string = 'default';
  constructor(private standaloneService: StandaloneService, private operatingCostService: OperatingCostService, private settingsDbService: SettingsDbService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-operating-cost');
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.inputs = this.operatingCostService.input;
    this.calculateOperationCost(this.inputs);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.operatingCostService.input = this.inputs;
  }

  btnResetData() {
    this.inputs = this.operatingCostService.getDefaultData();
    this.operatingCostService.operatingHours = undefined;
    this.calculateOperationCost(this.inputs);
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

  calculateOperationCost(inputs: OperatingCostInput) {
    this.outputs = this.standaloneService.operatingCost(inputs, this.settings);
  }

  setField(str: string) {
    this.currentField = str;
  }

  btnGenerateExample() {
    let tempInputs: OperatingCostInput = this.operatingCostService.getExampleData();
    this.inputs = this.operatingCostService.convertOperatingCostExample(tempInputs, this.settings);
    this.calculateOperationCost(this.inputs)
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

}

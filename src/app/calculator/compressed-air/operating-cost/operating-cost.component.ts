import { Component, OnInit, ViewChild, ElementRef, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { OperatingCostInput, OperatingCostOutput } from "../../../shared/models/standalone";
import { CompressedAirService } from '../compressed-air.service';
import { Settings } from '../../../shared/models/settings';
import { OperatingCostService } from './operating-cost.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';

@Component({
  selector: 'app-operating-cost',
  templateUrl: './operating-cost.component.html',
  styleUrls: ['./operating-cost.component.css']
})
export class OperatingCostComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  inputs: OperatingCostInput;
  outputs: OperatingCostOutput;
  currentField: string = 'default';
  constructor(private standaloneService: StandaloneService, private operatingCostService: OperatingCostService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
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
}

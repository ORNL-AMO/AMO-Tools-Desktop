import { Component, OnInit, ViewChild, ElementRef, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { OperatingCostInput, OperatingCostOutput } from "../../../shared/models/standalone";
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-operating-cost',
  templateUrl: './operating-cost.component.html',
  styleUrls: ['./operating-cost.component.css']
})
export class OperatingCostComponent implements OnInit {
  @Input()
  settings: Settings;
  
  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  inputs: OperatingCostInput;
  outputs: OperatingCostOutput;
  isLoad: boolean;
  currentField: string = 'default';
  constructor() { }

  ngOnInit() {
    this.inputs = {
      motorBhp: 0,
      bhpUnloaded: 0,
      annualOperatingHours: 0,
      runTimeLoaded: 0,
      runTimeUnloaded: 0,
      efficiencyLoaded: 0,
      efficiencyUnloaded: 0,
      costOfElectricity: 0,

    };

    this.outputs = {
      runTimeUnloaded: 0,
      costForLoaded: 0,
      costForUnloaded: 0,
      totalAnnualCost: 0,
    };
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
  calculateOperationCost(inputs: OperatingCostInput) {
    this.outputs = StandaloneService.operatingCost(inputs);
  }

  setField(str: string) {
    this.currentField = str;
  }
}

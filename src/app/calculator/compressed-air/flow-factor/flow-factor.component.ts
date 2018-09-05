import { Component, OnInit, ElementRef, ViewChild, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { PneumaticValve } from "../../../shared/models/standalone";
import { CompressedAirService } from '../compressed-air.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-flow-factor',
  templateUrl: './flow-factor.component.html',
  styleUrls: ['./flow-factor.component.css']
})
export class FlowFactorComponent implements OnInit {
  @Input()
  settings: Settings;
  
  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  headerHeight: number;

  inputs: PneumaticValve;
  valveFlowFactor: number = 0;
  userFlowRate: boolean = false;
  currentField: string = 'default';
  constructor(private compressedAirService: CompressedAirService) { }

  ngOnInit() {
    this.inputs = this.compressedAirService.pnuematicValveInputs;
    this.getValveFlowFactor();
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
  setUserFlowRate(bool: boolean) {
    this.userFlowRate = bool;
  }
  getFlowRate() {
    this.inputs.flowRate = StandaloneService.pneumaticValveCalculateFlowRate(this.inputs.inletPressure, this.inputs.outletPressure);
  }

  getValveFlowFactor() {
    if (!this.userFlowRate) {
      this.getFlowRate();
    }
    let val: number = StandaloneService.pneumaticValve(this.inputs);
    if (isNaN(val) == false) {
      this.valveFlowFactor = val;
    } else {
      this.valveFlowFactor = 0;
    }
  }

  changeField(str: string) {
    this.currentField = str;
  }

}

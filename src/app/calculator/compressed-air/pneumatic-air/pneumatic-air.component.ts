import { Component, OnInit, ElementRef, ViewChild, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { PneumaticAirRequirementInput, PneumaticAirRequirementOutput } from "../../../shared/models/standalone";
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-pneumatic-air',
  templateUrl: './pneumatic-air.component.html',
  styleUrls: ['./pneumatic-air.component.css']
})
export class PneumaticAirComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  inputs: PneumaticAirRequirementInput;
  outputs: PneumaticAirRequirementOutput;
  currentField: string = 'default';
  constructor() { }

  ngOnInit() {
    this.inputs = {
      pistonType: 0,
      cylinderDiameter: 0,
      cylinderStroke: 0,
      pistonRodDiameter: 0,
      airPressure: 0,
      cyclesPerMinute: 0
    };

    this.outputs = {
      airRequirementPneumaticCylinder: 0,
      volumeAirIntakePiston: 0,
      compressionRatio: 0
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
  calculatePneumaticAirRequirement(inputs: PneumaticAirRequirementInput) {
    this.outputs = StandaloneService.pneumaticAirRequirement(inputs);
  }


  setField(str: string) {
    this.currentField = str;
  }
}

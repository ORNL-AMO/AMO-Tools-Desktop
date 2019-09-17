import { Component, OnInit, ElementRef, ViewChild, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { PneumaticAirRequirementInput, PneumaticAirRequirementOutput } from "../../../shared/models/standalone";
import { CompressedAirService } from '../compressed-air.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-pneumatic-air',
  templateUrl: './pneumatic-air.component.html',
  styleUrls: ['./pneumatic-air.component.css']
})
export class PneumaticAirComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  inputs: PneumaticAirRequirementInput;
  outputs: PneumaticAirRequirementOutput;
  currentField: string = 'default';
  constructor(private compressedAirService: CompressedAirService, private standaloneService: StandaloneService) { }

  ngOnInit() {
    this.inputs = this.compressedAirService.pneumaticAirinputs;
    this.calculatePneumaticAirRequirement(this.inputs);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  btnResetData() {
    this.inputs = {
      pistonType: 0,
      cylinderDiameter: 0,
      cylinderStroke: 0,
      pistonRodDiameter: 0,
      airPressure: 0,
      cyclesPerMinute: 0
    };
    this.calculatePneumaticAirRequirement(this.inputs);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }
  calculatePneumaticAirRequirement(inputs: PneumaticAirRequirementInput) {
    this.outputs = this.standaloneService.pneumaticAirRequirement(inputs, this.settings);
  }


  setField(str: string) {
    this.currentField = str;
  }

  btnGenerateExample() {
    let tempInputs = {
      pistonType: 0,
      cylinderDiameter: 2.25,
      cylinderStroke: 8,
      pistonRodDiameter: 1,
      airPressure: 90,
      cyclesPerMinute: 16
    };
    this.inputs = this.compressedAirService.convertPneumaticCylinderAirExample(tempInputs, this.settings);
    this.calculatePneumaticAirRequirement(this.inputs);
  }
}

import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import {StandaloneService} from "../../standalone.service";
import {  PneumaticAirRequirementInput, PneumaticAirRequirementOutput} from "../../../shared/models/standalone";
import { CompressedAirService } from '../compressed-air.service';

@Component({
  selector: 'app-pneumatic-air',
  templateUrl: './pneumatic-air.component.html',
  styleUrls: ['./pneumatic-air.component.css']
})
export class PneumaticAirComponent implements OnInit {
  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  inputs: PneumaticAirRequirementInput;
  outputs: PneumaticAirRequirementOutput;
  currentField: string = 'default';
  constructor(private compressedAirService: CompressedAirService) { }

  ngOnInit() {
    this.inputs = this.compressedAirService.pneumaticAirinputs;
    this.calculatePneumaticAirRequirement(this.inputs);
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


  setField(str: string){
    this.currentField = str;
  }
}

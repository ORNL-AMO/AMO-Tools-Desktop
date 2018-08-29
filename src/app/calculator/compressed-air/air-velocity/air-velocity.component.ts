import { Component, OnInit, ElementRef, HostListener, ViewChild } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { AirVelocityInput, PipeSizes } from "../../../shared/models/standalone";
import { CompressedAirService } from '../compressed-air.service';

@Component({
  selector: 'app-air-velocity',
  templateUrl: './air-velocity.component.html',
  styleUrls: ['./air-velocity.component.css']
})
export class AirVelocityComponent implements OnInit {
  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;


  inputs: AirVelocityInput;
  outputs: PipeSizes;
  currentField: string = 'default';
  constructor(private compressedAirService: CompressedAirService) { }

  ngOnInit() {
    this.inputs = this.compressedAirService.airVelocityInputs;    
    this.getAirVelocity(this.inputs);
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
  getAirVelocity (inputs: AirVelocityInput) {
    this.outputs = StandaloneService.airVelocity(inputs);
  }

  setField(str: string){
    this.currentField = str;
  }
}

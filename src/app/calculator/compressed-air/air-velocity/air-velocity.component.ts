import { Component, OnInit, ElementRef, HostListener, ViewChild } from '@angular/core';
import {StandaloneService} from "../../standalone.service";
import {AirVelocityInput, PipeSizes} from "../../../shared/models/standalone";

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
  constructor() { }

  ngOnInit() {
    this.inputs = {
      airFlow: 0,
      pipePressure: 0,
      atmosphericPressure: 0,
    };
    this.outputs = {
      oneHalf: 0,
      threeFourths: 0,
      one: 0,
      oneAndOneFourth: 0,
      oneAndOneHalf: 0,
      two: 0,
      twoAndOneHalf: 0,
      three: 0,
      threeAndOneHalf: 0,
      four: 0,
      five: 0,
      six: 0,
    };
    // this.getAirVelocity();
    // console.log(this.airVelocityOutput);
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

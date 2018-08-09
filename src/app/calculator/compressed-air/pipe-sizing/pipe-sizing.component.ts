import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { PipeSizingInput, PipeSizingOutput } from "../../../shared/models/standalone";

@Component({
  selector: 'app-pipe-sizing',
  templateUrl: './pipe-sizing.component.html',
  styleUrls: ['./pipe-sizing.component.css']
})
export class PipeSizingComponent implements OnInit {

  
  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  inputs: PipeSizingInput;
  outputs: PipeSizingOutput;
  currentField: string = 'default';
  constructor() {
  }

  ngOnInit() {
    this.inputs = {
      airFlow: 0,
      airlinePressure: 0,
      designVelocity: 20,
      atmosphericPressure: 14.7
    };

    this.outputs = {
      crossSectionalArea: 0,
      pipeDiameter: 0
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

  calculatePipeSize(inputs: PipeSizingInput) {
    this.outputs = StandaloneService.pipeSizing(inputs);
  }

  setField(str: string) {
    this.currentField = str;
  }
}

import { Component, OnInit, ElementRef, HostListener, ViewChild, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { AirVelocityInput, PipeSizes } from "../../../shared/models/standalone";
import { CompressedAirService } from '../compressed-air.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-air-velocity',
  templateUrl: './air-velocity.component.html',
  styleUrls: ['./air-velocity.component.css']
})
export class AirVelocityComponent implements OnInit {
  @Input()
  settings: Settings;
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;


  inputs: AirVelocityInput;
  outputs: PipeSizes;
  currentField: string = 'default';
  constructor(private compressedAirService: CompressedAirService, private standaloneService: StandaloneService) { }

  ngOnInit() {
    this.inputs = this.compressedAirService.airVelocityInputs;    
    this.getAirVelocity(this.inputs);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  btnResetData() {
    this.inputs = {
      airFlow: 0,
      pipePressure: 0,
      atmosphericPressure: 0,
    };
    this.compressedAirService.airVelocityInputs = this.inputs;
    this.getAirVelocity(this.inputs);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }
  getAirVelocity (inputs: AirVelocityInput) {
    this.outputs = this.standaloneService.airVelocity(inputs, this.settings);
  }

  setField(str: string) {
    this.currentField = str;
  }
}

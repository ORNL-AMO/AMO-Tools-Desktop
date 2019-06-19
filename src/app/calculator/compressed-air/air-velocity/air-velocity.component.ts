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

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

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

  //provide functionality to "Generate Example" button,
  //reset data function should have most of the structure already
  btnGenerateExample() {
    //each calculator will have some form of an input object, assign default values from pdf
    this.inputs = {
      airFlow: 1800,
      pipePressure: 100,
      atmosphericPressure: 14.7
    };
    //need to handle conversion if unit of measurement is set to Metric
    this.inputs = this.compressedAirService.convertAirVelocityExample(this.inputs, this.settings);
    //not every calculator will store values in the service,
    //but be sure to store it in calcs that already do
    this.compressedAirService.airVelocityInputs = this.inputs;
    //execute calculation procedure to update calculator with example values
    this.getAirVelocity(this.inputs);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }
  getAirVelocity(inputs: AirVelocityInput) {
    this.outputs = this.standaloneService.airVelocity(inputs, this.settings);
  }

  setField(str: string) {
    this.currentField = str;
  }
}

import { Component, OnInit, ElementRef, HostListener, ViewChild, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { AirVelocityInput, PipeSizes } from "../../../shared/models/standalone";
import { CompressedAirService } from '../compressed-air.service';
import { Settings } from '../../../shared/models/settings';
import { AirVelocityService } from './air-velocity.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';

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
  constructor(private airVelocityService: AirVelocityService, private standaloneService: StandaloneService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.inputs = this.airVelocityService.airVelocityInputs;
    this.getAirVelocity(this.inputs);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  btnResetData() {
    this.inputs = this.airVelocityService.getDefault();
    this.airVelocityService.airVelocityInputs = this.inputs;
    this.getAirVelocity(this.inputs);
  }

  //provide functionality to "Generate Example" button,
  //reset data function should have most of the structure already
  btnGenerateExample() {
    //each calculator will have some form of an input object, assign default values from pdf
    this.inputs = this.airVelocityService.getExample();
    //need to handle conversion if unit of measurement is set to Metric
    this.inputs = this.airVelocityService.convertAirVelocityExample(this.inputs, this.settings);
    this.airVelocityService.airVelocityInputs = this.inputs;
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

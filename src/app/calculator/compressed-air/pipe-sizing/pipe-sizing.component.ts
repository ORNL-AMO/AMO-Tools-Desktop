import { Component, OnInit, ElementRef, ViewChild, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { PipeSizingInput, PipeSizingOutput } from "../../../shared/models/standalone";
import { CompressedAirService } from '../compressed-air.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-pipe-sizing',
  templateUrl: './pipe-sizing.component.html',
  styleUrls: ['./pipe-sizing.component.css']
})
export class PipeSizingComponent implements OnInit {
  @Input()
  settings: Settings;
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  inputs: PipeSizingInput;
  outputs: PipeSizingOutput;
  currentField: string = 'default';
  constructor(private compressedAirService: CompressedAirService, private standaloneService: StandaloneService) {
  }

  ngOnInit() {
    this.inputs = this.compressedAirService.pipeSizingInput;
    this.calculatePipeSize(this.inputs);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  btnResetData() {
    this.inputs = {
      airFlow: 0,
      airlinePressure: 0,
      designVelocity: 20,
      atmosphericPressure: 14.7
    };
    this.compressedAirService.pipeSizingInput = this.inputs;
    this.calculatePipeSize(this.inputs);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  calculatePipeSize(inputs: PipeSizingInput) {
    this.outputs = this.standaloneService.pipeSizing(inputs, this.settings);
  }

  setField(str: string) {
    this.currentField = str;
  }
}

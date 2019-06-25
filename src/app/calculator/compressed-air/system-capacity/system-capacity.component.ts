import {Component, OnInit, ViewChild, ElementRef, HostListener, Input} from '@angular/core';
import {StandaloneService} from "../../standalone.service";
import {AirSystemCapacityInput, AirSystemCapacityOutput} from "../../../shared/models/standalone";
import {Settings} from '../../../shared/models/settings';
import {CompressedAirService} from '../compressed-air.service';

@Component({
  selector: 'app-system-capacity',
  templateUrl: './system-capacity.component.html',
  styleUrls: ['./system-capacity.component.css']
})
export class SystemCapacityComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  inputs: AirSystemCapacityInput;
  outputs: AirSystemCapacityOutput = {
    totalPipeVolume: 0,
    totalReceiverVolume: 0,
    totalCapacityOfCompressedAirSystem: 0,
    receiverCapacities: [0],
  };
  currentField: string = 'default';

  constructor(private standaloneService: StandaloneService, private compressedAirService: CompressedAirService) {
  }

  ngOnInit() {
    this.inputs = this.compressedAirService.systeCapacityInputs;
    this.calculate();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  btnResetData() {
    this.inputs = {
      receiverCapacities: [0],
      customPipes: new Array<{ pipeSize: number, pipeLength: number }>(),
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
    this.compressedAirService.systeCapacityInputs = this.inputs;
    this.calculate();
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  calculate() {
    this.outputs = this.standaloneService.airSystemCapacity(this.inputs, this.settings);
  }

  changeField($event) {
    this.currentField = $event;
  }

  btnGenerateExample() {
    let tempInputs = {
      receiverCapacities: [400, 500, 660, 1060],
      customPipes: new Array<{ pipeSize: number, pipeLength: number }>(),
      oneHalf: 2000,
      threeFourths: 2000,
      one: 1000,
      oneAndOneFourth: 200,
      oneAndOneHalf: 100,
      two: 500,
      twoAndOneHalf: 0,
      three: 300,
      threeAndOneHalf: 0,
      four: 1000,
      five: 0,
      six: 0,
    };
    this.compressedAirService.systeCapacityInputs = tempInputs;
    this.inputs = this.compressedAirService.systeCapacityInputs;
    this.calculate();
  }
}

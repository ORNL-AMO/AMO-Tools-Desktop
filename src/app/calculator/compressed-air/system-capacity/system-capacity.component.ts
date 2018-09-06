import { Component, OnInit, ViewChild, ElementRef, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { AirSystemCapacityInput, AirSystemCapacityOutput } from "../../../shared/models/standalone";
import { Settings } from '../../../shared/models/settings';
import { CompressedAirService } from '../compressed-air.service';

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
    totalCapacityOfCompressedAirSystem: 0
  };

  constructor(private standaloneService: StandaloneService, private compressedAirService: CompressedAirService) { }

  ngOnInit() {
    this.inputs = this.compressedAirService.systeCapacityInputs;
    this.calculate();
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

  calculate() {
    this.outputs = this.standaloneService.airSystemCapacity(this.inputs, this.settings);
  }
}

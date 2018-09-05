import { Component, OnInit, ViewChild, ElementRef, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { OperatingCostInput, OperatingCostOutput } from "../../../shared/models/standalone";
import { CompressedAirService } from '../compressed-air.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-operating-cost',
  templateUrl: './operating-cost.component.html',
  styleUrls: ['./operating-cost.component.css']
})
export class OperatingCostComponent implements OnInit {
  @Input()
  settings: Settings;
  
  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  inputs: OperatingCostInput;
  outputs: OperatingCostOutput;
  currentField: string = 'default';
  constructor(private compressedAirService: CompressedAirService, private standaloneService: StandaloneService) { }

  ngOnInit() {
    this.inputs = this.compressedAirService.operatingCostInput;
    this.calculateOperationCost(this.inputs);
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
  
  calculateOperationCost(inputs: OperatingCostInput) {
    this.outputs = this.standaloneService.operatingCost(inputs);
  }

  setField(str: string) {
    this.currentField = str;
  }
}

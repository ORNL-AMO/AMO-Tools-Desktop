import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { BagMethodInput, BagMethodOutput } from "../../../shared/models/standalone";

@Component({
  selector: 'app-bag-method',
  templateUrl: './bag-method.component.html',
  styleUrls: ['./bag-method.component.css']
})
export class BagMethodComponent implements OnInit {

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;


  inputs: BagMethodInput;
  outputs: BagMethodOutput;
  currentField: string = 'default';
  constructor() { }

  ngOnInit() {
    this.inputs = {
      operatingTime: 0,
      bagFillTime: 0,
      heightOfBag: 0,
      diameterOfBag: 0,
      numberOfUnits: 0
    };

    this.outputs = {
      flowRate: 0,
      annualConsumption: 0
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

  calculateAnnualConsumption(inputs: BagMethodInput) {
    this.outputs = StandaloneService.bagMethod(inputs);
    this.outputs.annualConsumption = this.inputs.operatingTime * this.outputs.flowRate * 60;
  }

  changeField(str: string) {
    this.currentField = str;
  }

}

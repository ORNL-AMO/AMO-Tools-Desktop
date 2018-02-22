import { Component, OnInit, Input } from '@angular/core';
import { FanRatedInfo } from '../../../../shared/models/fans';
import { FanGasDensity } from './gas-density/gas-density.component';

@Component({
  selector: 'app-fan-data',
  templateUrl: './fan-data.component.html',
  styleUrls: ['./fan-data.component.css']
})
export class FanDataComponent implements OnInit {
  @Input()
  fanRatedInfo: FanRatedInfo;
  @Input()
  fanGasDensity: FanGasDensity;
  stepTab: number = 1;
  constructor() { }

  ngOnInit() {
  }


  changeStepTab(num: number){
    this.stepTab = num;
  }
}

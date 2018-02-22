import { Component, OnInit, Input } from '@angular/core';
import { FanRatedInfo } from '../../../../shared/models/fans';

@Component({
  selector: 'app-fan-data',
  templateUrl: './fan-data.component.html',
  styleUrls: ['./fan-data.component.css']
})
export class FanDataComponent implements OnInit {

  stepTab: number = 1;
  constructor() { }

  ngOnInit() {
  }


  changeStepTab(num: number){
    this.stepTab = num;
  }
}

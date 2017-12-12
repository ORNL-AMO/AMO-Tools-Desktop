import {Component, Input, OnInit} from '@angular/core';
import {Settings} from "../../../../shared/models/settings";

@Component({
  selector: 'app-percent-load-estimation-graph',
  templateUrl: './percent-load-estimation-graph.component.html',
  styleUrls: ['./percent-load-estimation-graph.component.css']
})
export class PercentLoadEstimationGraphComponent implements OnInit {
  @Input()
  percentLoadEstimationForm: any;
  // @Output('calculate')
  // calculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
    debugger
  }

  calculate() {
    return this.percentLoadEstimationForm.loadEstimation;
  }

}

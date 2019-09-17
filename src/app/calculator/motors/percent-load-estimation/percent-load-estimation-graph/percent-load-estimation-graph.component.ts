import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-percent-load-estimation-graph',
  templateUrl: './percent-load-estimation-graph.component.html',
  styleUrls: ['./percent-load-estimation-graph.component.css']
})
export class PercentLoadEstimationGraphComponent implements OnInit {

  @Input()
  loadEstimationResult: number;

  constructor() { }

  ngOnInit() {
  }
}

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-system-curve-graph',
  templateUrl: './system-curve-graph.component.html',
  styleUrls: ['./system-curve-graph.component.css']
})
export class SystemCurveGraphComponent implements OnInit {
  @Input()
  curveConstants: any;
  @Input()
  pointOne: any;
  @Input()
  pointTwo: any;
  @Input()
  staticHead: number;
  @Input()
  lossCoefficient: number
  constructor() { }

  ngOnInit() {
  }

}

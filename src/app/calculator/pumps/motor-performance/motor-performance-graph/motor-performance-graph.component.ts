import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-motor-performance-graph',
  templateUrl: './motor-performance-graph.component.html',
  styleUrls: ['./motor-performance-graph.component.css']
})
export class MotorPerformanceGraphComponent implements OnInit {
  @Input()
  motorPerformanceResults: any;
  constructor() { }

  ngOnInit() {
    console.log(this.motorPerformanceResults.efficiency);
    console.log(this.motorPerformanceResults.motor_current);
    console.log(this.motorPerformanceResults.motor_power_factor);
  }

}

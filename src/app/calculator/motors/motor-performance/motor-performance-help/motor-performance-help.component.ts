import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-motor-performance-help',
    templateUrl: './motor-performance-help.component.html',
    styleUrls: ['./motor-performance-help.component.css'],
    standalone: false
})
export class MotorPerformanceHelpComponent implements OnInit {
  @Input ()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}

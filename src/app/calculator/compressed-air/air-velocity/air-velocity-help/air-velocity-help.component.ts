import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-air-velocity-help',
    templateUrl: './air-velocity-help.component.html',
    styleUrls: ['./air-velocity-help.component.css'],
    standalone: false
})
export class AirVelocityHelpComponent implements OnInit {
  @Input()
  currentField: string;
  
  constructor() { }

  ngOnInit() {
  }

}

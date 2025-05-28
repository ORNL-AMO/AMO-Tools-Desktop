import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-air-capacity-help',
    templateUrl: './air-capacity-help.component.html',
    styleUrls: ['./air-capacity-help.component.css'],
    standalone: false
})
export class AirCapacityHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}

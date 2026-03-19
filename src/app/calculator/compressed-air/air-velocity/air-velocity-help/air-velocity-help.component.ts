import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-air-velocity-help',
  templateUrl: './air-velocity-help.component.html',
  styleUrls: ['./air-velocity-help.component.css'],
  standalone: false
})
export class AirVelocityHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
  }

}

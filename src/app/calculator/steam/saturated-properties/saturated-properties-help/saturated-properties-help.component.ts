import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-saturated-properties-help',
    templateUrl: './saturated-properties-help.component.html',
    styleUrls: ['./saturated-properties-help.component.css'],
    standalone: false
})
export class SaturatedPropertiesHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  @Input()
  ranges: { minTemp: number, maxTemp: number, minPressure: number, maxPressure: number };
  constructor() { }

  ngOnInit() {
  }
}

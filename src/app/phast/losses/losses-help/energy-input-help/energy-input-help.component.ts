import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-energy-input-help',
    templateUrl: './energy-input-help.component.html',
    styleUrls: ['./energy-input-help.component.css'],
    standalone: false
})
export class EnergyInputHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}

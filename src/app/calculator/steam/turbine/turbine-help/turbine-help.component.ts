import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-turbine-help',
  templateUrl: './turbine-help.component.html',
  styleUrls: ['./turbine-help.component.css']
})
export class TurbineHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit() {
  }

}

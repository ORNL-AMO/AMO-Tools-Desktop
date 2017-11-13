import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-heat-system-efficiency-help',
  templateUrl: './heat-system-efficiency-help.component.html',
  styleUrls: ['./heat-system-efficiency-help.component.css']
})
export class HeatSystemEfficiencyHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit() {
    console.log(this.settings);
  }

}

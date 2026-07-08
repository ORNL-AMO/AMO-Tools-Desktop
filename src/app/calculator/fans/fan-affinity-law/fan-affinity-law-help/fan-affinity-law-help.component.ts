import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-fan-affinity-law-help',
    templateUrl: './fan-affinity-law-help.component.html',
    styleUrls: ['./fan-affinity-law-help.component.css'],
    standalone: false
})
export class FanAffinityLawHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}

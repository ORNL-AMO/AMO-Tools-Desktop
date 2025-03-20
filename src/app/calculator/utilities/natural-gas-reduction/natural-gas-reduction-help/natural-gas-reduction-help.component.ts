import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-natural-gas-reduction-help',
    templateUrl: './natural-gas-reduction-help.component.html',
    styleUrls: ['./natural-gas-reduction-help.component.css'],
    standalone: false
})
export class NaturalGasReductionHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}

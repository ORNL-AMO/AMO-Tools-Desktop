import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-water-reduction-help',
    templateUrl: './water-reduction-help.component.html',
    styleUrls: ['./water-reduction-help.component.css'],
    standalone: false
})
export class WaterReductionHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  currentField: string;
  @Input()
  isWastewater: boolean;


  constructor() { }

  ngOnInit() {
  }

}

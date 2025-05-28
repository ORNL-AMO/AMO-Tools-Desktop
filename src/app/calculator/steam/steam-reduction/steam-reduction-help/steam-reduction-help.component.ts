import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-steam-reduction-help',
    templateUrl: './steam-reduction-help.component.html',
    styleUrls: ['./steam-reduction-help.component.css'],
    standalone: false
})
export class SteamReductionHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}

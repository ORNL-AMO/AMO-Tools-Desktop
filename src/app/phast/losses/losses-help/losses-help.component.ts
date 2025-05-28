import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { LossTab } from '../../tabs';
@Component({
    selector: 'app-losses-help',
    templateUrl: './losses-help.component.html',
    styleUrls: ['./losses-help.component.css'],
    standalone: false
})
export class LossesHelpComponent implements OnInit {
  @Input()
  lossesTab: LossTab;
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit() {

  }

}

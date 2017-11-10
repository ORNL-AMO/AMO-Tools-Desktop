import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
@Component({
  selector: 'app-losses-help',
  templateUrl: './losses-help.component.html',
  styleUrls: ['./losses-help.component.css']
})
export class LossesHelpComponent implements OnInit {
  @Input()
  lossesTab: string;
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit() {
  }

}

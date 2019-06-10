import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-wall-losses-help',
  templateUrl: './wall-losses-help.component.html',
  styleUrls: ['./wall-losses-help.component.css']
})
export class WallLossesHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}

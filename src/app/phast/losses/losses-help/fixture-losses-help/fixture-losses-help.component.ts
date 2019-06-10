import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-fixture-losses-help',
  templateUrl: './fixture-losses-help.component.html',
  styleUrls: ['./fixture-losses-help.component.css']
})
export class FixtureLossesHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  currentField: string;
  
  constructor() { }

  ngOnInit() {
  }

}

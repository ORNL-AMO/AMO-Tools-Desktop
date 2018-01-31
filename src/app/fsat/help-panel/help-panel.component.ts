import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-help-panel',
  templateUrl: './help-panel.component.html',
  styleUrls: ['./help-panel.component.css']
})
export class HelpPanelComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  stepTab: string;
  @Input()
  inSetup: boolean;
  constructor() { }

  ngOnInit() {
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { StepTab } from '../tabs';

@Component({
  selector: 'app-help-panel',
  templateUrl: './help-panel.component.html',
  styleUrls: ['./help-panel.component.css']
})
export class HelpPanelComponent implements OnInit {
  @Input()
  settingsTab: StepTab;

  constructor() { }

  ngOnInit() {
  }

}

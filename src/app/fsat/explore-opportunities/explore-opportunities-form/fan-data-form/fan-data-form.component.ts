import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-fan-data-form',
  templateUrl: './fan-data-form.component.html',
  styleUrls: ['./fan-data-form.component.css']
})
export class FanDataFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  constructor() { }

  ngOnInit() {
  }

}

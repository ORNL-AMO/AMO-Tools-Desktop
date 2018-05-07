import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-rated-motor-form',
  templateUrl: './rated-motor-form.component.html',
  styleUrls: ['./rated-motor-form.component.css']
})
export class RatedMotorFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  constructor() { }

  ngOnInit() {
  }

}

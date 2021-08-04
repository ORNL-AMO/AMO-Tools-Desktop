import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-weather-bins-form',
  templateUrl: './weather-bins-form.component.html',
  styleUrls: ['./weather-bins-form.component.css']
})
export class WeatherBinsFormComponent implements OnInit {
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit(): void {
  }

}

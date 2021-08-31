import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { WeatherBinsService, WeatherIntegratedCalculatorData } from '../weather-bins.service';

@Component({
  selector: 'app-weather-bins-form',
  templateUrl: './weather-bins-form.component.html',
  styleUrls: ['./weather-bins-form.component.css']
})
export class WeatherBinsFormComponent implements OnInit {
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit(): void {}

  ngOnDestroy() {}

}

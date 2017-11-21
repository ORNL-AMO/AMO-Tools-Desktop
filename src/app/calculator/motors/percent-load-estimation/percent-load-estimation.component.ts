import {Component, Input, OnInit} from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-percent-load-estimation',
  templateUrl: './percent-load-estimation.component.html',
  styleUrls: ['./percent-load-estimation.component.css']
})
export class PercentLoadEstimationComponent implements OnInit {
  @Input()
  settings: Settings;

  percentLoadEstimationForm: any;

  toggleCalculate = false;

  constructor() { }

  ngOnInit() {
  }

  calculate() {
    this.toggleCalculate = !this.toggleCalculate;
  }

}

import { Component, OnInit } from '@angular/core';
import { O2UtilizationDataPoints, O2UtilizationRateService } from '../o2-utilization-rate.service';

@Component({
  selector: 'app-o2-utilization-rate-form',
  templateUrl: './o2-utilization-rate-form.component.html',
  styleUrls: ['./o2-utilization-rate-form.component.css']
})
export class O2UtilizationRateFormComponent implements OnInit {

  inputDataPoints: Array<O2UtilizationDataPoints>;
  constructor(private o2UtilizationRateService: O2UtilizationRateService) { }

  ngOnInit(): void {
    this.inputDataPoints = this.o2UtilizationRateService.inputDataPoints.getValue();
  }

  save() {
    this.o2UtilizationRateService.inputDataPoints.next(this.inputDataPoints);
  }
}

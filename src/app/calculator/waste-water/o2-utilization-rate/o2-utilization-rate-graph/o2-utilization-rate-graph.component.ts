import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { O2UtilizationDataPoints, O2UtilizationRateService } from '../o2-utilization-rate.service';

@Component({
  selector: 'app-o2-utilization-rate-graph',
  templateUrl: './o2-utilization-rate-graph.component.html',
  styleUrls: ['./o2-utilization-rate-graph.component.css']
})
export class O2UtilizationRateGraphComponent implements OnInit {

  inputDataPoints: Array<O2UtilizationDataPoints>;
  inputDataPointsSub: Subscription;

  constructor(private o2UtilizationRateService: O2UtilizationRateService) { }

  ngOnInit(): void {
    this.inputDataPointsSub = this.o2UtilizationRateService.inputDataPoints.subscribe(val => {
      this.inputDataPoints = val;
    });
  }

  ngOnDestroy() {
    this.inputDataPointsSub.unsubscribe();
  }

}

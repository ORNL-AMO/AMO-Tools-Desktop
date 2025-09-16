import { Component, OnInit } from '@angular/core';
import { FanAnalysisService } from '../../fan-analysis.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-operating-points-help',
    templateUrl: './operating-points-help.component.html',
    styleUrls: ['./operating-points-help.component.css'],
    standalone: false
})
export class OperatingPointsHelpComponent implements OnInit {

  stepTab: string;
  stepTabSubscription: Subscription;
  constructor(private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.stepTabSubscription = this.fanAnalysisService.stepTab.subscribe(val => {
      this.stepTab = val;
    })
  }

  ngOnDestroy(){
    this.stepTabSubscription.unsubscribe();
  }
}

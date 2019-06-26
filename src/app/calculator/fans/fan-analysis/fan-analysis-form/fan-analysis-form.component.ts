import { Component, OnInit } from '@angular/core';
import { FanAnalysisService } from '../fan-analysis.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fan-analysis-form',
  templateUrl: './fan-analysis-form.component.html',
  styleUrls: ['./fan-analysis-form.component.css']
})
export class FanAnalysisFormComponent implements OnInit {

  mainTab: string;
  mainTabSubscription: Subscription;
  constructor(private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.mainTabSubscription = this.fanAnalysisService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
  }

  ngOnDestroy(){
    this.mainTabSubscription.unsubscribe();
  }

}

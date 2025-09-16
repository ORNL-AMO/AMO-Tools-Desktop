import { Component, OnInit } from '@angular/core';
import { FanAnalysisService } from '../../../fan-analysis.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-fan-shaft-power-help',
    templateUrl: './fan-shaft-power-help.component.html',
    styleUrls: ['./fan-shaft-power-help.component.css'],
    standalone: false
})
export class FanShaftPowerHelpComponent implements OnInit {

  currentField: string;
  currentFieldSubscription: Subscription;
  constructor(private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.currentFieldSubscription = this.fanAnalysisService.currentField.subscribe(val => {
      this.currentField = val;
    })
  }

  ngOnDestroy(){
    this.currentFieldSubscription.unsubscribe();
  }

}

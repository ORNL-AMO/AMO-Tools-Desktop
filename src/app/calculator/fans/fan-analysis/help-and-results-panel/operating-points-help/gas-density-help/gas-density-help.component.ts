import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FanAnalysisService } from '../../../fan-analysis.service';

@Component({
    selector: 'app-gas-density-help',
    templateUrl: './gas-density-help.component.html',
    styleUrls: ['./gas-density-help.component.css'],
    standalone: false
})
export class GasDensityHelpComponent implements OnInit {

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

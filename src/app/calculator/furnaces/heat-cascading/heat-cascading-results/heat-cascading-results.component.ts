import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HeatCascadingOutput } from '../../../../shared/models/phast/heatCascading';
import { Settings } from '../../../../shared/models/settings';
import { HeatCascadingService } from '../heat-cascading.service';

@Component({
  selector: 'app-heat-cascading-results',
  templateUrl: './heat-cascading-results.component.html',
  styleUrls: ['./heat-cascading-results.component.css']
})
export class HeatCascadingResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  outputSubscription: Subscription;
  output: HeatCascadingOutput;
  
  constructor(private heatCascadingService: HeatCascadingService) { }

  ngOnInit(): void {
    this.outputSubscription = this.heatCascadingService.heatCascadingOutput.subscribe(val => {
      this.output = val;
    })
  }

  ngOnDestroy() {
    this.outputSubscription.unsubscribe();
  }
}

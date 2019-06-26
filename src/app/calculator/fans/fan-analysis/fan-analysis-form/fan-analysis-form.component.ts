import { Component, OnInit, Input } from '@angular/core';
import { FanAnalysisService } from '../fan-analysis.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { Fan203Inputs } from '../../../../shared/models/fans';

@Component({
  selector: 'app-fan-analysis-form',
  templateUrl: './fan-analysis-form.component.html',
  styleUrls: ['./fan-analysis-form.component.css']
})
export class FanAnalysisFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inputs: Fan203Inputs;

  stepTab: string;
  stepTabSubscription: Subscription;
  constructor(private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.inputs.BaseGasDensity
    this.stepTabSubscription = this.fanAnalysisService.stepTab.subscribe(val => {
      this.stepTab = val;
    })
  }

  ngOnDestroy(){
    this.stepTabSubscription.unsubscribe();
  }

}

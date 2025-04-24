import { Component, OnInit, Input } from '@angular/core';
import { FanAnalysisService } from '../fan-analysis.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-fan-analysis-form',
    templateUrl: './fan-analysis-form.component.html',
    styleUrls: ['./fan-analysis-form.component.css'],
    standalone: false
})
export class FanAnalysisFormComponent implements OnInit {
  @Input()
  settings: Settings;

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

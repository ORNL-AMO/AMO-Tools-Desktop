import { Component, OnInit, Input } from '@angular/core';
import { AirFlowConversionOutput } from '../../../../shared/models/compressed-air/compressed-air';
import { Settings } from '../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { AirFlowConversionService } from '../air-flow-conversion.service';

@Component({
    selector: 'app-air-flow-conversion-results',
    templateUrl: './air-flow-conversion-results.component.html',
    styleUrls: ['./air-flow-conversion-results.component.css'],
    standalone: false
})
export class AirFlowConversionResultsComponent implements OnInit {

  airFlowConversionOutput: AirFlowConversionOutput;
  airFlowConversionOutputSub: Subscription;

  @Input()
  settings: Settings;
  constructor(private airFlowConversionService: AirFlowConversionService) { }

  ngOnInit(): void {
    this.airFlowConversionOutputSub = this.airFlowConversionService.airFlowConversionOutput.subscribe(value => {
      this.airFlowConversionOutput = value;
    })
  }
  ngOnDestroy() {
    this.airFlowConversionOutputSub.unsubscribe();
  }

}

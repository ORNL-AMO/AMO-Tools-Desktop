import { Component, OnInit, Input } from '@angular/core';
import { CalculateLossesService } from '../../ssmt-calculations/calculate-losses.service';
import { SSMTOutput, SSMTLosses } from '../../../shared/models/steam/steam-outputs';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { CalculateModelService } from '../../ssmt-calculations/calculate-model.service';


@Component({
  selector: 'app-losses-summary',
  templateUrl: './losses-summary.component.html',
  styleUrls: ['./losses-summary.component.css']
})
export class LossesSummaryComponent implements OnInit {
  @Input()
  inputData: SSMTInputs
  @Input()
  settings: Settings;
  @Input()
  baselineOutput: SSMTOutput;

  baselineLosses: SSMTLosses;
  constructor(private calculateLossesService: CalculateLossesService) { }

  ngOnInit() {
    this.baselineLosses = this.calculateLossesService.calculateLosses(this.baselineOutput, this.inputData, this.settings);
  } 

}

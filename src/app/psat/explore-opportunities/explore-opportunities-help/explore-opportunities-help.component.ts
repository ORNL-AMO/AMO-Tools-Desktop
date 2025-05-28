import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PSAT } from '../../../shared/models/psat';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PsatWarningService } from '../../psat-warning.service';
@Component({
    selector: 'app-explore-opportunities-help',
    templateUrl: './explore-opportunities-help.component.html',
    styleUrls: ['./explore-opportunities-help.component.css'],
    standalone: false
})
export class ExploreOpportunitiesHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  @Input()
  psat: PSAT;

  maxFlowRate: number;
  minFlowRate: number;
  constructor(private convertUnitsService: ConvertUnitsService, private psatWarningService: PsatWarningService) { }

  ngOnInit() {
    this.minFlowRate = this.getMinFlowRate();
    this.maxFlowRate = this.getMaxFlowRate();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.psat) {
      this.minFlowRate = this.getMinFlowRate();
      this.maxFlowRate = this.getMaxFlowRate();
    }
  }

  getMinFlowRate() {
    let flowRateRange = this.psatWarningService.getFlowRateMinMax(this.psat.inputs.pump_style);
    if (this.settings.flowMeasurement != 'gpm') {
      flowRateRange.min = this.convertUnitsService.value(flowRateRange.min).from('gpm').to(this.settings.flowMeasurement);
    }
    return flowRateRange.min;
  }


  getMaxFlowRate() {
    let flowRateRange = this.psatWarningService.getFlowRateMinMax(this.psat.inputs.pump_style);
    if (this.settings.flowMeasurement != 'gpm') {
      flowRateRange.max = this.convertUnitsService.value(flowRateRange.max).from('gpm').to(this.settings.flowMeasurement);
    }
    return flowRateRange.max;
  }
}

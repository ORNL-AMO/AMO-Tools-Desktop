import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { HelpPanelService } from '../help-panel.service';
import { Subscription } from 'rxjs';
import { PsatWarningService } from '../../psat-warning.service';
@Component({
    selector: 'app-field-data-help',
    templateUrl: './field-data-help.component.html',
    styleUrls: ['./field-data-help.component.css'],
    standalone: false
})
export class FieldDataHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  psat: PSAT;

  currentField: string;
  maxFlowRate: number;
  minFlowRate: number;
  currentFieldSub: Subscription;
  constructor( private convertUnitsService: ConvertUnitsService, private helpPanelService: HelpPanelService, private psatWarningService: PsatWarningService) { }


  ngOnInit() {
    this.minFlowRate = this.getMinFlowRate();
    this.maxFlowRate = this.getMaxFlowRate();
    this.currentFieldSub = this.helpPanelService.currentField.subscribe((val) => {
      this.currentField = val;
    })
  }

  ngOnDestroy(){
    this.currentFieldSub.unsubscribe();
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
  getDisplayUnit(unit: any) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }

}

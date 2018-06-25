import { Component, OnInit, Input } from '@angular/core';
import { Fan203Inputs, PlaneResults } from '../../../../shared/models/fans';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-planar-results',
  templateUrl: './planar-results.component.html',
  styleUrls: ['./planar-results.component.css']
})
export class PlanarResultsComponent implements OnInit {
  @Input()
  planeResults: PlaneResults;
  @Input()
  showFull: boolean;
  @Input()
  inputs: Fan203Inputs;
  @Input()
  inModal: boolean;
  @Input()
  pressureCalcType: string;
  @Input()
  settings: Settings;

  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
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

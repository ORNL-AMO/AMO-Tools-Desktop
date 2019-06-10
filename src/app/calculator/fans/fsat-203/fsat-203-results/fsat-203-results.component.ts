import { Component, OnInit, Input } from '@angular/core';
import { Fan203Results } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-fsat-203-results',
  templateUrl: './fsat-203-results.component.html',
  styleUrls: ['./fsat-203-results.component.css']
})
export class Fsat203ResultsComponent implements OnInit {
  @Input()
  results: Fan203Results;
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

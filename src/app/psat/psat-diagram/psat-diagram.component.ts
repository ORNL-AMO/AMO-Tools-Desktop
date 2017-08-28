import { Component, OnInit, Input } from '@angular/core';
import { PSAT, PsatOutputs } from '../../shared/models/psat';
import { PsatService } from '../psat.service';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-psat-diagram',
  templateUrl: './psat-diagram.component.html',
  styleUrls: ['./psat-diagram.component.css']
})
export class PsatDiagramComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;


  results: PsatOutputs;
  constructor(private psatService: PsatService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (this.psat.inputs && this.settings) {
      this.results = this.psatService.resultsExisting(this.psat.inputs, this.settings);
      console.log(this.results);
    }
  }

  getPumpType(num: number) {
    return this.psatService.getPumpStyleFromEnum(num);
  }


  getUnit(unit: string) {
    let tmpUnit = this.convertUnitsService.getUnit(unit);
    return tmpUnit.unit.name.display;
  }
}

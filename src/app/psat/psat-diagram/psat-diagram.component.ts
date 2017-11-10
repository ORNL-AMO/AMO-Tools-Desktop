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
  resultsArr: Array<DiagramResults>;
  constructor(private psatService: PsatService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.resultsArr = new Array<DiagramResults>();
    if (this.psat.inputs && this.settings) {
      let tmpResults: PsatOutputs = this.getResults(this.psat, this.settings, false);
      this.psat.outputs = tmpResults;
      this.resultsArr.push({ output: tmpResults, name: 'Baseline', psat: this.psat })
      if (this.psat.modifications) {
        this.psat.modifications.forEach(val => {
          tmpResults = this.getResults(val.psat, this.settings, true);
          this.resultsArr.push({ output: tmpResults, name: val.psat.name, psat: val.psat })
        })
      }
    }
  }

  getPumpType(num: number) {
    return this.psatService.getPumpStyleFromEnum(num);
  }


  getUnit(unit: string) {
    let tmpUnit = this.convertUnitsService.getUnit(unit);
    return tmpUnit.unit.name.display;
  }

  getResults(psat: PSAT, settings: Settings, isModification?: boolean): PsatOutputs {
    if (psat.inputs.optimize_calculation) {
      return this.psatService.resultsOptimal(JSON.parse(JSON.stringify(psat.inputs)), settings);
    } else if (!isModification) {
      return this.psatService.resultsExisting(JSON.parse(JSON.stringify(psat.inputs)), settings);
    } else {
      return this.psatService.resultsModified(JSON.parse(JSON.stringify(psat.inputs)), settings, this.psat.outputs.pump_efficiency);
    }
  }
}


interface DiagramResults {
  output: PsatOutputs,
  name: string,
  psat: PSAT
}
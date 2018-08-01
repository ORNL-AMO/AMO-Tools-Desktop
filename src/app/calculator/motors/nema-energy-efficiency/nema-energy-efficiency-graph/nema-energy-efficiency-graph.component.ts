import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { ConvertUnitsService } from "../../../../shared/convert-units/convert-units.service";

@Component({
  selector: 'app-nema-energy-efficiency-graph',
  templateUrl: './nema-energy-efficiency-graph.component.html',
  styleUrls: ['./nema-energy-efficiency-graph.component.css']
})
export class NemaEnergyEfficiencyGraphComponent implements OnInit {
  @Input()
  nemaForm: FormGroup;
  @Input()
  settings: Settings;

  constructor(private psatService: PsatService) { }

  ngOnInit() {
  }

  calculate() {
    if (this.nemaForm.status == 'VALID') {
      const efficiency = this.psatService.getEfficiencyFromForm(this.nemaForm);
      console.log(this.nemaForm.controls.motorRPM.value);
      return this.psatService.nema(
        this.nemaForm.controls.frequency.value,
        this.nemaForm.controls.motorRPM.value,
        this.nemaForm.controls.efficiencyClass.value,
        efficiency,
        this.nemaForm.controls.horsePower.value,
        this.settings
      );
    } else {
      return 0;
    }
  }
}

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
    if (this.checkForm()) {
      const efficiency = this.psatService.getEfficiencyFromForm(this.nemaForm);
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

  checkForm() {
    if (this.nemaForm.controls.motorRPM.value != 0) {
      if (
        this.nemaForm.controls.frequency.status == 'VALID' &&
        this.nemaForm.controls.horsePower.status == 'VALID' &&
        this.nemaForm.controls.motorRPM.status == 'VALID' &&
        this.nemaForm.controls.efficiencyClass.status == 'VALID'
      ) {
        if (this.nemaForm.controls.efficiencyClass.value == 'Specified') {
          if (
            this.nemaForm.controls.efficiency.status == 'VALID'
          ) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
  }

}

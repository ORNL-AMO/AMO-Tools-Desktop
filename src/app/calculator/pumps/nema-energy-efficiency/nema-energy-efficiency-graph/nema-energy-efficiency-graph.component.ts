import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-nema-energy-efficiency-graph',
  templateUrl: './nema-energy-efficiency-graph.component.html',
  styleUrls: ['./nema-energy-efficiency-graph.component.css']
})
export class NemaEnergyEfficiencyGraphComponent implements OnInit {
  @Input()
  nemaForm: any;
  @Input()
  settings:Settings;

  constructor(private psatService: PsatService) { }

  ngOnInit() {
  }

  calculate() {
    if (this.checkForm()) {
      let efficiency = this.psatService.getEfficiencyFromForm(this.nemaForm);
      return this.psatService.nema(
        this.nemaForm.value.frequency,
        this.nemaForm.value.motorRPM,
        this.nemaForm.value.efficiencyClass,
        efficiency,
        this.nemaForm.value.horsePower,
        this.settings
      );
    }else{
      return 0;
    }
  }


  checkForm() {
    if (this.nemaForm.value.motorRPM != 0) {
      if (
        this.nemaForm.controls.frequency.status == 'VALID' &&
        this.nemaForm.controls.horsePower.status == 'VALID' &&
        this.nemaForm.controls.motorRPM.status == 'VALID' &&
        this.nemaForm.controls.efficiencyClass.status == 'VALID'
      ) {
        if (this.nemaForm.value.efficiencyClass == 'Specified') {
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

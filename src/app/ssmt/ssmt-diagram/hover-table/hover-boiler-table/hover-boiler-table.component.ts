import { Component, OnInit } from '@angular/core';
import { BoilerOutput } from '../../../../shared/models/steam/steam-outputs';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';
import { SSMTInputs, BoilerInput } from '../../../../shared/models/steam/ssmt';

@Component({
  selector: 'app-hover-boiler-table',
  templateUrl: './hover-boiler-table.component.html',
  styleUrls: ['./hover-boiler-table.component.css']
})
export class HoverBoilerTableComponent implements OnInit {


  boiler: BoilerOutput;
  boilerInput: BoilerInput;
  constructor(private calculateModelService: CalculateModelService) { }

  ngOnInit() {
    this.boiler = this.calculateModelService.boilerOutput;
    this.boilerInput = this.calculateModelService.inputData.boilerInput;
  }

}

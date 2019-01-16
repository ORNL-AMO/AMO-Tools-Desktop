import { Component, OnInit } from '@angular/core';
import { BoilerOutput } from '../../../../shared/models/steam/steam-outputs';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';
import { BoilerInput } from '../../../../shared/models/steam/ssmt';

@Component({
  selector: 'app-hover-blowdown-table',
  templateUrl: './hover-blowdown-table.component.html',
  styleUrls: ['./hover-blowdown-table.component.css']
})
export class HoverBlowdownTableComponent implements OnInit {

  boiler: BoilerOutput;
  boilerInput: BoilerInput;
  constructor(private calculateModelService: CalculateModelService) { }

  ngOnInit() {
    this.boiler = this.calculateModelService.boilerOutput;
    this.boilerInput = this.calculateModelService.inputData.boilerInput;
  }
}

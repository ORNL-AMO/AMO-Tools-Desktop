import { Component, OnInit } from '@angular/core';
import { BoilerOutput } from '../../../../shared/models/steam/steam-outputs';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';

@Component({
  selector: 'app-hover-boiler-steam-table',
  templateUrl: './hover-boiler-steam-table.component.html',
  styleUrls: ['./hover-boiler-steam-table.component.css']
})
export class HoverBoilerSteamTableComponent implements OnInit {

  boiler: BoilerOutput;
  //boilerInput: BoilerInput;
  constructor(private calculateModelService: CalculateModelService) { }

  ngOnInit() {
    this.boiler = this.calculateModelService.boilerOutput;
  }
}

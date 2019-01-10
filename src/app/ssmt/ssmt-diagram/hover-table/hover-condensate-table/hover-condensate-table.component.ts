import { Component, OnInit } from '@angular/core';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';
import { SteamPropertiesOutput } from '../../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-hover-condensate-table',
  templateUrl: './hover-condensate-table.component.html',
  styleUrls: ['./hover-condensate-table.component.css']
})
export class HoverCondensateTableComponent implements OnInit {

  returnCondensate: SteamPropertiesOutput;
  constructor(private calculateModelService: CalculateModelService) { }

  ngOnInit() {
    this.returnCondensate = this.calculateModelService.returnCondensate;
  }


}

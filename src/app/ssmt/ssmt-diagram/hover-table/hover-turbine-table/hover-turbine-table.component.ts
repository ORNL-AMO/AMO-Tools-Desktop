import { Component, OnInit, Input } from '@angular/core';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';
import { TurbineOutput } from '../../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-hover-turbine-table',
  templateUrl: './hover-turbine-table.component.html',
  styleUrls: ['./hover-turbine-table.component.css']
})
export class HoverTurbineTableComponent implements OnInit {
  @Input()
  turbineType: string;

  turbine: TurbineOutput
  constructor(private calculateModelService: CalculateModelService) { }

  ngOnInit() {
    if (this.turbineType == 'condensing') {
      this.turbine = this.calculateModelService.condensingTurbine;
    } else if (this.turbineType == 'highToLow') {
      this.turbine = this.calculateModelService.highToLowPressureTurbine;
    } else if (this.turbineType == 'highToMedium') {
      this.turbine = this.calculateModelService.highPressureToMediumPressureTurbine;
    } else if (this.turbineType == 'mediumToLow') {
      this.turbine = this.calculateModelService.mediumToLowPressureTurbine;
    }
  }

}

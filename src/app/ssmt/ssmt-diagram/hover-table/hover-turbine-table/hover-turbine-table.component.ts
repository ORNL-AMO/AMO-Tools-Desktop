import { Component, OnInit, Input } from '@angular/core';
import { TurbineOutput, SSMTOutput } from '../../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-hover-turbine-table',
  templateUrl: './hover-turbine-table.component.html',
  styleUrls: ['./hover-turbine-table.component.css']
})
export class HoverTurbineTableComponent implements OnInit {
  @Input()
  turbineType: string;
  @Input()
  settings: Settings;
  @Input()
  outputData: SSMTOutput;

  turbine: TurbineOutput
  constructor() { }

  ngOnInit() {
    if (this.turbineType == 'condensing') {
      this.turbine = this.outputData.condensingTurbine;
    } else if (this.turbineType == 'highToLow') {
      this.turbine = this.outputData.highToLowPressureTurbine;
    } else if (this.turbineType == 'highToMedium') {
      this.turbine = this.outputData.highPressureToMediumPressureTurbine;
    } else if (this.turbineType == 'mediumToLow') {
      this.turbine = this.outputData.mediumToLowPressureTurbine;
    }
  }

}

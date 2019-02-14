import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TurbineOutput, SSMTOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';
import { TurbineService } from '../../../calculator/steam/turbine/turbine.service';
import { SsmtService } from '../../ssmt.service';
import { TurbineInput } from '../../../shared/models/steam/steam-inputs';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';
import { SsmtDiagramTabService } from '../ssmt-diagram-tab.service';

@Component({
  selector: 'app-turbine-table',
  templateUrl: './turbine-table.component.html',
  styleUrls: ['./turbine-table.component.css']
})
export class TurbineTableComponent implements OnInit {
  @Input()
  turbine: TurbineOutput;
  @Input()
  turbineName: string;
  @Input()
  settings: Settings;
  
  constructor(private ssmtDiagramTabService: SsmtDiagramTabService) { }

  ngOnInit() {
  }

  goToCalculator() {
    this.ssmtDiagramTabService.setTurbine(this.turbine);
  }
}

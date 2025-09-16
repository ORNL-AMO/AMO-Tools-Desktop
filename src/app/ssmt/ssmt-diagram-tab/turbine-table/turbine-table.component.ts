import { Component, OnInit, Input } from '@angular/core';
import { TurbineOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';
import { SsmtDiagramTabService } from '../ssmt-diagram-tab.service';

@Component({
    selector: 'app-turbine-table',
    templateUrl: './turbine-table.component.html',
    styleUrls: ['./turbine-table.component.css'],
    standalone: false
})
export class TurbineTableComponent implements OnInit {
  @Input()
  turbine: TurbineOutput;
  @Input()
  turbineName: string;
  @Input()
  settings: Settings;

  steamCondensingWarning: string;
  inletSteamCondensateWarning: string;
  outletPressureWarning: string;
  steamMassFlowWarning: string;
  constructor(private ssmtDiagramTabService: SsmtDiagramTabService) { }

  ngOnInit() {

  }

  ngOnChanges() {
    if (this.turbine) {
      this.checkWarnings();
    } else {
      this.steamCondensingWarning = undefined;
      this.inletSteamCondensateWarning = undefined;
      this.outletPressureWarning = undefined;
      this.steamMassFlowWarning = undefined;
    }
  }

  goToCalculator() {
    this.ssmtDiagramTabService.setTurbine(this.turbine);
  }

  checkWarnings() {
    if (this.turbine.massFlow < 0) {
      this.steamMassFlowWarning = 'Steam flow negative.';
    }
    if (this.turbine.outletQuality < 1) {
      this.steamCondensingWarning = 'Steam condensing in turbine.';
    }
    if (this.turbine.inletPressure < this.turbine.outletPressure) {
      this.outletPressureWarning = 'Outlet steam pressure higher than inlet.';
    }
    if(this.turbine.inletQuality < 1){
      this.inletSteamCondensateWarning = 'Inlet steam contains condensate.';
    }
  }
}

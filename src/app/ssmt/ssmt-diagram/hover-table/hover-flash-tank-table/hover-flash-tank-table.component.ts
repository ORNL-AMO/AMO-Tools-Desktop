import { Component, OnInit, Input } from '@angular/core';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';
import { FlashTankOutput, SSMTOutput } from '../../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-hover-flash-tank-table',
  templateUrl: './hover-flash-tank-table.component.html',
  styleUrls: ['./hover-flash-tank-table.component.css']
})
export class HoverFlashTankTableComponent implements OnInit {
  @Input()
  flashTankType: string;
  @Input()
  settings: Settings;
  @Input()
  outputData: SSMTOutput;

  flashTank: FlashTankOutput;
  constructor() { }

  ngOnInit() {
    if (this.flashTankType == 'High Pressure') {
      this.flashTank = this.outputData.highPressureCondensateFlashTank;
      this.flashTankType = this.flashTankType + ' Condensate';
    } else if (this.flashTankType == 'Medium Pressure') {
      this.flashTank = this.outputData.mediumPressureCondensateFlashTank;
      this.flashTankType = this.flashTankType + ' Condensate';
    } else if (this.flashTankType == 'Condensate') {
      this.flashTank = this.outputData.condensateFlashTank;
    } else if (this.flashTankType == 'Blowdown') {
      this.flashTank = this.outputData.blowdownFlashTank;
    }
  }

}

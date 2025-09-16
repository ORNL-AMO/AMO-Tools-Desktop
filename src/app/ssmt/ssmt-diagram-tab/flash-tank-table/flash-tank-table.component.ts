import { Component, OnInit, Input } from '@angular/core';
import { FlashTankOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';
import { SsmtDiagramTabService } from '../ssmt-diagram-tab.service';

@Component({
    selector: 'app-flash-tank-table',
    templateUrl: './flash-tank-table.component.html',
    styleUrls: ['./flash-tank-table.component.css'],
    standalone: false
})
export class FlashTankTableComponent implements OnInit {
  @Input()
  flashTank: FlashTankOutput;
  @Input()
  flashTankType: string;
  @Input()
  settings: Settings;

  noSteamFlashingWarning: string;
  superheatedSteamWarning: string;
  constructor(private ssmtDiagramTabService: SsmtDiagramTabService) { }

  ngOnInit() {
    if (this.flashTankType !== 'Condensate' && this.flashTankType !== 'Blowdown') {
      this.flashTankType = this.flashTankType + ' Pressure Condensate';
    }
  }

  ngOnChanges(){
    this.checkWarnings();
  }

  goToCalculator(){
    this.ssmtDiagramTabService.setFlashTankCalculator(this.flashTank);
  }

  checkWarnings(){
    if(this.flashTank.outletGasMassFlow == 0){
      this.noSteamFlashingWarning = 'No steam flashing.';
    }else{
      this.noSteamFlashingWarning = undefined;
    }
    if(this.flashTank.inletWaterQuality == 1){
      this.superheatedSteamWarning = 'Inlet is superheated steam.'
    }else{
      this.superheatedSteamWarning = undefined;
    }
  }
}

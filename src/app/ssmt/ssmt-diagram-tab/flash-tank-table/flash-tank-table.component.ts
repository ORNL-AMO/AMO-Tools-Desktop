import { Component, OnInit, Input } from '@angular/core';
import { FlashTankOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';
import { SsmtDiagramTabService } from '../ssmt-diagram-tab.service';

@Component({
  selector: 'app-flash-tank-table',
  templateUrl: './flash-tank-table.component.html',
  styleUrls: ['./flash-tank-table.component.css']
})
export class FlashTankTableComponent implements OnInit {
  @Input()
  flashTank: FlashTankOutput;
  @Input()
  flashTankType: string;
  @Input()
  settings: Settings;
  constructor(private ssmtDiagramTabService: SsmtDiagramTabService) { }

  ngOnInit() {
    if (this.flashTankType != 'Condensate' && this.flashTankType != 'Blowdown') {
      this.flashTankType = this.flashTankType + ' Pressure Condensate';
    }
  }

  goToCalculator(){
    this.ssmtDiagramTabService.setFlashTankCalculator(this.flashTank);
  }
}

import { Component, OnInit, Input } from '@angular/core';
import { FlashTankOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

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
  constructor() { }

  ngOnInit() {
    if (this.flashTankType != 'Condensate' && this.flashTankType != 'Blowdown') {
      this.flashTankType = this.flashTankType + ' Pressure Condensate';
    }
  }

}

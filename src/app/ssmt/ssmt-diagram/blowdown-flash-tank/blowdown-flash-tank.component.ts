import { Component, OnInit, Input } from '@angular/core';
import { FlashTankOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-blowdown-flash-tank',
  templateUrl: './blowdown-flash-tank.component.html',
  styleUrls: ['./blowdown-flash-tank.component.css']
})
export class BlowdownFlashTankComponent implements OnInit {
  @Input()
  flashTank: FlashTankOutput;
  constructor() { }

  ngOnInit() {
  }

}

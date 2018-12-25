import { Component, OnInit, Input } from '@angular/core';
import { FlashTankOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-condensate-flash-tank',
  templateUrl: './condensate-flash-tank.component.html',
  styleUrls: ['./condensate-flash-tank.component.css']
})
export class CondensateFlashTankComponent implements OnInit {
  @Input()
  flashTank: FlashTankOutput;

  constructor() { }

  ngOnInit() {
  }

}

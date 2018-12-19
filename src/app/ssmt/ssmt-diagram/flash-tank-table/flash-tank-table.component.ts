import { Component, OnInit, Input } from '@angular/core';
import { FlashTankOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-flash-tank-table',
  templateUrl: './flash-tank-table.component.html',
  styleUrls: ['./flash-tank-table.component.css']
})
export class FlashTankTableComponent implements OnInit {
  @Input()
  flashTank: FlashTankOutput;
  constructor() { }

  ngOnInit() {
  }

}

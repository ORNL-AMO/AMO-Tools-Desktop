import { Component, OnInit, Input } from '@angular/core';
import { FlashTankOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-flash-tank-diagram',
  templateUrl: './flash-tank-diagram.component.html',
  styleUrls: ['./flash-tank-diagram.component.css']
})
export class FlashTankDiagramComponent implements OnInit {
  @Input()
  flashTank: FlashTankOutput;
  @Input()
  steamPressure: string;

  constructor() { }

  ngOnInit() {
  }

}

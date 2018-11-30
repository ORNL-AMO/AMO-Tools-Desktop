import { Component, OnInit, Input } from '@angular/core';
import { DeaeratorOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-deaerator-table',
  templateUrl: './deaerator-table.component.html',
  styleUrls: ['./deaerator-table.component.css']
})
export class DeaeratorTableComponent implements OnInit {
  @Input()
  deaerator: DeaeratorOutput;
  constructor() { }

  ngOnInit() {
  }

}

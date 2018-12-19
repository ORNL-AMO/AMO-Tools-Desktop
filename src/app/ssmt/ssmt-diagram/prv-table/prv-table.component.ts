import { Component, OnInit, Input } from '@angular/core';
import { PrvOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-prv-table',
  templateUrl: './prv-table.component.html',
  styleUrls: ['./prv-table.component.css']
})
export class PrvTableComponent implements OnInit {
  @Input()
  prv: PrvOutput;
  
  constructor() { }

  ngOnInit() {
  }

}

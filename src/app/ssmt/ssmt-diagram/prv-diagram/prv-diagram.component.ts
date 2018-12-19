import { Component, OnInit, Input } from '@angular/core';
import { PrvOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-prv-diagram',
  templateUrl: './prv-diagram.component.html',
  styleUrls: ['./prv-diagram.component.css']
})
export class PrvDiagramComponent implements OnInit {
  @Input()
  prv: PrvOutput;
  @Input()
  inletSteam: string;
  @Input()
  outletSteam: string;
  constructor() { }

  ngOnInit() {
  }

}

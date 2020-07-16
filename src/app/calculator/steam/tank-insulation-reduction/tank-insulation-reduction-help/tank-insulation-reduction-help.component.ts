import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-tank-insulation-reduction-help',
  templateUrl: './tank-insulation-reduction-help.component.html',
  styleUrls: ['./tank-insulation-reduction-help.component.css']
})
export class TankInsulationReductionHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}

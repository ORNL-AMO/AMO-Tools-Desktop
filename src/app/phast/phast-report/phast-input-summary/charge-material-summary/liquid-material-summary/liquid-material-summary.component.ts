import { Component, OnInit, Input } from '@angular/core';
import { LiquidChargeMaterial } from '../../../../../shared/models/phast/losses/chargeMaterial';
import { Modification } from '../../../../../shared/models/phast/phast';

@Component({
  selector: 'app-liquid-material-summary',
  templateUrl: './liquid-material-summary.component.html',
  styleUrls: ['./liquid-material-summary.component.css']
})
export class LiquidMaterialSummaryComponent implements OnInit {
  @Input()
  liquidMaterial: LiquidChargeMaterial;
  @Input()
  modifications: Array<Modification>;
  @Input()
  index: number;
  constructor() { }

  ngOnInit() {
  }

}

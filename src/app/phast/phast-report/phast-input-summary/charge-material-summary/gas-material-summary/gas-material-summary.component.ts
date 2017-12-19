import { Component, OnInit, Input } from '@angular/core';
import { GasChargeMaterial } from '../../../../../shared/models/phast/losses/chargeMaterial';
import { Modification } from '../../../../../shared/models/phast/phast';

@Component({
  selector: 'app-gas-material-summary',
  templateUrl: './gas-material-summary.component.html',
  styleUrls: ['./gas-material-summary.component.css']
})
export class GasMaterialSummaryComponent implements OnInit {
  @Input()
  gasMaterial: GasChargeMaterial;
  @Input()
  modifications: Array<Modification>;
  @Input()
  index: number;
  
  constructor() { }

  ngOnInit() {
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { SolidChargeMaterial } from '../../../../../shared/models/phast/losses/chargeMaterial';
import { Modification } from '../../../../../shared/models/phast/phast';

@Component({
  selector: 'app-solid-material-summary',
  templateUrl: './solid-material-summary.component.html',
  styleUrls: ['./solid-material-summary.component.css']
})
export class SolidMaterialSummaryComponent implements OnInit {
  @Input()
  solidMaterial: SolidChargeMaterial;
  @Input()
  modifications: Array<Modification>;
  @Input()
  index: number;
  constructor() { }

  ngOnInit() {
  }

}

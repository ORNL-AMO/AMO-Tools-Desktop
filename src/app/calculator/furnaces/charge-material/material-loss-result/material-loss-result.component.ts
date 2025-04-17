import { Component, Input, OnInit } from '@angular/core';
import { ChargeMaterialResult } from '../../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-material-loss-result',
    templateUrl: './material-loss-result.component.html',
    styleUrls: ['./material-loss-result.component.css'],
    standalone: false
})
export class MaterialLossResultComponent implements OnInit {

  @Input()
  lossResult: ChargeMaterialResult;
  @Input()
  settings: Settings;
  
  constructor() { }

  ngOnInit(): void {
  }

}

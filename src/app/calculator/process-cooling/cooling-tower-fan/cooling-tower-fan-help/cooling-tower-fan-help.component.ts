import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { CoolingTowerFanService } from '../cooling-tower-fan.service';

@Component({
  selector: 'app-cooling-tower-fan-help',
  templateUrl: './cooling-tower-fan-help.component.html',
  styleUrls: ['./cooling-tower-fan-help.component.css']
})
export class CoolingTowerFanHelpComponent implements OnInit {

  @Input()
  settings: Settings;
  
  currentFieldSub: Subscription;
  currentField: string;

  constructor(private coolingTowerFanService: CoolingTowerFanService) { }

  ngOnInit(): void {
    this.currentFieldSub = this.coolingTowerFanService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }
  
  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }

}

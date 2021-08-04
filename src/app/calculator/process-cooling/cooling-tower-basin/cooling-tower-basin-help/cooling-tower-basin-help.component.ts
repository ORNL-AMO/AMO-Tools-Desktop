import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { CoolingTowerService } from '../../cooling-tower/cooling-tower.service';

@Component({
  selector: 'app-cooling-tower-basin-help',
  templateUrl: './cooling-tower-basin-help.component.html',
  styleUrls: ['./cooling-tower-basin-help.component.css']
})
export class CoolingTowerBasinHelpComponent implements OnInit {

  @Input()
  settings: Settings;
  
  currentFieldSub: Subscription;
  currentField: string;

  constructor(private coolingTowerService: CoolingTowerService) { }

  ngOnInit(): void {
    this.currentFieldSub = this.coolingTowerService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }
  
  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }

}

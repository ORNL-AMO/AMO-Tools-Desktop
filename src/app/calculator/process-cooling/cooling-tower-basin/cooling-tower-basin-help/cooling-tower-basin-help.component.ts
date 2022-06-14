import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { CoolingTowerBasinService } from '../cooling-tower-basin.service';

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

  constructor(private coolingTowerBasinService: CoolingTowerBasinService) { }

  ngOnInit(): void {
    this.currentFieldSub = this.coolingTowerBasinService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }
  
  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }

}

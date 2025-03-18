import { Component, OnInit } from '@angular/core';
import { CoolingTowerService } from '../cooling-tower.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-cooling-tower-help',
    templateUrl: './cooling-tower-help.component.html',
    styleUrls: ['./cooling-tower-help.component.css'],
    standalone: false
})
export class CoolingTowerHelpComponent implements OnInit {
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

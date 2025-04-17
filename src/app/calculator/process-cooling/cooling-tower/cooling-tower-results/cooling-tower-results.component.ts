import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { CoolingTowerService } from '../cooling-tower.service';
import { Subscription } from 'rxjs';
import { CoolingTowerOutput } from '../../../../shared/models/chillers';

@Component({
    selector: 'app-cooling-tower-results',
    templateUrl: './cooling-tower-results.component.html',
    styleUrls: ['./cooling-tower-results.component.css'],
    standalone: false
})
export class CoolingTowerResultsComponent implements OnInit {

  coolingTowerOutput: CoolingTowerOutput;
  coolingTowerOutputSub: Subscription;

  @Input()
  settings: Settings;

  @ViewChild('savingsTable', { static: false }) savingsTable: ElementRef;
  savingsTableString: any;
  constructor(private coolingTowerService: CoolingTowerService) { }

  ngOnInit() {
    this.coolingTowerOutputSub = this.coolingTowerService.coolingTowerOutput.subscribe(value => {
      this.coolingTowerOutput = value;
    })
  }

  ngOnDestroy() {
    this.coolingTowerOutputSub.unsubscribe();
  }

  updateTableString() {
    this.savingsTableString = this.savingsTable.nativeElement.innerText;
  }

}

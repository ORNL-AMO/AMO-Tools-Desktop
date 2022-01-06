import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { EnergyUsage, TreasureHunt, TreasureHuntCo2EmissionsResults } from '../../../../shared/models/treasure-hunt';
import { TreasureHuntService } from '../../../treasure-hunt.service';

@Component({
  selector: 'app-carbon-emissions-summary-table',
  templateUrl: './carbon-emissions-summary-table.component.html',
  styleUrls: ['./carbon-emissions-summary-table.component.css']
})
export class CarbonEmissionsSummaryTableComponent implements OnInit {

  @Input()
  settings: Settings;
  
  energyUsage: EnergyUsage;

  treasureHuntSub: Subscription;
  treasureHunt: TreasureHunt;

  carbonResults: TreasureHuntCo2EmissionsResults;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  constructor(private treasureHuntService: TreasureHuntService) { }

  ngOnInit() {
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
      if (this.treasureHunt) {
        this.energyUsage = this.treasureHunt.currentEnergyUsage;
        this.carbonResults = this.treasureHunt.currentEnergyUsage.co2EmissionsResults;
      }
    });
  }

  ngOnDestroy() {
    this.treasureHuntSub.unsubscribe();
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }

}
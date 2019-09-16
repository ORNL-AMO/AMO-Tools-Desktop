import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { TreasureHunt, ImportExportOpportunities } from '../../shared/models/treasure-hunt';
import { Settings } from 'http2';
import { ModalDirective } from 'ngx-bootstrap';
import { TreasureHuntService } from '../treasure-hunt.service';
import { ImportOpportunitiesService } from './import-opportunities.service';
import { CalculatorsService } from '../calculators/calculators.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-treasure-chest',
  templateUrl: './treasure-chest.component.html',
  styleUrls: ['./treasure-chest.component.css']
})
export class TreasureChestComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  containerHeight: number;

  selectedCalc: string = 'none';
  selectedCalcSubscription: Subscription;
  constructor(private calculatorsService: CalculatorsService) { }

  ngOnInit() {
    this.selectedCalcSubscription = this.calculatorsService.selectedCalc.subscribe(val => {
      this.selectedCalc = val;
    });
  }

  ngOnDestroy(){
    this.selectedCalcSubscription.unsubscribe();
  }
}

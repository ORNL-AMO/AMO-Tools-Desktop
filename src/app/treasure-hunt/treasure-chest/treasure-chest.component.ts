import { Component, OnInit, Input } from '@angular/core';
import { CalculatorsService } from '../calculators/calculators.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';

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

import { Component, OnInit, Input } from '@angular/core';
import { CalculatorsService } from './calculators.service';
import { Subscription } from 'rxjs';
import { TreasureHunt, LightingReplacementTreasureHunt } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';
import { TreasureHuntService } from '../treasure-hunt.service';

@Component({
  selector: 'app-calculators',
  templateUrl: './calculators.component.html',
  styleUrls: ['./calculators.component.css']
})
export class CalculatorsComponent implements OnInit {
  @Input()
  settings: Settings;

  selectedCalc: string;
  selectedCalcSubscription: Subscription;
  treasureHunt: TreasureHunt;
  treasureHuntSub: Subscription;
  constructor(private calculatorsService: CalculatorsService, private treasureHuntService: TreasureHuntService) { }

  ngOnInit() {
    this.selectedCalcSubscription = this.calculatorsService.selectedCalc.subscribe(val => {
      this.selectedCalc = val;
    });
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
    })
  }

  ngOnDestroy() {
    this.selectedCalcSubscription.unsubscribe();
    this.treasureHuntSub.unsubscribe();
  }

  cancelEditLighting() {
    this.calculatorsService.cancelLightingCalc();
  }

  saveLighting(lightingReplacementTreasureHunt: LightingReplacementTreasureHunt) {
    if (this.calculatorsService.isNewOpportunity == true) {
      this.treasureHuntService.addNewLightingReplacementTreasureHuntItem(lightingReplacementTreasureHunt);
    } else {
      this.treasureHuntService.editLightingReplacementTreasureHuntItem(lightingReplacementTreasureHunt, this.calculatorsService.itemIndex);
    }
  }
}

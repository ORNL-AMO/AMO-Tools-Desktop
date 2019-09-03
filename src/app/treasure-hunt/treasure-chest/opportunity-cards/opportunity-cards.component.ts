import { Component, OnInit, Input } from '@angular/core';
import { TreasureHunt } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { OpportunityCardsService, OpportunityCardData } from './opportunity-cards.service';
import { CalculatorsService } from '../../calculators/calculators.service';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-opportunity-cards',
  templateUrl: './opportunity-cards.component.html',
  styleUrls: ['./opportunity-cards.component.css']
})
export class OpportunityCardsComponent implements OnInit {
  @Input()
  settings: Settings;

  opportunityCardsData: Array<OpportunityCardData>;
  treasureHuntSub: Subscription;
  treasureHunt: TreasureHunt;
  constructor(private opportunityCardsService: OpportunityCardsService, private calculatorsService: CalculatorsService, private treasureHuntService: TreasureHuntService) { }

  ngOnInit() {
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
      this.opportunityCardsData = this.opportunityCardsService.getOpportunityCardsData(this.treasureHunt, this.settings);
    })
  }

  ngOnDestroy() {
    this.treasureHuntSub.unsubscribe();
  }

  editOpportunity(opportunityCard: OpportunityCardData) {
    if (opportunityCard.opportunityType == 'lighting-replacement') {
      this.editLighting(opportunityCard);
    }
  }

  editLighting(lightingCard: OpportunityCardData) {
    this.calculatorsService.editLighting(lightingCard.lightingReplacement, lightingCard.opportunityIndex);
  }

}

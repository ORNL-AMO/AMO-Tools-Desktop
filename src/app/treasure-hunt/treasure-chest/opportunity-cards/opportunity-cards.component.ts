import { Component, OnInit, Input } from '@angular/core';
import { TreasureHunt } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { OpportunityCardsService } from './opportunity-cards.service';

@Component({
  selector: 'app-opportunity-cards',
  templateUrl: './opportunity-cards.component.html',
  styleUrls: ['./opportunity-cards.component.css']
})
export class OpportunityCardsComponent implements OnInit {
  @Input()
  treasureHunt: TreasureHunt;
  @Input()
  settings: Settings;

  constructor(private opportunityCardsService: OpportunityCardsService) { }

  ngOnInit() {
    let data = this.opportunityCardsService.getOpportunityCardsData(this.treasureHunt, this.settings);
    console.log(data);
  }

}

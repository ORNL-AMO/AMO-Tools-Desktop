import { Component, OnInit, Input } from '@angular/core';
import { TreasureHunt, FilterOption } from '../../../../shared/models/treasure-hunt';
import { TreasureChestMenuService } from '../treasure-chest-menu.service';
import { TreasureHuntService } from '../../../treasure-hunt.service';
import { OpportunityCardsService, OpportunityCardData } from '../../opportunity-cards/opportunity-cards.service';
import { SortCardsData } from '../../opportunity-cards/sort-cards-by.pipe';
import { Subscription } from 'rxjs';
import { SortCardsService } from '../../opportunity-cards/sort-cards.service';
import { Settings } from '../../../../shared/models/settings';
import * as _ from 'lodash';

@Component({
    selector: 'app-teams-dropdown',
    templateUrl: './teams-dropdown.component.html',
    styleUrls: ['./teams-dropdown.component.css'],
    standalone: false
})
export class TeamsDropdownComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inReport: boolean;

  teams: Array<FilterOption>;
  displayTeamDropdown: boolean = false;
  sortCardsData: SortCardsData;
  sortBySub: Subscription;
  constructor(private treasureChestMenuService: TreasureChestMenuService, private treasureHuntService: TreasureHuntService,
    private opportunityCardsService: OpportunityCardsService, private sortCardsService: SortCardsService) { }

  ngOnInit(): void {
    this.sortBySub = this.treasureChestMenuService.sortBy.subscribe(val => {
      this.sortCardsData = val;
      let treasureHunt: TreasureHunt = this.treasureHuntService.treasureHunt.getValue();
      let oppData = this.opportunityCardsService.getOpportunityCardsData(treasureHunt, this.settings);
      this.setTeams(oppData);
    });
  }

  ngOnDestroy() {
    this.sortBySub.unsubscribe();
  }

  toggleTeams() {
    this.displayTeamDropdown = !this.displayTeamDropdown;
  }

  setTeams(oppData: Array<OpportunityCardData>) {
    let allTeamNames: Array<string> = this.treasureChestMenuService.getAllTeams(oppData);

    let sortByCpy: SortCardsData = JSON.parse(JSON.stringify(this.sortCardsData));
    sortByCpy.teams = [];
    let sortedOppDataCpy: Array<OpportunityCardData> = this.sortCardsService.sortCards(JSON.parse(JSON.stringify(oppData)), sortByCpy);
    this.teams = new Array();
    allTeamNames.forEach(teamName => {
      this.teams.push({
        display: teamName,
        value: teamName,
        selected: this.sortCardsData.teams.find(team => { return teamName == team.value }) != undefined,
        numCalcs: this.getFilteredCalcsByTeam(sortedOppDataCpy, teamName).length
      });
    });
    let checkIsSelected: boolean = this.sortCardsData.teams.length == 0;
    this.teams.unshift({ display: 'All', value: 'All', numCalcs: sortedOppDataCpy.length, selected: checkIsSelected });
  }

  setSelectedTeam(selectedTeam: FilterOption) {
    let selectedFilters = this.treasureChestMenuService.getSelectedOptions(selectedTeam, this.teams);
    this.sortCardsData.teams = selectedFilters;
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }

  getFilteredCalcsByTeam(oppData: Array<OpportunityCardData>, selectedTeam: string): Array<OpportunityCardData> {
    let filteredCards: Array<OpportunityCardData> = _.filter(oppData, (data) => { return _.includes(data.teamName, selectedTeam) });
    return filteredCards;
  }
}

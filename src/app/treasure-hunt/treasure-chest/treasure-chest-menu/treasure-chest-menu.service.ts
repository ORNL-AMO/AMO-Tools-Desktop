import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { SortCardsData } from '../opportunity-cards/sort-cards-by.pipe';
import { OpportunitySheet } from '../../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../opportunity-cards/opportunity-cards.service';
@Injectable()
export class TreasureChestMenuService {

  selectAll: BehaviorSubject<boolean>
  sortBy: BehaviorSubject<SortCardsData>;
  deselectAll: BehaviorSubject<boolean>;
  showImportModal: BehaviorSubject<boolean>;
  showExportModal: BehaviorSubject<boolean>;
  constructor() {
    this.selectAll = new BehaviorSubject<boolean>(false);
    this.deselectAll = new BehaviorSubject<boolean>(false);
    let defaultData: SortCardsData = this.getDefaultSortByData();
    this.sortBy = new BehaviorSubject<SortCardsData>(defaultData);
    this.showImportModal = new BehaviorSubject<boolean>(false);
    this.showExportModal = new BehaviorSubject<boolean>(false);
  }

  getDefaultSortByData(): SortCardsData {
    let sortCardsData: SortCardsData = {
      sortBy: 'annualCostSavings',
      teams: [],
      equipments: [],
      utilityType: 'All',
      calculatorType: 'All'
    };
    return sortCardsData;
  }

  getAllEquipment(opportunityCardsData: Array<OpportunityCardData>): Array<string> {
    let equipmentNames: Array<string> = new Array();
    opportunityCardsData.forEach(item => {
      let equipmentName: string = this.getEquipmentName(item.opportunitySheet)
      if (equipmentNames) {
        equipmentNames.push(equipmentName);
      };
    });
    equipmentNames = _.uniq(equipmentNames);
    return equipmentNames;
  }


  getAllTeams(opportunityCardsData: Array<OpportunityCardData>): Array<string> {
    let teams: Array<string> = new Array();
    opportunityCardsData.forEach(item => {
      let teamName: string = this.getTeamName(item.opportunitySheet)
      if (teamName) {
        teams.push(teamName);
      };
    });
    teams = _.uniq(teams);
    return teams;
  }

  getTeamName(opportunitySheet: OpportunitySheet): string {
    if (opportunitySheet) {
      return opportunitySheet.owner;
    }
    return;
  }

  getEquipmentName(opportunitySheet: OpportunitySheet): string {
    if (opportunitySheet) {
      return opportunitySheet.equipment;
    }
    return;
  }
}

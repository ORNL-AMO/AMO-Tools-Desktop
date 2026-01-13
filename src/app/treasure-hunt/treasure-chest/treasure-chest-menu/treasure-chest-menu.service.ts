import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { SortCardsData } from '../opportunity-cards/sort-cards-by.pipe';
import { OpportunitySheet, FilterOption } from '../../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../opportunity-cards/opportunity-cards.service';
@Injectable()
export class TreasureChestMenuService {

  selectAll: BehaviorSubject<boolean>
  sortBy: BehaviorSubject<SortCardsData>;
  deselectAll: BehaviorSubject<boolean>;
  showImportModal: BehaviorSubject<boolean>;
  showExportModal: BehaviorSubject<boolean>;
  showTreasureChestModal: BehaviorSubject<boolean>;
  constructor() {
    this.selectAll = new BehaviorSubject<boolean>(false);
    this.deselectAll = new BehaviorSubject<boolean>(false);
    let defaultData: SortCardsData = this.getDefaultSortByData();
    this.sortBy = new BehaviorSubject<SortCardsData>(defaultData);
    this.showImportModal = new BehaviorSubject<boolean>(false);
    this.showExportModal = new BehaviorSubject<boolean>(false);
    this.showTreasureChestModal = new BehaviorSubject<boolean>(false);
  }

  getDefaultSortByData(): SortCardsData {
    let sortCardsData: SortCardsData = {
      sortBy: 'annualCostSavings',
      teams: [],
      equipments: [],
      utilityTypes: [],
      calculatorTypes: []
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

    //pass clicked option (selectedOption) and corresponding list to get all selected options
    getSelectedOptions(selectedOption: FilterOption, optionList: Array<FilterOption>): Array<{ display: string, value: string }> {
      let selected: Array<{ display: string, value: string }> = new Array();
      //if the selection isn't all
      if (selectedOption.value != 'All') {
        selectedOption.selected = !selectedOption.selected;
        optionList.forEach(option => {
          //set All to false if an option is selected
          if (selectedOption.selected && option.value == 'All') {
            option.selected = false;
          }
          //add every selected option
          if (option.selected == true) {
            selected.push({ display: option.display, value: option.value });
          }
        });
        //if none selected select all
        if (selected.length == 0) {
          let allOption: FilterOption = optionList.find(option => { return option.value == 'All' });
          allOption.selected = true;
        }
      } else {
        optionList.forEach(option => {
          if (option.value == 'All') {
            option.selected = true;
          } else {
            option.selected = false
          }
        });
      }
      return selected;
    }
}

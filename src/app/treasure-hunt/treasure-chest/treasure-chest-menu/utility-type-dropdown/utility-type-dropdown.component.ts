import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { FilterOption, TreasureHunt } from '../../../../shared/models/treasure-hunt';
import { OpportunityCardsService, OpportunityCardData } from '../../opportunity-cards/opportunity-cards.service';
import { TreasureChestMenuService } from '../treasure-chest-menu.service';
import { Subscription } from 'rxjs';
import { SortCardsData } from '../../opportunity-cards/sort-cards-by.pipe';
import { TreasureHuntService } from '../../../treasure-hunt.service';
import { Settings } from '../../../../shared/models/settings';
import { SortCardsService } from '../../opportunity-cards/sort-cards.service';
import * as _ from 'lodash';
@Component({
    selector: 'app-utility-type-dropdown',
    templateUrl: './utility-type-dropdown.component.html',
    styleUrls: ['./utility-type-dropdown.component.css'],
    standalone: false
})
export class UtilityTypeDropdownComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  dropdownShown: boolean

  utilityTypeOptions: Array<FilterOption> = [];
  sortBySub: Subscription;
  sortCardsData: SortCardsData;
  displayUtilityTypeDropdown: boolean = false;
  constructor(private opportuntityCardsService: OpportunityCardsService, private treasureChestMenuService: TreasureChestMenuService,
    private treasureHuntService: TreasureHuntService, private sortCardsService: SortCardsService) { }

  ngOnInit(): void {
    this.sortBySub = this.treasureChestMenuService.sortBy.subscribe(val => {
      this.sortCardsData = val;
      let treasureHunt: TreasureHunt = this.treasureHuntService.treasureHunt.getValue();
      let oppData = this.opportuntityCardsService.getOpportunityCardsData(treasureHunt, this.settings);
      this.setUtilityTypeOptions(oppData);
    });
  }

  ngOnChanges(changes: SimpleChanges){
    if (!this.dropdownShown && !changes.dropdownShown.firstChange){
      this.displayUtilityTypeDropdown = false;
    }
  }

  ngOnDestroy() {
    this.sortBySub.unsubscribe();
  }

  setSelectedUtilityType(utilityOption: FilterOption) {
    let selectedFilters = this.treasureChestMenuService.getSelectedOptions(utilityOption, this.utilityTypeOptions);
    this.sortCardsData.utilityTypes = selectedFilters;
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }

  setUtilityTypeOptions(oppData: Array<OpportunityCardData>) {
    let allCardUtilities: Array<string> = _.flatMap(oppData, oppDataItem => { return oppDataItem.utilityType });
    allCardUtilities = _.uniq(allCardUtilities);
    let sortByCpy: SortCardsData = JSON.parse(JSON.stringify(this.sortCardsData));
    sortByCpy.utilityTypes = [];
    let sortedOppDataCpy: Array<OpportunityCardData> = this.sortCardsService.sortCards(JSON.parse(JSON.stringify(oppData)), sortByCpy);
    this.utilityTypeOptions = new Array();
    allCardUtilities.forEach(utility => {
      this.addUtilityOption(utility, sortedOppDataCpy, this.utilityTypeOptions);
    });
    let checkIsSelected: boolean = this.sortCardsData.utilityTypes.length == 0;
    this.utilityTypeOptions.unshift({ display: 'All', value: 'All', numCalcs: sortedOppDataCpy.length, selected: checkIsSelected });
  }

  addUtilityOption(utilityStr: string, oppData: Array<OpportunityCardData>, utilityTypeOptions: Array<FilterOption>) {
    let numUtility: number = this.getFilteredCalcsByUtility(oppData, utilityStr).length;
    let checkIsSelected: { display: string, value: string } = this.sortCardsData.utilityTypes.find(utilityType => { return utilityType.value == utilityStr });
    utilityTypeOptions.push({ display: utilityStr, value: utilityStr, numCalcs: numUtility, selected: checkIsSelected != undefined });
  }

  getFilteredCalcsByUtility(oppData: Array<OpportunityCardData>, utilityType: string): Array<OpportunityCardData> {
    let filteredCards: Array<OpportunityCardData> = _.filter(oppData, (data) => { return _.includes(data.utilityType, utilityType) });
    return filteredCards;
  }

  toggleUtilityType() {
    this.displayUtilityTypeDropdown = !this.displayUtilityTypeDropdown;
  }
}

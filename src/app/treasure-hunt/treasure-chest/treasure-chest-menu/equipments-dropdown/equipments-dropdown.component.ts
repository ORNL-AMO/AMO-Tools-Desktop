import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FilterOption, TreasureHunt } from '../../../../shared/models/treasure-hunt';
import { SortCardsData } from '../../opportunity-cards/sort-cards-by.pipe';
import { Subscription } from 'rxjs';
import { OpportunityCardsService, OpportunityCardData } from '../../opportunity-cards/opportunity-cards.service';
import { TreasureChestMenuService } from '../treasure-chest-menu.service';
import { SortCardsService } from '../../opportunity-cards/sort-cards.service';
import { TreasureHuntService } from '../../../treasure-hunt.service';
import { processEquipmentOptions } from '../../../calculators/opportunity-sheet/general-details-form/processEquipmentOptions';
import * as _ from 'lodash';

@Component({
    selector: 'app-equipments-dropdown',
    templateUrl: './equipments-dropdown.component.html',
    styleUrls: ['./equipments-dropdown.component.css'],
    standalone: false
})
export class EquipmentsDropdownComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inReport: boolean;

  
  equipments: Array<FilterOption>;
  displayEquipment: boolean = false;
  sortCardsData: SortCardsData;
  sortBySub: Subscription;

  constructor(private opportuntityCardsService: OpportunityCardsService, private treasureChestMenuService: TreasureChestMenuService,
    private treasureHuntService: TreasureHuntService, private sortCardsService: SortCardsService) { }

  ngOnInit() {
    this.sortBySub = this.treasureChestMenuService.sortBy.subscribe(val => {
      this.sortCardsData = val;
      let treasureHunt: TreasureHunt = this.treasureHuntService.treasureHunt.getValue();
      let oppData = this.opportuntityCardsService.getOpportunityCardsData(treasureHunt, this.settings);
      this.setEquipments(oppData);
    });
  }

  ngOnDestroy(){
    this.sortBySub.unsubscribe();
  }

  toggleEquipment() {
    this.displayEquipment = !this.displayEquipment;
  }

  setEquipments(oppData: Array<OpportunityCardData>) {
    let allEquipmentNames: Array<string> = this.treasureChestMenuService.getAllEquipment(JSON.parse(JSON.stringify(oppData)));
    let sortByCpy: SortCardsData = JSON.parse(JSON.stringify(this.sortCardsData));
    sortByCpy.equipments = [];
    let sortedOppDataCpy: Array<OpportunityCardData> = this.sortCardsService.sortCards(JSON.parse(JSON.stringify(oppData)), sortByCpy);
    this.equipments = new Array();
    allEquipmentNames.forEach(equipment => {
      let equipmentVal: { value: string, display: string } = processEquipmentOptions.find(option => { return option.value == equipment });
      if (equipmentVal) {
        this.equipments.push({
          display: equipmentVal.display,
          value: equipmentVal.value,
          selected: this.sortCardsData.equipments.find(equipment => { return equipmentVal.value == equipment.value }) != undefined,
          numCalcs: this.getFilteredCalcsByEquipment(sortedOppDataCpy, equipmentVal.value).length
        });
      }
    });
    let checkIsSelected: boolean = this.sortCardsData.equipments.length == 0;
    this.equipments.unshift({ display: 'All', value: 'All', numCalcs: sortedOppDataCpy.length, selected: checkIsSelected });
  }

  setSelectedEquipment(option: FilterOption) {
    let selectedFilters = this.treasureChestMenuService.getSelectedOptions(option, this.equipments)
    this.sortCardsData.equipments = selectedFilters;
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  } 
  
  getFilteredCalcsByEquipment(oppData: Array<OpportunityCardData>, equipment: string): Array<OpportunityCardData> {
    let filteredCards: Array<OpportunityCardData> = _.filter(oppData, (item: OpportunityCardData) => {
      if (item.opportunitySheet) {
        return _.includes(item.opportunitySheet.equipment, equipment);
      } else {
        return false;
      }
    });
    return filteredCards;
  }

}

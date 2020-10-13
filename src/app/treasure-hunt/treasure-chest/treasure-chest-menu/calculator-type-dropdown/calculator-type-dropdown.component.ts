import { Component, OnInit, Input } from '@angular/core';
import { FilterOption, TreasureHunt } from '../../../../shared/models/treasure-hunt';
import { Settings } from '../../../../shared/models/settings';
import { TreasureChestMenuService } from '../treasure-chest-menu.service';
import { SortCardsData } from '../../opportunity-cards/sort-cards-by.pipe';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { SortCardsService } from '../../opportunity-cards/sort-cards.service';
import { OpportunityCardsService, OpportunityCardData } from '../../opportunity-cards/opportunity-cards.service';
import { TreasureHuntService } from '../../../treasure-hunt.service';

@Component({
  selector: 'app-calculator-type-dropdown',
  templateUrl: './calculator-type-dropdown.component.html',
  styleUrls: ['./calculator-type-dropdown.component.css']
})
export class CalculatorTypeDropdownComponent implements OnInit {
  @Input()
  settings: Settings;

  displayCalculatorTypeDropdown: boolean = false;
  calculatorTypeOptions: Array<FilterOption> = [];
  sortCardsData: SortCardsData;
  sortBySub: Subscription;
  constructor(private opportuntityCardsService: OpportunityCardsService, private treasureChestMenuService: TreasureChestMenuService,
    private treasureHuntService: TreasureHuntService, private sortCardsService: SortCardsService) { }

  ngOnInit(): void {
    this.sortBySub = this.treasureChestMenuService.sortBy.subscribe(val => {
      this.sortCardsData = val;
      let treasureHunt: TreasureHunt = this.treasureHuntService.treasureHunt.getValue();
      let oppData = this.opportuntityCardsService.getOpportunityCardsData(treasureHunt, this.settings);
      this.setCalculatorOptions(oppData);
    });
  }

  ngOnDestroy() {
    this.sortBySub.unsubscribe();
  }

  toggleCalculatorType() {
    this.displayCalculatorTypeDropdown = !this.displayCalculatorTypeDropdown;
  }

  setSelectedCalculator(calcOption: FilterOption) {
    let selectedFilters = this.treasureChestMenuService.getSelectedOptions(calcOption, this.calculatorTypeOptions);
    this.sortCardsData.calculatorTypes = selectedFilters;
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }

  setCalculatorOptions(oppData: Array<OpportunityCardData>) {
    let calculatorsUsed: Array<string> = oppData.map(oppDataItem => { return oppDataItem.opportunityType });
    calculatorsUsed = _.uniq(calculatorsUsed);
    let sortByCpy: SortCardsData = JSON.parse(JSON.stringify(this.sortCardsData));
    sortByCpy.calculatorTypes = [];
    let sortedOppDataCpy: Array<OpportunityCardData> = this.sortCardsService.sortCards(JSON.parse(JSON.stringify(oppData)), sortByCpy);
    this.calculatorTypeOptions = new Array();
    calculatorsUsed.forEach(calculatorType => {
      let calculatorDisplay: string = this.getCalculatorDisplay(calculatorType);
      this.addCalculatorOption({ display: calculatorDisplay, value: calculatorType }, sortedOppDataCpy, this.calculatorTypeOptions);
    })
    let checkIsSelected: boolean = this.sortCardsData.calculatorTypes.length == 0;
    this.calculatorTypeOptions.unshift({ display: 'All', value: 'All', numCalcs: sortedOppDataCpy.length, selected: checkIsSelected });
  }

  addCalculatorOption(calcOption: { display: string, value: string }, oppData: Array<OpportunityCardData>, calculatorTypeOptions: Array<FilterOption>) {
    let numCalcs: number = this.getFilteredCalcsByCalculator(oppData, calcOption.value).length;
    let checkIsSelected: { display: string, value: string } = this.sortCardsData.calculatorTypes.find(calculatorType => { return calculatorType.value == calcOption.value });
    calculatorTypeOptions.push({ display: calcOption.display, value: calcOption.value, numCalcs: numCalcs, selected: checkIsSelected != undefined });
  }

  getFilteredCalcsByCalculator(oppData: Array<OpportunityCardData>, calculatorType: string): Array<OpportunityCardData> {
    let filteredCards: Array<OpportunityCardData> = _.filter(oppData, (data) => { return _.includes(data.opportunityType, calculatorType) });
    return filteredCards;
  }

  getCalculatorDisplay(calculator: string): string {
    switch (calculator) {
      case 'lighting-replacement':
        return 'Lighting Replacement';
      case 'opportunity-sheet':
        return 'Opportunity Sheet';
      case 'replace-existing':
        return 'Replace Existing Motor';
      case 'motor-drive':
        return 'Motor Drive';
      case 'natural-gas-reduction':
        return 'Natural Gas Reduction';
      case 'electricity-reduction':
        return 'Electricity Reduction';
      case 'compressed-air-reduction':
        return 'Compressed Air Reduction';
      case 'compressed-air-pressure-reduction':
        return 'Compressed Air Pressure Reduction';
      case 'water-reduction':
        return 'Water Reduction';
      case 'steam-reduction':
        return 'Steam Reduction';
      case 'pipe-insulation-reduction':
        return 'Pipe Insulation';
      case 'tank-insulation-reduction':
        return 'Tank Insulation';
      case 'air-leak-survey':
        return 'Air Leak Survey';
    }
  }
}

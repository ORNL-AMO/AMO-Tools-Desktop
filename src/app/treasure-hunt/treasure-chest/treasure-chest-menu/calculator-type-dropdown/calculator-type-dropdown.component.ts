import { Component, OnInit, Input } from '@angular/core';
import { FilterOption, Treasure, TreasureHunt } from '../../../../shared/models/treasure-hunt';
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
      case Treasure.lightingReplacement:
        return 'Lighting Replacement';
      case Treasure.opportunitySheet:
        return 'Opportunity Sheet';
      case Treasure.replaceExisting:
        return 'Replace Existing Motor';
      case Treasure.motorDrive:
        return 'Motor Drive';
      case Treasure.naturalGasReduction:
        return 'Natural Gas Reduction';
      case Treasure.electricityReduction:
        return 'Electricity Reduction';
      case Treasure.compressedAir:
        return 'Compressed Air Reduction';
      case Treasure.compressedAirPressure:
        return 'Compressed Air Pressure Reduction';
      case Treasure.waterReduction:
        return 'Water Reduction';
      case Treasure.steamReduction:
        return 'Steam Reduction';
      case Treasure.pipeInsulation:
        return 'Pipe Insulation';
      case Treasure.tankInsulation:
        return 'Tank Insulation';
      case Treasure.airLeak:
        return 'Air Leak Survey';
      case Treasure.flueGas:
        return 'Flue Gas';
      case Treasure.wallLoss:
        return 'Wall Loss';
      case Treasure.airHeating:
        return 'Air Heating'
      case Treasure.leakageLoss:
        return 'Leakage Loss';
      case Treasure.wasteHeat:
        return 'Waste Heat';
      case Treasure.openingLoss:
        return 'Opening Loss'
      case Treasure.heatCascading:
        return 'Heat Cascading'
      case Treasure.waterHeating:
        return 'Water Heating'
      case Treasure.chillerStaging:
        return 'Chiller Staging'
    }
  }
}

import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { TreasureHunt, FilterOption } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { TreasureChestMenuService } from './treasure-chest-menu.service';
import { SortCardsData } from '../opportunity-cards/sort-cards-by.pipe';
import { OpportunityCardsService, OpportunityCardData } from '../opportunity-cards/opportunity-cards.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { processEquipmentOptions } from '../../calculators/opportunity-sheet/general-details-form/processEquipmentOptions';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { SortCardsService } from '../opportunity-cards/sort-cards.service';

@Component({
  selector: 'app-treasure-chest-menu',
  templateUrl: './treasure-chest-menu.component.html',
  styleUrls: ['./treasure-chest-menu.component.css'],
  animations: [
    trigger('menuModal', [
      state('show', style({
        top: '20px',
        bottom: '20px'
      })),
      transition('hide => show', animate('.5s ease-in')),
      transition('show => hide', animate('.5s ease-out'))
    ])
  ]
})
export class TreasureChestMenuComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inReport: boolean;

  @ViewChild('navbar', { static: false }) navbar: ElementRef;
  navbarWidth: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getNavbarWidth();
  }

  // teams: Array<FilterOption>;
  equipments: Array<FilterOption>;

  displayEquipment: boolean = false;
  displayAdditionalFiltersDropdown: string = 'hide';
  sortByDropdown: boolean = false;
  treasureHunt: TreasureHunt;
  sortCardsData: SortCardsData;
  sortBySub: Subscription;
  sortByLabel: string;
  opportunityCardsSub: Subscription;
  opportunityCardsData: Array<OpportunityCardData>;

  showImportModal: boolean;
  showImportModalSub: Subscription;
  showExportModal: boolean;
  showExportModalSub: Subscription;
  constructor(private opportuntityCardsService: OpportunityCardsService, private treasureChestMenuService: TreasureChestMenuService,
    private treasureHuntService: TreasureHuntService, private sortCardsService: SortCardsService) { }

  ngOnInit() {
    this.sortBySub = this.treasureChestMenuService.sortBy.subscribe(val => {
      this.sortCardsData = val;
      this.setSortByLabel();
      let treasureHunt: TreasureHunt = this.treasureHuntService.treasureHunt.getValue();
      let oppData = this.opportuntityCardsService.getOpportunityCardsData(treasureHunt, this.settings);
      // this.setTeams(oppData);
      this.setEquipments(oppData);
      //this.setUtilityTypeOptions(oppData);
      // this.setCalculatorOptions(oppData);
    });


    this.opportunityCardsSub = this.opportuntityCardsService.opportunityCards.subscribe(val => {
      this.opportunityCardsData = val;
    });

    this.showImportModalSub = this.treasureChestMenuService.showImportModal.subscribe(val => {
      this.showImportModal = val;
    });

    this.showExportModalSub = this.treasureChestMenuService.showExportModal.subscribe(val => {
      this.showExportModal = val;
    });

  }

  ngOnDestroy() {
    this.sortBySub.unsubscribe();
    this.opportunityCardsSub.unsubscribe();
    this.showImportModalSub.unsubscribe();
    this.showExportModalSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.getNavbarWidth();
  }


  toggleEquipment() {
    this.displayEquipment = !this.displayEquipment;
  }

  toggleAdditionalFilters() {
    if (this.displayAdditionalFiltersDropdown == 'hide') {
      this.displayAdditionalFiltersDropdown = 'show';
    } else {
      this.displayAdditionalFiltersDropdown = 'hide';
    }
  }

  toggleSortBy() {
    this.sortByDropdown = !this.sortByDropdown;
  }

  selectAll() {
    this.treasureChestMenuService.selectAll.next(true);
    this.treasureChestMenuService.selectAll.next(false);
  }

  deselectAll() {
    this.treasureChestMenuService.deselectAll.next(true);
    this.treasureChestMenuService.deselectAll.next(false);
  }

  setEquipments(oppData: Array<OpportunityCardData>) {
    let sortByCpy: SortCardsData = JSON.parse(JSON.stringify(this.sortCardsData));
    sortByCpy.equipments = [];
    let sortedOppDataCpy: Array<OpportunityCardData> = this.sortCardsService.sortCards(JSON.parse(JSON.stringify(oppData)), sortByCpy);
    let allEquipmentNames: Array<string> = this.treasureChestMenuService.getAllEquipment(sortedOppDataCpy);
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
    let selectedFilters = this.getSelectedOptions(option, this.equipments)
    this.sortCardsData.equipments = selectedFilters;
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
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

  // removeTeam(teamName: string, index: number) {
  //   this.sortCardsData.teams.splice(index, 1);
  //   this.teams.forEach(team => {
  //     if (team.value == teamName) {
  //       team.selected = false;
  //     }
  //   });
  //   if (this.sortCardsData.teams.length == 0) {
  //     let allOption: FilterOption = this.teams.find(option => { return option.value == 'All' });
  //     allOption.selected = true;
  //   }
  //   this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  // }

  removeEquipment(equipmentItem: { display: string, value: string }, index: number) {
    this.sortCardsData.equipments.splice(index, 1);
    this.equipments.forEach(equipment => {
      if (equipment.value == equipmentItem.value) {
        equipment.selected = false;
      }
    });
    if (this.sortCardsData.equipments.length == 0) {
      let allOption: FilterOption = this.equipments.find(option => { return option.value == 'All' });
      allOption.selected = true;
    }
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }

  // removeCalculator(calculatorItem: { display: string, value: string }, index: number) {
  //   this.sortCardsData.calculatorTypes.splice(index, 1);
  //   this.calculatorTypeOptions.forEach(calculator => {
  //     if (calculator.value == calculatorItem.value) {
  //       calculator.selected = false;
  //     }
  //   });
  //   if (this.sortCardsData.calculatorTypes.length == 0) {
  //     let allOption: FilterOption = this.calculatorTypeOptions.find(option => { return option.value == 'All' });
  //     allOption.selected = true;
  //   }
  //   this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  // }

  // removeUtilityType(utilityItem: { display: string, value: string }, index: number) {
  //   this.sortCardsData.utilityTypes.splice(index, 1);
  //   this.utilityTypeOptions.forEach(utility => {
  //     if (utility.value == utilityItem.value) {
  //       utility.selected = false;
  //     }
  //   });
  //   if (this.sortCardsData.utilityTypes.length == 0) {
  //     let allOption: FilterOption = this.utilityTypeOptions.find(option => { return option.value == 'All' });
  //     allOption.selected = true;
  //   }
  //   this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  // }


  setSortBy(str: string) {
    this.sortCardsData.sortBy = str;
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
    this.toggleSortBy();
  }

  setSortByLabel() {
    if (this.sortCardsData.sortBy == 'annualCostSavings') {
      this.sortByLabel = 'Annual Savings';
    } else if (this.sortCardsData.sortBy == 'teamName') {
      this.sortByLabel = 'Team';
    } else if (this.sortCardsData.sortBy == 'name') {
      this.sortByLabel = 'Equipment Name';
    } else if (this.sortCardsData.sortBy == 'implementationCost') {
      this.sortByLabel = 'Implementation Cost';
    } else if (this.sortCardsData.sortBy == 'paybackPeriod') {
      this.sortByLabel = 'Payback Period';
    }
  }

  clearAllFilters() {
    this.sortCardsData.teams = [];
    this.sortCardsData.equipments = [];
    this.sortCardsData.utilityTypes = [];
    this.sortCardsData.calculatorTypes = [];
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
    // this.teams.forEach(team => {
    //   if (team.value != 'All') {
    //     team.selected = false;
    //   } else {
    //     team.selected = true;
    //   }
    // })
    this.equipments.forEach(equipment => {
      if (equipment.value != 'All') {
        equipment.selected = false;
      } else {
        equipment.selected = true;
      }
    })
    // this.calculatorTypeOptions.forEach(option => {
    //   if (option.value != 'All') {
    //     option.selected = false;
    //   } else {
    //     option.selected = true;
    //   }
    // })
    // this.utilityTypeOptions.forEach(option => {
    //   if (option.value != 'All') {
    //     option.selected = false;
    //   } else {
    //     option.selected = true;
    //   }
    // })
    this.treasureChestMenuService.showImportModal.next(false);
    this.treasureChestMenuService.showExportModal.next(false);
  }

  getNavbarWidth() {
    if (this.navbar) {
      setTimeout(() => {
        this.navbarWidth = this.navbar.nativeElement.clientWidth * .95;
      }, 100);
    }
  }

  // setSelectedCalculator(calcOption: FilterOption) {
  //   let selectedFilters = this.getSelectedOptions(calcOption, this.calculatorTypeOptions);
  //   this.sortCardsData.calculatorTypes = selectedFilters;
  //   this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  // }

  // setCalculatorOptions(oppData: Array<OpportunityCardData>) {
  //   let sortByCpy: SortCardsData = JSON.parse(JSON.stringify(this.sortCardsData));
  //   sortByCpy.calculatorTypes = [];
  //   let sortedOppDataCpy: Array<OpportunityCardData> = this.sortCardsService.sortCards(JSON.parse(JSON.stringify(oppData)), sortByCpy);
  //   this.calculatorTypeOptions = new Array();
  //   this.addCalculatorOption({ display: 'Lighting Replacement', value: 'lighting-replacement' }, sortedOppDataCpy, this.calculatorTypeOptions);
  //   this.addCalculatorOption({ display: 'Opportunity Sheet', value: 'opportunity-sheet' }, sortedOppDataCpy, this.calculatorTypeOptions);
  //   this.addCalculatorOption({ display: 'Replace Existing Motor', value: 'replace-existing' }, sortedOppDataCpy, this.calculatorTypeOptions);
  //   this.addCalculatorOption({ display: 'Motor Drive', value: 'motor-drive' }, sortedOppDataCpy, this.calculatorTypeOptions);
  //   this.addCalculatorOption({ display: 'Natural Gas Reduction', value: 'natural-gas-reduction' }, sortedOppDataCpy, this.calculatorTypeOptions);
  //   this.addCalculatorOption({ display: 'Electricity Reduction', value: 'electricity-reduction' }, sortedOppDataCpy, this.calculatorTypeOptions);
  //   this.addCalculatorOption({ display: 'Compressed Air Reduction', value: 'compressed-air-reduction' }, sortedOppDataCpy, this.calculatorTypeOptions);
  //   this.addCalculatorOption({ display: 'Compressed Air Pressure Reduction', value: 'compressed-air-pressure-reduction' }, sortedOppDataCpy, this.calculatorTypeOptions);
  //   this.addCalculatorOption({ display: 'Water Reduction', value: 'water-reduction' }, sortedOppDataCpy, this.calculatorTypeOptions);
  //   this.addCalculatorOption({ display: 'Steam Reduction', value: 'steam-reduction' }, sortedOppDataCpy, this.calculatorTypeOptions);
  //   this.addCalculatorOption({ display: 'Pipe Insulation Reduction', value: 'pipe-insulation-reduction' }, sortedOppDataCpy, this.calculatorTypeOptions);
  //   let checkIsSelected: boolean = this.sortCardsData.calculatorTypes.length == 0;
  //   this.calculatorTypeOptions.unshift({ display: 'All', value: 'All', numCalcs: sortedOppDataCpy.length, selected: checkIsSelected });
  // }

  // addCalculatorOption(calcOption: { display: string, value: string }, oppData: Array<OpportunityCardData>, calculatorTypeOptions: Array<FilterOption>) {
  //   let numCalcs: number = this.getFilteredCalcsByCalculator(oppData, calcOption.value).length;
  //   if (numCalcs != 0) {
  //     let checkIsSelected: { display: string, value: string } = this.sortCardsData.calculatorTypes.find(calculatorType => { return calculatorType.value == calcOption.value });
  //     calculatorTypeOptions.push({ display: calcOption.display, value: calcOption.value, numCalcs: numCalcs, selected: checkIsSelected != undefined });
  //   }
  // }

  // getFilteredCalcsByCalculator(oppData: Array<OpportunityCardData>, calculatorType: string): Array<OpportunityCardData> {
  //   let filteredCards: Array<OpportunityCardData> = _.filter(oppData, (data) => { return _.includes(data.opportunityType, calculatorType) });
  //   return filteredCards;
  // }

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

  openImportModal() {
    this.treasureChestMenuService.showImportModal.next(true);
  }

  openExportModal() {
    this.treasureChestMenuService.showExportModal.next(true);
  }
}

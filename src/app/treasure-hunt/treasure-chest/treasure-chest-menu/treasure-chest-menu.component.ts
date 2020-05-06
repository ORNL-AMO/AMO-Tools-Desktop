import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { TreasureHunt } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { TreasureChestMenuService } from './treasure-chest-menu.service';
import { SortCardsData } from '../opportunity-cards/sort-cards-by.pipe';
import { OpportunityCardsService, OpportunityCardData } from '../opportunity-cards/opportunity-cards.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

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
  constructor(private opportuntityCardsService: OpportunityCardsService, private treasureChestMenuService: TreasureChestMenuService) { }

  ngOnInit() {
    this.sortBySub = this.treasureChestMenuService.sortBy.subscribe(val => {
      this.sortCardsData = val;
      this.setSortByLabel();
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

  // removeEquipment(equipmentItem: { display: string, value: string }, index: number) {
  //   this.sortCardsData.equipments.splice(index, 1);
  //   this.equipments.forEach(equipment => {
  //     if (equipment.value == equipmentItem.value) {
  //       equipment.selected = false;
  //     }
  //   });
  //   if (this.sortCardsData.equipments.length == 0) {
  //     let allOption: FilterOption = this.equipments.find(option => { return option.value == 'All' });
  //     allOption.selected = true;
  //   }
  //   this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  // }

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
    // this.equipments.forEach(equipment => {
    //   if (equipment.value != 'All') {
    //     equipment.selected = false;
    //   } else {
    //     equipment.selected = true;
    //   }
    // })
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

  openImportModal() {
    this.treasureChestMenuService.showImportModal.next(true);
  }

  openExportModal() {
    this.treasureChestMenuService.showExportModal.next(true);
  }
}

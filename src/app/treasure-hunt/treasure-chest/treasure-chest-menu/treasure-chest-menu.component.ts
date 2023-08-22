import { Component, OnInit, Input, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { TreasureChestMenuService } from './treasure-chest-menu.service';
import { SortCardsData } from '../opportunity-cards/sort-cards-by.pipe';
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
  sortCardsData: SortCardsData;
  sortBySub: Subscription;
  sortByLabel: string;

  showImportModal: boolean;
  showImportModalSub: Subscription;
  showExportModal: boolean;
  showExportModalSub: Subscription;

  bannerCollapsed: boolean = true;
  dropdownCollapsed: boolean = true;

  constructor(private treasureChestMenuService: TreasureChestMenuService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.sortBySub = this.treasureChestMenuService.sortBy.subscribe(val => {
      this.sortCardsData = val;
      this.setSortByLabel();
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

  removeTeam(index: number) {
    this.sortCardsData.teams.splice(index, 1);
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }

  removeEquipment(index: number) {
    this.sortCardsData.equipments.splice(index, 1);
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }

  removeCalculator(index: number) {
    this.sortCardsData.calculatorTypes.splice(index, 1);
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }

  removeUtilityType(index: number) {
    this.sortCardsData.utilityTypes.splice(index, 1);
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }


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
    this.treasureChestMenuService.showImportModal.next(false);
    this.treasureChestMenuService.showExportModal.next(false);
  }

  getNavbarWidth() {
    if (this.navbar) {
      this.navbarWidth = this.navbar.nativeElement.clientWidth * .95;
      if(window.innerWidth > 991){
        this.bannerCollapsed = false;
      } 
    }
    this.cd.detectChanges();
  }

  openImportModal() {
    this.treasureChestMenuService.showImportModal.next(true);
  }

  openExportModal() {
    this.treasureChestMenuService.showExportModal.next(true);
  }
  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  collapseDropdown(){
    this.dropdownCollapsed = !this.dropdownCollapsed;
  }

}

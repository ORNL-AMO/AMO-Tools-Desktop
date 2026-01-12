import { Component, OnInit, Input, HostListener, ViewChild, ElementRef } from '@angular/core';
import { OpportunityForFiltering, TreasureHunt, opportunities } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';
import { CalculatorsService } from '../calculators/calculators.service';
import { Subscription } from 'rxjs';
import { TreasureHuntService } from '../treasure-hunt.service';
import { OpportunityCardsService } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Component({
    selector: 'app-find-treasure',
    templateUrl: './find-treasure.component.html',
    styleUrls: ['./find-treasure.component.css'],
    standalone: false
})
export class FindTreasureComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('content', { static: false }) content: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resize();
  }

  showOpportunitySheetOnSave: boolean;
  displayCalculatorType: string = 'All';
  displayModuleType: string = 'All';
  filteredOpportunityCardList: OpportunityForFiltering[] = [];

  selectedCalcSubscription: Subscription;
  selectedCalc: string;
  treasureHunt: TreasureHunt;
  treasureHuntSub: Subscription;
  infoCardCollapsed: boolean = false;
  opportunityCardList: OpportunityForFiltering[] = opportunities;
  uniqueModuleTypes: (string | null)[] = [];
  types: string[];
  constructor(private opportunityCardsService: OpportunityCardsService, private calculatorsService: CalculatorsService, private treasureHuntService: TreasureHuntService) { }


  ngOnInit() {
    this.selectedCalcSubscription = this.calculatorsService.selectedCalc.subscribe(val => {
      this.selectedCalc = val;
    });
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
    });

    const types: (string | null | undefined)[] = this.opportunityCardList.map(card => card.iconCalcType);
    this.uniqueModuleTypes = Array.from(new Set(types)).filter(type => type !== undefined);
    this.applyFilters();
  }

  applyFilters() {
    this.filteredOpportunityCardList = this.opportunityCardList.filter(card => {

      const isSpecial = card.name === 'Custom Savings Opportunity' || card.name === 'Assessment Opportunity';

      const selectedUtility = (this.displayCalculatorType || '');
      const cardUtilityTypes = (card.utilityType || []).map(u => (u || ''));
      const utilityMatch = isSpecial || selectedUtility === 'all' || cardUtilityTypes.includes(selectedUtility);
      const moduleMatch = this.displayModuleType === 'All' || card.iconCalcType === this.displayModuleType;
      return utilityMatch && moduleMatch;
    });
  }

  ngOnDestroy() {
    this.selectedCalcSubscription.unsubscribe();
    this.treasureHuntSub.unsubscribe();
  }

  openCalculator(calculatorType: string) {
    this.calculatorsService.displaySelectedCalculator(calculatorType);
  }

  collapseInfoCard() {
    this.infoCardCollapsed = !this.infoCardCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  resize(){
    if(this.content){
      let screenWidth = this.content.nativeElement.clientWidth;
      if (screenWidth >= 992){
        this.infoCardCollapsed = false;
      }
    }
  }

}

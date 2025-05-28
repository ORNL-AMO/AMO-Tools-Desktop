import { Component, OnInit, Input, HostListener, ViewChild, ElementRef } from '@angular/core';
import { TreasureHunt } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';
import { CalculatorsService } from '../calculators/calculators.service';
import { Subscription } from 'rxjs';
import { TreasureHuntService } from '../treasure-hunt.service';

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

  selectedCalcSubscription: Subscription;
  selectedCalc: string;
  treasureHunt: TreasureHunt;
  treasureHuntSub: Subscription;
  infoCardCollapsed: boolean = false;
  constructor(private calculatorsService: CalculatorsService, private treasureHuntService: TreasureHuntService) { }

  ngOnInit() {
    this.selectedCalcSubscription = this.calculatorsService.selectedCalc.subscribe(val => {
      this.selectedCalc = val;
    });
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
    })
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

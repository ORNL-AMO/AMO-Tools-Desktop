import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ExploreOpportunitiesService } from './explore-opportunities.service';
import { CompressedAirAssessment, CompressedAirDayType } from '../../../shared/models/compressed-air-assessment';

@Component({
  selector: 'app-explore-opportunities',
  templateUrl: './explore-opportunities.component.html',
  styleUrls: ['./explore-opportunities.component.css'],
  standalone: false
})
export class ExploreOpportunitiesComponent implements OnInit {
  @Input()
  containerHeight: number;

  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  smallScreenTab: string = 'form';

  formWidth: number;
  resultsWidth: number;

  startingCursorX: number;
  isDragging: boolean = false;

  resizeSubscription: Subscription;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private exploreOpportunitiesService: ExploreOpportunitiesService
  ) { }

  ngOnInit(): void {
    this.setSelectedDayType();
    this.setResultsWidth();
    this.resizeSubscription = fromEvent(window, 'resize').subscribe(() => {
      this.setResultsWidth();
    });
  }

  ngOnDestroy() {
    this.resizeSubscription?.unsubscribe();
  }

  setSelectedDayType() {
    //check day type is selected and valid.
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let selectedDayType: CompressedAirDayType = this.exploreOpportunitiesService.selectedDayType.getValue();
    if(!selectedDayType && compressedAirAssessment.compressedAirDayTypes && compressedAirAssessment.compressedAirDayTypes.length != 0){
      this.exploreOpportunitiesService.selectedDayType.next(compressedAirAssessment.compressedAirDayTypes[0]);
    }else if(selectedDayType && compressedAirAssessment.compressedAirDayTypes && compressedAirAssessment.compressedAirDayTypes.length != 0){
      let matchingDayType: CompressedAirDayType = compressedAirAssessment.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId == selectedDayType.dayTypeId});
      if(!matchingDayType){
        this.exploreOpportunitiesService.selectedDayType.next(compressedAirAssessment.compressedAirDayTypes[0]);
      }
    }
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

  startResizing(event: MouseEvent): void {
    this.startingCursorX = event.clientX;
    this.isDragging = true;
  }

  stopResizing($event: MouseEvent) {
    this.isDragging = false;
    window.dispatchEvent(new Event("resize"));
  }

  drag(event: MouseEvent) {
    if (this.isDragging) {
      if (event.clientX > 200) {
        this.formWidth = event.clientX;
      } else {
        this.formWidth = 200;
      }
      this.setResultsWidth();
    }
  }

  setResultsWidth() {
    if (!this.formWidth) {
      this.formWidth = window.innerWidth / 2;
    }
    this.resultsWidth = (window.innerWidth - this.formWidth);
  }

}

import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

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
  constructor() { }

  ngOnInit(): void {
    this.setResultsWidth();
  }

  ngAfterViewInit() {
    // setTimeout(() => {
    //   this.resizeTabs();
    // }, 100);
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

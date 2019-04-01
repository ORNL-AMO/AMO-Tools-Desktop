import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';

@Component({
  selector: 'app-standalone-opportunity-sheet',
  templateUrl: './standalone-opportunity-sheet.component.html',
  styleUrls: ['./standalone-opportunity-sheet.component.css']
})
export class StandaloneOpportunitySheetComponent implements OnInit {
  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;
  @ViewChild('contentContainer') contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }


  baselineEnergyUse: Array<{ type: string, amount: number }> = [{
    type: 'Electricity',
    amount: 0
  }];

  modificationEnergyUse: Array<{ type: string, amount: number }> = [];
  containerHeight: number;
  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.containerHeight = this.contentContainer.nativeElement.clientHeight - this.leftPanelHeader.nativeElement.clientHeight;
    }
  }


  addModification() {
    this.modificationEnergyUse = JSON.parse(JSON.stringify(this.baselineEnergyUse));
  }
}

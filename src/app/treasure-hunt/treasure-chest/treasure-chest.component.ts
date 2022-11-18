import { Component, OnInit, Input, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CalculatorsService } from '../calculators/calculators.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-treasure-chest',
  templateUrl: './treasure-chest.component.html',
  styleUrls: ['./treasure-chest.component.css']
})
export class TreasureChestComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  containerHeight: number;

  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  smallScreenTab: string = 'form';
  selectedCalc: string = 'none';
  selectedCalcSubscription: Subscription;
  constructor(private calculatorsService: CalculatorsService) { }

  ngOnInit() {
    this.selectedCalcSubscription = this.calculatorsService.selectedCalc.subscribe(val => {
      this.selectedCalc = val;
    });
  }

  ngOnDestroy(){
    this.selectedCalcSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
      this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
    }
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}

import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { PsatService } from '../psat.service';
import { PSAT } from '../../shared/models/psat';
import { Subscription } from 'rxjs';
import { CompareService } from '../compare.service';
@Component({
  selector: 'app-psat-tabs',
  templateUrl: './psat-tabs.component.html',
  styleUrls: ['./psat-tabs.component.css']
})
export class PsatTabsComponent implements OnInit {

  currentTab: string;
  calcTab: string;
  mainTab: string;
  modSubscription: Subscription;
  selectedModification: PSAT;
  constructor(private psatService: PsatService, private compareService: CompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.psatService.secondaryTab.subscribe(val => {
      this.currentTab = val;
    })
    this.psatService.calcTab.subscribe(val => {
      this.calcTab = val;
    })
    this.psatService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
    this.modSubscription = this.compareService.selectedModification.subscribe(val => {
      this.selectedModification = val;
      this.cd.detectChanges();
    })
  }

  changeTab(str: string) {
    this.psatService.secondaryTab.next(str);
  }

  changeCalcTab(str: string) {
    this.psatService.calcTab.next(str);
  }

  selectModification() {
    this.compareService.openModificationModal.next(true);
  }
}

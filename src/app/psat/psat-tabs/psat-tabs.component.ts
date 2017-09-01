import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PsatService } from '../psat.service';
@Component({
  selector: 'app-psat-tabs',
  templateUrl: './psat-tabs.component.html',
  styleUrls: ['./psat-tabs.component.css']
})
export class PsatTabsComponent implements OnInit {

  currentTab: string;
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    this.psatService.secondaryTab.subscribe(val => {
      this.currentTab = val;
    })
  }

  changeTab(str: string) {
    this.psatService.secondaryTab.next(str);
  }

}

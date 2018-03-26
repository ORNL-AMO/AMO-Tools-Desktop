import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { PsatService } from '../../psat/psat.service';

@Component({
  selector: 'app-psat-banner',
  templateUrl: './psat-banner.component.html',
  styleUrls: ['./psat-banner.component.css']
})
export class PsatBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;

  mainTab: string;

  constructor(private psatService: PsatService) { }

  ngOnInit() {
    this.psatService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
  }

  changeTab(str: string) {
    if (str == 'system-setup' || str == 'calculators') {
      this.psatService.mainTab.next(str);
    } else if (this.assessment.psat.setupDone) {
      this.psatService.mainTab.next(str);
    }
  }
}

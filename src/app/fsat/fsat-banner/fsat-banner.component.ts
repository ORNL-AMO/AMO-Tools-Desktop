import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { FsatService } from '../fsat.service';

@Component({
  selector: 'app-fsat-banner',
  templateUrl: './fsat-banner.component.html',
  styleUrls: ['./fsat-banner.component.css']
})
export class FsatBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;

  mainTab: string;
  constructor(private fsatService: FsatService) { }

  ngOnInit() {
    this.fsatService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
  }
  
  changeTab(str: string) {
    this.fsatService.mainTab.next(str);
  }
}

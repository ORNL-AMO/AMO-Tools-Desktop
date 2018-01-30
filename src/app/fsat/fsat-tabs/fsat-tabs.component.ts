import { Component, OnInit } from '@angular/core';
import { FsatService } from '../fsat.service';

@Component({
  selector: 'app-fsat-tabs',
  templateUrl: './fsat-tabs.component.html',
  styleUrls: ['./fsat-tabs.component.css']
})
export class FsatTabsComponent implements OnInit {

  mainTab: string;
  stepTab: string;
  constructor(private fsatService: FsatService) { }

  ngOnInit() {
    this.fsatService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
    this.fsatService.stepTab.subscribe(val => {
      this.stepTab = val;
    })
  }


  changeStepTab(str: string){
    this.fsatService.stepTab.next(str);
  }
}

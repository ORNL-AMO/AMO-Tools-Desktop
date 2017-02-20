import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Assessment } from '../shared/models/assessment';

@Component({
  selector: 'app-phast',
  templateUrl: './phast.component.html',
  styleUrls: ['./phast.component.css']
})
export class PhastComponent implements OnInit {
  phast: Assessment;

  currentTab: string = 'system-basics';
  panelView: string = 'help-panel';
  isPanelOpen: boolean = true;
  constructor(private _location: Location) { }

  ngOnInit() {
    //this.psat = this._psatService.getWorkingPsat();
  }

  changeTab($event){
    this.currentTab = $event;
  }

  toggleOpenPanel($event){
    if(!this.isPanelOpen) {
      this.panelView = $event;
      this.isPanelOpen = true;
    }else if(this.isPanelOpen && $event != this.panelView){
      this.panelView = $event;
    }else{
      this.isPanelOpen = false;
    }
  }

  goBack(){
    this._location.back();
  }
}

import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Assessment } from '../shared/models/assessment';
import { PsatService} from './psat.service';

@Component({
  selector: 'app-psat',
  templateUrl: './psat.component.html',
  styleUrls: ['./psat.component.css']
})
export class PsatComponent implements OnInit {
  psat: Assessment;

  panelView: string;
  isPanelOpen: boolean = false;
  currentTab: string = 'system-basics';
  constructor(private _location: Location, private _psatService: PsatService) { }

  ngOnInit() {
    this.psat = this._psatService.getWorkingPsat();
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

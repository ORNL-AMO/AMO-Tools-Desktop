import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';

@Component({
  selector: 'app-system-efficiency-summary',
  templateUrl: './system-efficiency-summary.component.html',
  styleUrls: ['./system-efficiency-summary.component.css']
})
export class SystemEfficiencySummaryComponent implements OnInit {
  @Input()
  phast: PHAST;

  collapse: boolean = true;
  numMods: number = 0;
  constructor() { }

  ngOnInit() {
    if(this.phast){
      if(this.phast.modifications){
        this.numMods = this.phast.modifications.length;
      }
    }
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }
}

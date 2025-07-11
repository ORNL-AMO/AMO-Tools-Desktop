import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';

@Component({
    selector: 'app-system-efficiency-summary',
    templateUrl: './system-efficiency-summary.component.html',
    styleUrls: ['./system-efficiency-summary.component.css'],
    standalone: false
})
export class SystemEfficiencySummaryComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  printView: boolean;

  collapse: boolean = true;
  numMods: number = 0;
  
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  constructor() { }

  ngOnInit() {
    if (this.phast) {
      if (this.phast.modifications) {
        this.numMods = this.phast.modifications.length;
      }
    }
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }
  
  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }
  
}

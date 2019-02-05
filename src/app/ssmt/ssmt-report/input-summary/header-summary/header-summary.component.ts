import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { SSMTInputs } from '../../../../shared/models/steam/ssmt';

@Component({
  selector: 'app-header-summary',
  templateUrl: './header-summary.component.html',
  styleUrls: ['./header-summary.component.css']
})
export class HeaderSummaryComponent implements OnInit {
  @Input()
  baselineInputData: SSMTInputs;
  @Input()
  modificationInputData: Array<{ name: string, inputData: SSMTInputs }>;

  collapse: boolean = true;
  numMods: number = 0;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {

  }

  toggleCollapse() {
    if (this.modificationInputData) {
      this.numMods = this.modificationInputData.length;
    }
    this.collapse = !this.collapse;
  }

}

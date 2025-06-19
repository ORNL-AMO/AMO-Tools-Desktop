import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
@Component({
    selector: 'app-energy-input-summary',
    templateUrl: './energy-input-summary.component.html',
    styleUrls: ['./energy-input-summary.component.css'],
    standalone: false
})
export class EnergyInputSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;

  numLosses: number = 0;
  collapse: boolean = true;
  lossData: Array<any>;
  numMods: number = 0;
  
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  constructor() { }

  ngOnInit() {
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.modifications) {
        this.numMods = this.phast.modifications.length;
      }
      if (this.phast.losses.energyInputEAF) {
        this.numLosses = this.phast.losses.energyInputEAF.length;
        let index = 0;
        this.phast.losses.energyInputEAF.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.energyInputEAF[index];
              modificationData.push(modData);
            });
          }
          this.lossData.push({
            baseline: loss,
            modifications: modificationData
          });
          index++;
        });
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

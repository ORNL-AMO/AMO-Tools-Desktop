import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';

@Component({
  selector: 'app-atmosphere-summary',
  templateUrl: './atmosphere-summary.component.html',
  styleUrls: ['./atmosphere-summary.component.css']
})
export class AtmosphereSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;

  lossData: Array<any>;
  numLosses: number = 0;
  collapse: boolean = true;
  gasOptions: Array<any>;
  constructor(private suiteDbService: SuiteDbService) { }

  ngOnInit() {
    this.gasOptions = this.suiteDbService.selectAtmosphereSpecificHeat();
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.losses.atmosphereLosses) {
        this.numLosses = this.phast.losses.atmosphereLosses.length;
        let index: number = 0;
        this.phast.losses.atmosphereLosses.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.atmosphereLosses[index];
              modificationData.push(modData);
            })
          }
          this.lossData.push({
            baseline: loss,
            modifications: modificationData
          });
          index++;
        })
      }
    }
  }

  getGas(id: number) {
    if (id) {
      let option = this.gasOptions.filter(val => { return id == val.id });
      if (option.length != 0) {
        return option[0].substance;
      } else {
        return ''
      }
    }
    return '';
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }
}

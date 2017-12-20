import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';

@Component({
  selector: 'app-fixture-summary',
  templateUrl: './fixture-summary.component.html',
  styleUrls: ['./fixture-summary.component.css']
})
export class FixtureSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;


  numLosses: number = 0;
  collapse: boolean = true;
  lossData: Array<any>;
  materialOptions: Array<any>;
  constructor(private suiteDbService: SuiteDbService) { }

  ngOnInit() {
    this.materialOptions = this.suiteDbService.selectSolidLoadChargeMaterials();
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.losses.fixtureLosses) {
        this.numLosses = this.phast.losses.fixtureLosses.length;
        let index = 0;
        this.phast.losses.fixtureLosses.forEach(loss => {
          let modificationData = new Array();
          if(this.phast.modifications){
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.fixtureLosses[index];
              modificationData.push(modData);
            })
          }
          this.lossData.push({
            baseline: loss,
            modifications: modificationData
          })
          index++;
        })
      }
    }
  }

  getMaterialName(id: number) {
    if (id) {
      let option = this.materialOptions.find(val => { return id == val.id });
      if (option) {
        return option.substance;
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

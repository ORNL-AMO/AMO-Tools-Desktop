import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { WallLoss } from '../../../../shared/models/phast/losses/wallLoss';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';

@Component({
  selector: 'app-wall-summary',
  templateUrl: './wall-summary.component.html',
  styleUrls: ['./wall-summary.component.css']
})
export class WallSummaryComponent implements OnInit {
  @Input()
  phast: PHAST

  lossData: Array<any>;
  surfaceOrientationOptions: Array<any>;
  numLosses: number = 0;
  collapse: boolean = true;
  constructor(private suiteDbService: SuiteDbService) { }

  ngOnInit() {
    this.surfaceOrientationOptions = this.suiteDbService.selectWallLossesSurface();
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.losses.wallLosses) {
        this.numLosses = this.phast.losses.wallLosses.length;
        let index: number = 0;
        this.phast.losses.wallLosses.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.wallLosses[index];
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

  getSurfaceOption(id: number) {
    if (id) {
      let option = this.surfaceOrientationOptions.filter(val => { return id == val.id });
      if (option.length != 0) {
        return option[0].surface;
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

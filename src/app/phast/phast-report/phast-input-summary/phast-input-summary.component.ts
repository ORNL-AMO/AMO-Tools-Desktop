import { Component, OnInit, Input } from '@angular/core';
import { PHAST, ShowResultsCategories } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { PhastResultsService } from '../../phast-results.service';

@Component({
    selector: 'app-phast-input-summary',
    templateUrl: './phast-input-summary.component.html',
    styleUrls: ['./phast-input-summary.component.css'],
    standalone: false
})
export class PhastInputSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Input()
  showPrint: boolean;

  lossCategories: ShowResultsCategories;
  constructor(private phastResultsService: PhastResultsService) { }

  ngOnInit() {
    this.lossCategories = this.phastResultsService.getResultCategories(this.settings);
  }

}

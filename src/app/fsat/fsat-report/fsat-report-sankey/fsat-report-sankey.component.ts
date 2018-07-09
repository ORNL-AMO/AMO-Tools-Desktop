import { Component, OnInit, Input } from '@angular/core';
import { FSAT } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { FsatService } from '../../fsat.service';

@Component({
  selector: 'app-fsat-report-sankey',
  templateUrl: './fsat-report-sankey.component.html',
  styleUrls: ['./fsat-report-sankey.component.css']
})
export class FsatReportSankeyComponent implements OnInit {
  @Input()
  fsat: FSAT;
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  printView: boolean;

  modifications: Array<{name: string, fsat: FSAT}>;
  assessmentName: string;
  fsat1: {name: string, fsat: FSAT};
  fsat2: {name: string, fsat: FSAT};
  modExists: boolean = false;
  fsatOptions: Array<{name: string, fsat: FSAT}>;
  fsat1CostSavings: number;
  fsat2CostSavings: number;

  constructor(private fsatService: FsatService) { }

  ngOnInit() {
  }

}

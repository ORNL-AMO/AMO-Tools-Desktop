import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-pipe-insulation-reduction-help',
    templateUrl: './pipe-insulation-reduction-help.component.html',
    styleUrls: ['./pipe-insulation-reduction-help.component.css'],
    standalone: false
})
export class PipeInsulationReductionHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  currentField: string;
  docsLink: string = environment.measurDocsUrl;

  constructor() { }

  ngOnInit() {
  }

}

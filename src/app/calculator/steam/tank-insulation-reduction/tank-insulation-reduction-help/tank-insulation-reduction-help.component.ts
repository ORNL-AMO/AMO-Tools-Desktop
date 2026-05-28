import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-tank-insulation-reduction-help',
    templateUrl: './tank-insulation-reduction-help.component.html',
    styleUrls: ['./tank-insulation-reduction-help.component.css'],
    standalone: false
})
export class TankInsulationReductionHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  currentField: string;
  docsLink: string = environment.measurDocsUrl;

  constructor() { }

  ngOnInit() {
  }

}

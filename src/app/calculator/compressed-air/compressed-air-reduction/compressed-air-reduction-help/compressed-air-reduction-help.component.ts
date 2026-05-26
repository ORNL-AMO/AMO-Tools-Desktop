import { Component, OnInit, Input } from '@angular/core';
import { Settings } from "../../../../shared/models/settings";
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-compressed-air-reduction-help',
  templateUrl: './compressed-air-reduction-help.component.html',
  styleUrls: ['./compressed-air-reduction-help.component.css'],
  standalone: false
})
export class CompressedAirReductionHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  currentField: string;
  docsLink: string = environment.measurDocsUrl;

  constructor() { }

  ngOnInit() {
  }

}

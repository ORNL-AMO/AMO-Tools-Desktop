import { Component, OnInit, Input } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-head-tool-results',
  templateUrl: './head-tool-results.component.html',
  styleUrls: ['./head-tool-results.component.css']
})
export class HeadToolResultsComponent implements OnInit {
  @Input()
  results: any;
  @Input()
  settings: Settings;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
  }

  getUnit(val: number){
    return this.convertUnitsService.value(val).from('ft').to(this.settings.distanceMeasurement);
  }

}

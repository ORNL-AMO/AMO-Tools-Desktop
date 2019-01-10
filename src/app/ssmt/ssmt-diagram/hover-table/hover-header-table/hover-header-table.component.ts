import { Component, OnInit, Input } from '@angular/core';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';
import { HeaderOutputObj } from '../../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-hover-header-table',
  templateUrl: './hover-header-table.component.html',
  styleUrls: ['./hover-header-table.component.css']
})
export class HoverHeaderTableComponent implements OnInit {
  @Input()
  headerPressure: string;

  header: HeaderOutputObj;
  constructor(private calculateModelService: CalculateModelService) { }

  ngOnInit() {
    if (this.headerPressure == 'highPressure') {
      this.header = this.calculateModelService.highPressureHeader;
    } else if (this.headerPressure == 'mediumPressure') {
      this.header = this.calculateModelService.mediumPressureHeader;
    } else if (this.headerPressure == 'lowPressure') {
      this.header = this.calculateModelService.lowPressureHeader;
    }
  }

}

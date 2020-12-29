import { Component, Input, OnInit } from '@angular/core';
import { ConvertUnitsService } from '../../../../../../shared/convert-units/convert-units.service';
import { VelocityResults } from '../../../../../../shared/models/fans';
import { Settings } from '../../../../../../shared/models/settings';
import { FanAnalysisService } from '../../../fan-analysis.service';

@Component({
  selector: 'app-traverse-planes',
  templateUrl: './traverse-planes.component.html',
  styleUrls: ['./traverse-planes.component.css']
})
export class TraversePlanesComponent implements OnInit {

  @Input()
  planeStep: string;
  @Input()
  settings: Settings;

  velocityResultsSub: any;
  velocityResults: VelocityResults;
  planeDescription: string;

  constructor(private fanAnalysisService: FanAnalysisService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit(): void {
    this.setPlane();
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.velocityResultsSub.unsubscribe();
  }

  initSubscriptions() {
    this.velocityResultsSub = this.fanAnalysisService.velocityResults.subscribe(results => {
      this.velocityResults = results;
    });
  }

  setPlane() {
    let planeNumber = 1;
    if (this.planeStep == '3b') {
      planeNumber = 2;
    } else if (this.planeStep == '3c') {
      planeNumber = 3;
    }
    this.planeDescription = `Additional Traverse Plane ${planeNumber}`;
  }

  getDisplayUnit(unit: any) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }
}

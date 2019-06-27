import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlaneDataFormService } from './plane-data-form.service';
import { PlaneData, FanRatedInfo } from '../../../../../shared/models/fans';
import { Settings } from '../../../../../shared/models/settings';

@Component({
  selector: 'app-plane-data-form',
  templateUrl: './plane-data-form.component.html',
  styleUrls: ['./plane-data-form.component.css']
})
export class PlaneDataFormComponent implements OnInit {
  // @Input()
  // toggleResetData: boolean;
  @Input()
  planeData: PlaneData;
  @Input()
  fanRatedInfo: FanRatedInfo;
  @Input()
  settings: Settings;
  // @Output('emitSave')
  // emitSave = new EventEmitter<{ plane: Plane, planeNumber: string }>();
  // @Output('emitSaveTraverse')
  // emitSaveTraverse = new EventEmitter<{ plane: Plane, planeNumber: string }>();
  // @Output('emitSavePlaneData')
  // emitSavePlaneData = new EventEmitter<PlaneData>();


  planeStep: string;
  planeStepSubscription: Subscription;
  constructor(private planeDataFormService: PlaneDataFormService) { }

  ngOnInit() {
    this.planeStepSubscription = this.planeDataFormService.planeStep.subscribe(val => {
      this.planeStep = val;
    })
  }

  ngOnDestroy() {
    this.planeStepSubscription.unsubscribe();
  }

  changePlaneStepTab(str: string) {
    this.planeDataFormService.planeStep.next(str);
  }
}

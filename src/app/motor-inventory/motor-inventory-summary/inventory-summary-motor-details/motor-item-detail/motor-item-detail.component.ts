import { Component, OnInit, Input } from '@angular/core';
import { MotorInventoryDepartment, MotorItem, MotorPropertyDisplayOptions } from '../../../motor-inventory';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-motor-item-detail',
    templateUrl: './motor-item-detail.component.html',
    styleUrls: ['./motor-item-detail.component.css'],
    standalone: false
})
export class MotorItemDetailComponent implements OnInit {
  @Input()
  department: MotorInventoryDepartment;
  @Input()
  motorItem: MotorItem;
  @Input()
  settings: Settings;
  @Input()
  displayOptions: MotorPropertyDisplayOptions;

  constructor() { }

  ngOnInit(): void {
  }

}

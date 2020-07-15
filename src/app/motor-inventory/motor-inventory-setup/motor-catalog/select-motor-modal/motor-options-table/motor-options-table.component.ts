import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SuiteDbService } from '../../../../../suiteDb/suite-db.service';
import { SuiteDbMotor } from '../../../../../shared/models/materials';

@Component({
  selector: 'app-motor-options-table',
  templateUrl: './motor-options-table.component.html',
  styleUrls: ['./motor-options-table.component.css']
})
export class MotorOptionsTableComponent implements OnInit {
  @Output('emitSelect')
  emitSelect = new EventEmitter<SuiteDbMotor>();

  motorOptions: Array<SuiteDbMotor>;
  constructor(private suiteDbService: SuiteDbService) { }

  ngOnInit(): void {
    this.motorOptions = this.suiteDbService.selectMotors();
  }

  selectMotor(motor: SuiteDbMotor) {
    this.emitSelect.emit(motor);
  }
}

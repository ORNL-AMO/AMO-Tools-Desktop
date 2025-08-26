import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SuiteDbMotor } from '../../../../../shared/models/materials';
import { MotorCatalogService } from '../../motor-catalog.service';
import { FilterMotorOptions } from '../filter-motor-options.pipe';
import { Subscription } from 'rxjs';
import { MotorDataApiService } from '../../../../../tools-suite-api/motor-data-api.service';

@Component({
    selector: 'app-motor-options-table',
    templateUrl: './motor-options-table.component.html',
    styleUrls: ['./motor-options-table.component.css'],
    standalone: false
})
export class MotorOptionsTableComponent implements OnInit {
  @Output('emitSelect')
  emitSelect = new EventEmitter<SuiteDbMotor>();

  motorOptions: Array<SuiteDbMotor>;
  filterMotorOptions: FilterMotorOptions;
  filterMotorOptionsSub: Subscription;
  constructor(private motorDataApiService: MotorDataApiService, private motorCatalogService: MotorCatalogService) { }

  ngOnInit(): void {
    this.motorOptions = this.motorDataApiService.getMotors();
    this.filterMotorOptionsSub = this.motorCatalogService.filterMotorOptions.subscribe(val => {
      this.filterMotorOptions = val;
      this.motorOptions = Array.from(this.motorOptions);
    });
  }

  ngOnDestroy() {
    this.filterMotorOptionsSub.unsubscribe();
  }

  selectMotor(motor: SuiteDbMotor) {
    this.emitSelect.emit(motor);
  }
}

import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-field-data',
  templateUrl: './field-data.component.html',
  styleUrls: ['./field-data.component.css']
})
export class FieldDataComponent implements OnInit {
  @Input()
  psatForm: any;
  @Input()
  assessment: Assessment;
  @Output('changeField')
  changeField = new EventEmitter<string>();

  headToolResults: any = {
    differentialElevationHead: 0.0,
    differentialPressureHead: 0.0,
    differentialVelocityHead: 0.0,
    estimatedSuctionFrictionHead: 0.0,
    estimatedDischargeFrictionHead: 0.0,
    pumpHead: 0.0
  };

  //Create your array of options
  //first item in array will be default selected, can modify that functionality later if desired
  loadEstimateMethods: Array<string> = [
    'Power',
    'Current'
  ];

  constructor() { }

  ngOnInit() {
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }


  @ViewChild('headToolModal') public headToolModal: ModalDirective;
  showHeadToolModal() {
    this.headToolModal.show();
  }

  hideHeadToolModal() {
    this.headToolModal.hide();
  }

}

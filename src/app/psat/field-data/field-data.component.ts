import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { PSAT } from '../../shared/models/psat';
import { PsatService } from '../psat.service';

@Component({
  selector: 'app-field-data',
  templateUrl: './field-data.component.html',
  styleUrls: ['./field-data.component.css']
})
export class FieldDataComponent implements OnInit {
  @Input()
  psat: PSAT;
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
  psatForm: any;
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    this.psatForm = this.psatService.getFormFromPsat(this.psat);
  }

  focusField(str: string) {
    console.log(this.psatForm.value.loadEstimatedMethod);
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

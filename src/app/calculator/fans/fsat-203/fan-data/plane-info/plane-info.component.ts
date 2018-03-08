import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Fsat203Service } from '../../fsat-203.service';
import { FormGroup } from '@angular/forms';
import { PlaneData } from '../../../../../shared/models/fans';

@Component({
  selector: 'app-plane-info',
  templateUrl: './plane-info.component.html',
  styleUrls: ['./plane-info.component.css']
})
export class PlaneInfoComponent implements OnInit {
  @Input()
  planeData: PlaneData;
  @Output('emitSave')
  emitSave = new EventEmitter<PlaneData>();

  planeInfoForm: FormGroup;
  sumSEF: number;
  constructor(private fsat203Service: Fsat203Service) { }

  ngOnInit() {
    this.getSum(this.planeData);
    this.planeInfoForm = this.fsat203Service.getPlaneInfoFormFromObj(this.planeData);
  }

  focusField() {

  }

  getSum(planeData: PlaneData){
    this.sumSEF = planeData.inletSEF + planeData.outletSEF;
  }
  save() {
    this.planeData = this.fsat203Service.getPlaneInfoObjFromForm(this.planeInfoForm, this.planeData);
    this.getSum(this.planeData);
    this.emitSave.emit(this.planeData);
  }

}

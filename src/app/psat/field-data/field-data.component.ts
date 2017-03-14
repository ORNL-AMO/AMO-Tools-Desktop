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
  constructor() { }

  ngOnInit() {
  }

  focusField(str: string) {
    console.log(str);
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

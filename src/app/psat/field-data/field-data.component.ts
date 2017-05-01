import { Component, OnInit, Output, EventEmitter, ViewChild, Input, SimpleChanges, ElementRef } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { PSAT } from '../../shared/models/psat';
import { PsatService } from '../psat.service';
import { Settings } from '../../shared/models/settings';
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
  @Input()
  saveClicked: boolean;
  @Output('isValid')
  isValid = new EventEmitter<boolean>();
  @Output('isInvalid')
  isInvalid = new EventEmitter<boolean>();
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Input()
  isBaseline: boolean;
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;


  @ViewChild('formRef') formRef: ElementRef;
  elements: any;

  formValid: boolean;
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
  isFirstChange: boolean = true;
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    console.log(this.settings);
    this.psatForm = this.psatService.getFormFromPsat(this.psat.inputs);
    this.checkForm(this.psatForm);
    if (!this.selected) {
      this.disableForm();
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    if (!this.isFirstChange) {
      if (changes.saveClicked) {
        this.savePsat(this.psatForm);
      }
      if (!this.selected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    }
    else {
      this.isFirstChange = false;
    }
  }

  disableForm() {
    this.elements = this.formRef.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = true;
    }
  }

  enableForm() {
    this.elements = this.formRef.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = false;
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  checkForm(form: any) {
    this.formValid = this.psatService.isFieldDataFormValid(form);
    if (this.formValid) {
      this.isValid.emit(true)
    } else {
      this.isInvalid.emit(true)
    }
  }

  savePsat(form: any) {
    // this.isValid = this.psatService.isFieldDataFormValid(form);
    if (this.formValid) {
      this.psat.inputs = this.psatService.getPsatInputsFromForm(form);
      this.saved.emit(true);
    }
  }


  @ViewChild('headToolModal') public headToolModal: ModalDirective;
  showHeadToolModal() {
    this.headToolModal.show();
  }

  hideHeadToolModal() {
    this.headToolModal.hide();
  }

}

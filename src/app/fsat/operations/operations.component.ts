import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FSAT } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';
import { OperationsService } from './operations.service';

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class OperationsComponent implements OnInit {
  @Input()
  fsat: FSAT;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<FSAT>();
  @Input()
  selected: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  isBaseline: boolean;
  @Input()
  modificationIndex: number;

  idString: string = 'baseline_';

  operationsForm: FormGroup;

  constructor(private operationsService: OperationsService) { }

  ngOnInit(): void {
  }

}

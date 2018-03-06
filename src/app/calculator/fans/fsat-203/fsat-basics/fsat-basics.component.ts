import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FanRatedInfo } from '../../../../shared/models/fans';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelpPanelService } from '../../../../fsat/help-panel/help-panel.service';
import { Fsat203Service } from '../fsat-203.service';

@Component({
  selector: 'app-fsat-basics',
  templateUrl: './fsat-basics.component.html',
  styleUrls: ['./fsat-basics.component.css']
})
export class FsatBasicsComponent implements OnInit {
  @Input()
  fanRatedInfo: FanRatedInfo;
  @Input()
  basicsDone: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<FanRatedInfo>();

  ratedInfoForm: FormGroup;

  planes: Array<number> = [
    1, 2, 3
  ]

  constructor(private formBuilder: FormBuilder, private helpPanelService: HelpPanelService, private fsat203Service: Fsat203Service) { }

  ngOnInit() {
    this.ratedInfoForm = this.fsat203Service.getBasicsFormFromObject(this.fanRatedInfo);
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
  }


  save() {
    this.fanRatedInfo = this.fsat203Service.getBasicsObjectFromForm(this.ratedInfoForm);
    this.emitSave.emit(this.fanRatedInfo);
  }
}

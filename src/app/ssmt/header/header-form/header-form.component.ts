import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { HeaderService } from '../header.service';

@Component({
  selector: 'app-header-form',
  templateUrl: './header-form.component.html',
  styleUrls: ['./header-form.component.css']
})
export class HeaderFormComponent implements OnInit {
  @Input()
  headerForm: FormGroup;
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Input()
  numberOfHeaders: number;

  headerLabel: string;
  constructor(private headerService: HeaderService) { }

  ngOnInit() {
    this.headerLabel = this.headerService.getHeaderLabel(this.headerForm.controls.pressureIndex.value, this.numberOfHeaders);
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.numberOfHeaders && !changes.numberOfHeaders.isFirstChange()){
      this.headerLabel = this.headerService.getHeaderLabel(this.headerForm.controls.pressureIndex.value, this.numberOfHeaders);
    }
  }

  focusField(){

  }

  focusOut(){

  }

  save(){

  }
}

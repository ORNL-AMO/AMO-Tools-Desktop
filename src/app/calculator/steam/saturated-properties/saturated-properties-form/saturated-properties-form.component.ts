import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { Settings } from "../../../../shared/models/settings";

@Component({
  selector: 'app-saturated-properties-form',
  templateUrl: './saturated-properties-form.component.html',
  styleUrls: ['./saturated-properties-form.component.css']
})
export class SaturatedPropertiesFormComponent implements OnInit {
  @Input()
  saturatedPropertiesForm: FormGroup;
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
  }

}

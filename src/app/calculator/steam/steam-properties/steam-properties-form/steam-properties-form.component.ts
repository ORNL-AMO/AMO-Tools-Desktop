import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'app-steam-properties-form',
  templateUrl: './steam-properties-form.component.html',
  styleUrls: ['./steam-properties-form.component.css']
})
export class SteamPropertiesFormComponent implements OnInit {
  @Input()
  steamPropertiesForm: FormGroup;

  constructor() { }

  ngOnInit() {
  }

}

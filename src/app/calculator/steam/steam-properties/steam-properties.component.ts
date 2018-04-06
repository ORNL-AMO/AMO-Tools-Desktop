import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-steam-properties',
  templateUrl: './steam-properties.component.html',
  styleUrls: ['./steam-properties.component.css']
})
export class SteamPropertiesComponent implements OnInit {
  steamPropertiesForm: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.steamPropertiesForm = this.formBuilder.group({
      'pressure': ['', Validators.required],
      'thermodynamicQuantity': [0],
      'quantityValue': ['', Validators.required]
    });
  }

}

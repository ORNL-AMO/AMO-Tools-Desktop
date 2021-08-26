import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FSAT } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';

@Injectable({
  providedIn: 'root'
})
export class OperationsService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  

}

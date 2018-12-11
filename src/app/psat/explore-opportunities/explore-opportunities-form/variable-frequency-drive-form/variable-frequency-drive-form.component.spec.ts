import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableFrequencyDriveFormComponent } from './variable-frequency-drive-form.component';

describe('VariableFrequencyDriveFormComponent', () => {
  let component: VariableFrequencyDriveFormComponent;
  let fixture: ComponentFixture<VariableFrequencyDriveFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VariableFrequencyDriveFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariableFrequencyDriveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

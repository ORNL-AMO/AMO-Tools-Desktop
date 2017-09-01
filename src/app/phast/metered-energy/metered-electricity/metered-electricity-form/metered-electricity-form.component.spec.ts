import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteredElectricityFormComponent } from './metered-electricity-form.component';

describe('MeteredElectricityFormComponent', () => {
  let component: MeteredElectricityFormComponent;
  let fixture: ComponentFixture<MeteredElectricityFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeteredElectricityFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeteredElectricityFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

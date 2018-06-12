import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteredFuelFormComponent } from './metered-fuel-form.component';

describe('MeteredFuelFormComponent', () => {
  let component: MeteredFuelFormComponent;
  let fixture: ComponentFixture<MeteredFuelFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeteredFuelFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeteredFuelFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

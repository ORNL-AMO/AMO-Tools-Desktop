import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteredElectricityHelpComponent } from './metered-electricity-help.component';

describe('MeteredElectricityHelpComponent', () => {
  let component: MeteredElectricityHelpComponent;
  let fixture: ComponentFixture<MeteredElectricityHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeteredElectricityHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeteredElectricityHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

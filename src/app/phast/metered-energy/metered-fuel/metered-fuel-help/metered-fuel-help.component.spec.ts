import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteredFuelHelpComponent } from './metered-fuel-help.component';

describe('MeteredFuelHelpComponent', () => {
  let component: MeteredFuelHelpComponent;
  let fixture: ComponentFixture<MeteredFuelHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeteredFuelHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeteredFuelHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

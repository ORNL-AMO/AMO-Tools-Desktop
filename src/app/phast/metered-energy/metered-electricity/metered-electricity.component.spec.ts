import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteredElectricityComponent } from './metered-electricity.component';

describe('MeteredElectricityComponent', () => {
  let component: MeteredElectricityComponent;
  let fixture: ComponentFixture<MeteredElectricityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeteredElectricityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeteredElectricityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

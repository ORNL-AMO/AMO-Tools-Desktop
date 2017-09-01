import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteredFuelComponent } from './metered-fuel.component';

describe('MeteredFuelComponent', () => {
  let component: MeteredFuelComponent;
  let fixture: ComponentFixture<MeteredFuelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeteredFuelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeteredFuelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

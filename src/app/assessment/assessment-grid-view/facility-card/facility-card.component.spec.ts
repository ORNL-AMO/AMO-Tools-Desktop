import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityCardComponent } from './facility-card.component';

describe('FacilityCardComponent', () => {
  let component: FacilityCardComponent;
  let fixture: ComponentFixture<FacilityCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacilityCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacilityCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

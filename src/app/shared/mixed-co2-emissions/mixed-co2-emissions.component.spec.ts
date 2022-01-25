import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MixedCo2EmissionsComponent } from './mixed-co2-emissions.component';

describe('MixedCo2EmissionsComponent', () => {
  let component: MixedCo2EmissionsComponent;
  let fixture: ComponentFixture<MixedCo2EmissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MixedCo2EmissionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MixedCo2EmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtmosphereResultsComponent } from './atmosphere-results.component';

describe('AtmosphereResultsComponent', () => {
  let component: AtmosphereResultsComponent;
  let fixture: ComponentFixture<AtmosphereResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AtmosphereResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AtmosphereResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

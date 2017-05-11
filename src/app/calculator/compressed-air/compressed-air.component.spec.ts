import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirComponent } from './compressed-air.component';

describe('CompressedAirComponent', () => {
  let component: CompressedAirComponent;
  let fixture: ComponentFixture<CompressedAirComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompressedAirComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

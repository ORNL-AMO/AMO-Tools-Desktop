import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraversePlanesComponent } from './traverse-planes.component';

describe('TraversePlanesComponent', () => {
  let component: TraversePlanesComponent;
  let fixture: ComponentFixture<TraversePlanesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TraversePlanesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TraversePlanesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

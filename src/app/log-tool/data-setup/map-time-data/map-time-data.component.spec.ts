import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapTimeDataComponent } from './map-time-data.component';

describe('MapTimeDataComponent', () => {
  let component: MapTimeDataComponent;
  let fixture: ComponentFixture<MapTimeDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapTimeDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapTimeDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

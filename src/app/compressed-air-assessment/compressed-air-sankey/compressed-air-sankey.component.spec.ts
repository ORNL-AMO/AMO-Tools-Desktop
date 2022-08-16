import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirSankeyComponent } from './compressed-air-sankey.component';

describe('CompressedAirSankeyComponent', () => {
  let component: CompressedAirSankeyComponent;
  let fixture: ComponentFixture<CompressedAirSankeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressedAirSankeyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

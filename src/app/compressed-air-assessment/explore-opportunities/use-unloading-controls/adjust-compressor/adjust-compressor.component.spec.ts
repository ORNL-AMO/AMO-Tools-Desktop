import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustCompressorComponent } from './adjust-compressor.component';

describe('AdjustCompressorComponent', () => {
  let component: AdjustCompressorComponent;
  let fixture: ComponentFixture<AdjustCompressorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdjustCompressorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustCompressorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

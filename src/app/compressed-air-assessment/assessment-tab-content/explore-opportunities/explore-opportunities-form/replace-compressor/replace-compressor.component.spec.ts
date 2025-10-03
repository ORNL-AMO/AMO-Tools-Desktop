import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceCompressorComponent } from './replace-compressor.component';

describe('ReplaceCompressorComponent', () => {
  let component: ReplaceCompressorComponent;
  let fixture: ComponentFixture<ReplaceCompressorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplaceCompressorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplaceCompressorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

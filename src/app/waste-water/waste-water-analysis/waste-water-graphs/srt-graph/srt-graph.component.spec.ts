import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrtGraphComponent } from './srt-graph.component';

describe('SrtGraphComponent', () => {
  let component: SrtGraphComponent;
  let fixture: ComponentFixture<SrtGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SrtGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SrtGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

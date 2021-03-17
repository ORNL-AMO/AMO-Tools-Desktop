import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrtGraphsComponent } from './srt-graphs.component';

describe('SrtGraphsComponent', () => {
  let component: SrtGraphsComponent;
  let fixture: ComponentFixture<SrtGraphsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SrtGraphsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SrtGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

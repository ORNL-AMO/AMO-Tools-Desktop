import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullLoadAmpsComponent } from './full-load-amps.component';

describe('FullLoadAmpsComponent', () => {
  let component: FullLoadAmpsComponent;
  let fixture: ComponentFixture<FullLoadAmpsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullLoadAmpsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FullLoadAmpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

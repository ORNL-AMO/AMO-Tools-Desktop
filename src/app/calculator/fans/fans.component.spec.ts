import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FansComponent } from './fans.component';

describe('FansComponent', () => {
  let component: FansComponent;
  let fixture: ComponentFixture<FansComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FansComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

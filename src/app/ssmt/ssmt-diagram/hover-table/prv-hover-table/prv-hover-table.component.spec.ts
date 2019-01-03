import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrvHoverTableComponent } from './prv-hover-table.component';

describe('PrvHoverTableComponent', () => {
  let component: PrvHoverTableComponent;
  let fixture: ComponentFixture<PrvHoverTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrvHoverTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrvHoverTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

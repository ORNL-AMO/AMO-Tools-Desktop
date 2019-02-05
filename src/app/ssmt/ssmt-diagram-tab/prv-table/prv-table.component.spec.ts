import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrvTableComponent } from './prv-table.component';

describe('PrvTableComponent', () => {
  let component: PrvTableComponent;
  let fixture: ComponentFixture<PrvTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrvTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrvTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

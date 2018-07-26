import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrvComponent } from './prv.component';

describe('PrvComponent', () => {
  let component: PrvComponent;
  let fixture: ComponentFixture<PrvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

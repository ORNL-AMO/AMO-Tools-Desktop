import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnCondensateHeaderComponent } from './return-condensate-header.component';

describe('ReturnCondensateHeaderComponent', () => {
  let component: ReturnCondensateHeaderComponent;
  let fixture: ComponentFixture<ReturnCondensateHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReturnCondensateHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReturnCondensateHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

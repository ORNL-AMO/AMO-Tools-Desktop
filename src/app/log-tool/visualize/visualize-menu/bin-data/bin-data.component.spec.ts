import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BinDataComponent } from './bin-data.component';

describe('BinDataComponent', () => {
  let component: BinDataComponent;
  let fixture: ComponentFixture<BinDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BinDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BinDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

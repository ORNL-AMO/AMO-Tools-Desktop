import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndUseTableComponent } from './end-use-table.component';

describe('EndUseTableComponent', () => {
  let component: EndUseTableComponent;
  let fixture: ComponentFixture<EndUseTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EndUseTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndUseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

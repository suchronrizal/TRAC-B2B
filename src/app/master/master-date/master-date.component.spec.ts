import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterDateComponent } from './master-date.component';

describe('MasterDateComponent', () => {
  let component: MasterDateComponent;
  let fixture: ComponentFixture<MasterDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasterDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

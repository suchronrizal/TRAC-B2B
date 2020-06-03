import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KmbaseComponent } from './kmbase.component';

describe('KmbaseComponent', () => {
  let component: KmbaseComponent;
  let fixture: ComponentFixture<KmbaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KmbaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KmbaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

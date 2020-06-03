import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainSettingComponent } from './main-setting/main-setting.component';

@NgModule({
	imports: [
		CommonModule
	],
	exports: [MainSettingComponent],
	declarations: [MainSettingComponent]
})
export class SettingModule { }

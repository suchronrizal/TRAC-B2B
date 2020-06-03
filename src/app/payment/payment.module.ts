import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { MainPayment } from './main/main.component';

// PrimeNG
import { 
	SpinnerModule,
	SelectButtonModule,
	CheckboxModule,
	CalendarModule,
	AccordionModule,
	AutoCompleteModule,
	MultiSelectModule,
	RadioButtonModule,
	GrowlModule,
	DataTableModule,
	InputSwitchModule,
	OverlayPanelModule,
	ProgressSpinnerModule,
	DialogModule,
	TabViewModule
} from 'primeng/primeng';

import { PaymentService } from './payment.service';
import { FormDokuComponent } from './form-doku/form-doku.component';

@NgModule({
	imports: [
		CommonModule,
		HttpModule,
		RouterModule,
		FormsModule,

		// PrimeNG
		CommonModule,
		SpinnerModule,
		SelectButtonModule,
		CheckboxModule,
		CalendarModule,
		AccordionModule,
		AutoCompleteModule,
		MultiSelectModule,
		RadioButtonModule,
		GrowlModule,
		DataTableModule,
		InputSwitchModule,
		OverlayPanelModule,
		ProgressSpinnerModule,
		DialogModule,
		TabViewModule
	],
	exports : [ MainPayment ],
	declarations: [MainPayment, FormDokuComponent],
	providers : [ PaymentService ]
})
export class PaymentModule { }

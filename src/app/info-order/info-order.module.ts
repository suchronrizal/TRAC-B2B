import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule }   from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MainInfoOrderComponent } from './main-info-order/main-info-order.component';
import { InfoOrderService } from './info-order.service';

// PrimeNG
import { 
	ProgressSpinnerModule,
} from 'primeng/primeng';

@NgModule({
	imports: [
		HttpModule,
		CommonModule,
		FormsModule,
		RouterModule,

		// PrimeNG
		ProgressSpinnerModule
	],
	declarations: [MainInfoOrderComponent],
	providers: [InfoOrderService]
})
export class InfoOrderModule { }

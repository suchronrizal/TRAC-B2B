import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationEnd, Event} from '@angular/router';

import { MainService } from '../../lib/service/main.service';
import { PaymentService } from '../payment.service';

declare var $:any;
declare function getForm(data: any) : void;

@Component({
	selector: 'app-form-doku',
	templateUrl: './form-doku.component.html',
	styleUrls: ['./form-doku.component.scss']
})
export class FormDokuComponent implements OnInit {
	private data = {};
	private isSuccess: boolean = false;

	constructor(
		private router: Router,
		private paymentService: PaymentService,
		private mainService: MainService,
		private activeRoute: ActivatedRoute,
	){

		setInterval(() =>{
			$('.wrap-form-doku').each(() =>{
				$("a").removeAttr("href");
				var findSuccess = $('.wrap-form-doku').find('.success');
				if(findSuccess.length){
					if(!this.isSuccess){
						this.isSuccess = true;
						this.submitUser();						
					}
				}
			});
		}, 1000);
	}

	// Submit User 
	private mechantId;
	submitUser(){
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let obj = {
			req_trans_id_merchant: this.mechantId,
			createdBy: dataUser.Id
		};
		this.paymentService.postUserPaymentCC(obj).subscribe(res =>{
			$('.wrap-action').removeClass('hide');
		}, err =>{
			// console.log(err);
		});
	}

	ngOnInit() {
		// subscribe to router event
		this.activeRoute.queryParams.subscribe((params: Params) => {
			this.data['req_merchant_code'] = params.mall_id; //mall id or merchant id
			this.data['req_chain_merchant'] = params.chain_merchant; //chain merchant id
			this.data['req_payment_channel'] = params.payment_channel; //payment channel
			this.data['req_server_url'] = params.server_url; //merchant payment url to receive pairing code & token
			this.data['req_transaction_id'] = params.trans_id; //invoice no
			this.data['req_amount'] = Number(params.amount).toFixed(2);
			this.data['req_currency'] = params.currency; //360 for IDR
			this.data['req_words'] = params.words; //your merchant unique key
			this.data['req_session_id'] = params.session_id; //your server timestamp
			this.data['req_form_type'] = params.form_type;
			this.data['req_customer_id'] = params.customerId;

			this.mechantId = params.trans_id;
		});	
	}

	ngAfterViewInit(){
		getForm(this.data);
	}

	goToHome(){
		window.location.replace(this.mainService['baseUrl']);
	}

}

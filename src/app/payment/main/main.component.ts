import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MainService } from '../../lib/service/main.service';
import { PaymentService } from '../payment.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainPayment implements OnInit {
	// ================================ //
	// Note :
	// - BCA mempunyai value 29
	// - Creditcard mempunyai value 15
	// - Req Sample URL = /payment?amount=1500000&invoiceId=INV-2018041600001
	// ================================ //

	private index: number = null;
	private indexPaid: number = 0;
	private paid: boolean = false;
	public loading: boolean;
	private dataPayment = null;
	private isError: boolean = false;
	private amount;
	private invoiceId;
	private vaBCA;

	constructor(
		private activeRoute: ActivatedRoute,
		private router: Router,
		private mainService: MainService,
		private paymentService: PaymentService
	) {}

	ngOnInit() {
		// subscribe to router event
		this.activeRoute.queryParams.subscribe((params: Params) => {
			if(params['invoiceId'] == undefined){
				this.router.navigate(['/p']);
			}else{
				this.amount = Number(params['amount']);
				this.invoiceId = params['invoiceId'];
			}
		});	
		if(this.mainService['token'] == null){
            this.router.navigate(['/user/login'],{ queryParams: { onpayment: 1, amount: this.amount, invoiceId: this.invoiceId } }); 
        }else{
			this.fetchPaymentType();
		}
	}

	// Fetch Payment Type
    // ============================= //
    fetchPaymentType(){
		this.loading = true;
		this.isError = false;
		let dataUser = JSON.parse(this.mainService['dataUser']);
		if(dataUser.UserProfileB2B[0] != null){
			this.paymentService.getPayment(dataUser.UserProfileB2B[0].CustomerId).subscribe(res =>{
				this.loading = false;			
				this.dataPayment = res.Data;
				this.dataPayment.IsCreditCard = this.dataPayment.IsCreditCard == '1' ? true : false;
				this.dataPayment.IsNonCVV = this.dataPayment.IsNonCVV == '1' ? true : false;
				this.dataPayment.IsVirtualAccountBCA = this.dataPayment.IsVirtualAccountBCA == '1' ? true : false;
			}, err =>{
				this.loading = false;
				this.isError = true;
				if(err.status == 401){
					this.mainService.updateToken(() =>{
						this.fetchPaymentType();
					});
				}
	
				if(err.name == "TimeoutError"){
					this.fetchPaymentType();
				}
			});
		}
	}

	onOpen(e){
		this.index = e.index;
	}

	private submitPayment: boolean = false;
	private errPayment: boolean = false;
	onPaid(){
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let channel = this.index == 0 ? 29 : 15;
		let obj = {
			amount: this.amount.toFixed(2),
			trans_id: this.invoiceId,
			cust_id: dataUser.UserProfileB2B[0].CustomerId,
			payment_channel: channel
		}

		this.submitPayment = true;
		this.errPayment = false;
		switch(channel){
			case 29 : 
				this.paymentService.postPaymentVA(obj).subscribe(res =>{
					this.paid = true;
					this.vaBCA = res.va_bca;
				}, err =>{
					this.errPayment = true;
					this.submitPayment = false;
				});
			break;
			case 15 :
				this.paymentService.postPaymentCC(obj).subscribe(res =>{
					let obj = {
						invoiceId: this.invoiceId,
						customerId: dataUser.UserProfileB2B[0].CustomerId,
					}
					this.router.navigate(['/form-doku'],{ queryParams: _.merge(res.Data,obj)}); 
				}, err =>{
					this.errPayment = true;
					this.submitPayment = false;
				});
		}
	}
}

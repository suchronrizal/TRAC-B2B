import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SelectItem, Paginator } from 'primeng/primeng';
import * as queryString from 'query-string';

import { MainService } from '../../lib/service/main.service';
import { BillingService } from '../billing.service';

import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';

@Component({
	selector: 'app-main-billing',
	templateUrl: './main-billing.component.html',
	styleUrls: ['./main-billing.component.scss']
})
export class MainBillingComponent implements OnInit {
	// ============================================================================== //
	// Properties
	// ============================================================================== //
	public data = [];
	public cols: any[];
	public loading: boolean;
	public dataUser = null;
	public categoryFilter: SelectItem[]
	public errorHandling: any = {}
	private selectedValues: string[];
	private selectedData: String[];
	public displayConfirm: boolean = false;
	private paginateTable: boolean = true;
	// Notification
	// =========================== //
	public msgs: Message[] = [];
	public maxDateValue = new Date();

	@ViewChild('filterSearch') filterSearch;
	@ViewChild('p') paginator : Paginator

	constructor(
		private billingService: BillingService,
		private mainService: MainService,
		private router: Router,
		private route: ActivatedRoute,
	){
		this.categoryFilter=[
			{value:'0', label:'Invoice Code'},
			{value:'1', label:'SAP Billing Code'},
			{value:'2', label:'Tax Invoice Number'}
		]

    this.maxDateValue.setDate(this.maxDateValue.getDate());
	}

	ngOnInit() { 
		this.cols = [
			{
				field: 'InvoiceCode', 
				header: 'Invoice Code',
				filter: true, 
        filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false,
				sortable: true
			},{
				field: 'CustomerName', 
				header: 'Customer Name',
				filter: true, 
        filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},{
				field: 'BillingSAPCode', 
				header: 'SAP Billing Code',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},{
				field: 'FakturPajak', 
				header: 'Tax Invoice Number',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},{
				field: 'PriceTotalInvoice', 
				header: 'Total Invoice',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},{
				field: 'UpdatedDate', 
				header: 'Last Updated',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'StatusInvoiceName', 
				header: 'Invoice Status',
				filter: true, 
        filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'PICUserInvoiceEmail', 
				header: 'PIC User Invoice Email',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'SendMail', 
				header: 'Send Mail',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},{
				field: 'CreatedDate', 
				header: 'Created Date',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			}
		];

		let filterChecked = [];
		_.map(this.cols, (x)=>{
			if(x.checked){
				filterChecked.push(x.field);
			}
		});
		this.selectedValues = filterChecked;
		this.dataUser = JSON.parse(this.mainService['dataUser']);
		this.creatUrl();
		this.fetchData();
		this.fetchCustomer();
	}

	// Toggle Checkbox Columns
	// =========================== //
	checkBox(e){
		if(e.checked){
			e.checked = false;
		} else {
			e.checked = true;
		}  
	}

	// ============================================================================== //
	// Fetch Procust
	// ============================================================================== //
	fetchData(){
		this.loading = true;
		this.billingService.getBilling(this.setUrl+'&page=' + this.page + '&Limit='+this.pageRows).subscribe(res =>{
			this.loading = false;
			this.data = res.Data.data;
			this.totalRecords = res.Data.total;
			_.map(this.data, (x) =>{
				x.CreatedDate = moment(x.CreatedDate).format("DD MMM YYYY");
				x.SOCreatedDate = moment(x.SOCreatedDate).format("DD MMM YYYY");
				x.UpdatedDate = moment(x.UpdatedDate).format("DD MMM YYYY");
				x.PriceTotalInvoice = "Rp " + Number(x.PriceTotalInvoice).toLocaleString();

				_.map(x.invoice_detail, (y) =>{
					y.Price = "Rp " + Number(y.Price).toLocaleString();
					y.PriceExtend = "Rp " + Number(y.PriceExtend).toLocaleString();
					y.PriceOLC = "Rp " + Number(y.PriceOLC).toLocaleString();
					y.PriceTrip = "Rp " + Number(y.PriceTrip).toLocaleString();
				});

				this.fetchStatusBilling(x);
			});
		}, err =>{
			if(err.status == 401){
				this.mainService.updateToken(() =>{
					this.fetchData();
				});
			}

			if(err.name == "TimeoutError"){
				this.fetchData();
			}
		});
	}

	fetchStatusBilling(obj){
		this.billingService.getStatusBilling(obj.StatusInvoice).subscribe(res =>{
			obj['StatusInvoiceName'] = res.Data[0].StatusInvoiceName;
		}, err=>{
			if(err.status == 401){
				this.mainService.updateToken(() =>{
					this.fetchStatusBilling(obj);
				});
			}

			if(err.name == "TimeoutError"){
				this.fetchStatusBilling(obj);
			}
		})
	}
	lookupRowStyleClass(data){
		return data.StatusInvoice == 'INV-003' ? 'td-paid' : null;
	}

	// Read User Access 
	// ============================ //
	private setUrl:String='';
	private role;
	public selectedCateogryFilter;
	public searchValue:string='';
	creatUrl(){
		let catFil='';
		if(this.selectedCateogryFilter!=null){
			if(this.selectedCateogryFilter==0){
				catFil='&InvoiceCode='+this.searchValue;
			}else if(this.selectedCateogryFilter==1){
				catFil='&BillingSAPCode='+this.searchValue;
			}else{
				catFil='&FakturPajak='+this.searchValue
			}
		}
		let selectInvoice='';
		if(this.selectedInvoiceState != null){
			selectInvoice = '&StatusInvoice=' + this.selectedInvoiceState;
		}

		let selectDate;
		if(this.selectedDate == undefined){
			selectDate = '';
		}else{
			selectDate = '&StartDate=' + moment(this.selectedDate[0]).format('YYYY-MM-DD') + '&EndDate=' + moment(this.selectedDate[1]).format('YYYY-MM-DD');
		}

		let selectCustomer;
		if(this.selectedCustomer == null){
			selectCustomer = '';
		}else{
			selectCustomer = '&CustomerId=' + this.selectedCustomer;
		}

		let dataUser = JSON.parse(this.mainService['dataUser']);
		if(dataUser != null){
			if(dataUser.UserProfileB2B[0] != null){
				this.setUrl = 'limit?UserId=' + dataUser.Id + '&CustomerId=' + dataUser.UserProfileB2B[0].CustomerId + '&BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId + selectDate + selectInvoice + selectCustomer  + catFil;
			}else{
				switch(dataUser.RoleId){
					case 'RL-001' :
						this.setUrl = 'limit?UserId=' + dataUser.Id + selectDate + selectInvoice + selectCustomer + catFil;
					break;
					case 'RL-002' :
						this.setUrl = 'limit?UserId=' + dataUser.Id + '&BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId + selectDate + selectInvoice + selectCustomer + catFil; 
					break;
					case 'RL-006' :
						this.setUrl = 'limit?UserId=' + dataUser.Id + '&BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId + selectDate + selectInvoice + selectCustomer + catFil; 
					break;
				}
			}
		}	
	}

	// Search all ====================== //
	searchAll = (event) =>{
		this.page=1;
		this.paginator.changePageToFirst(event)
		this.errorHandling={}
		this.creatUrl();
		setTimeout(()=>{
			this.fetchData();
		},300);
	}

// Pagination ======================== //
	public page = 1;
	public pageRows = 20;
	public totalRecords = 0;
	paginate(e){
		this.page = e.page + 1;
		this.fetchData();
	}

// selected date
// modify date 18-10-19 by rizal, because of all filter data with once click
// selectRangeDate = e => {
// 	if (this.selectedDate[1] != null) {
// 		const parsed = queryString.parse(this.setUrl);
// 		parsed.StartDate = moment(this.selectedDate[0]).format('YYYY-MM-DD');
// 		parsed.EndDate = moment(this.selectedDate[1]).format('YYYY-MM-DD');
// 		this.setUrl = queryString.stringify(parsed);
// 	}
// }

	// Dialog Invoice
	// ================================= //
	public detailInvoice = null;
	public selectedInvoice = null;
	public widthDetail = 750;
	public displayDetailInvoice: boolean = false;
	viewItem(e){
		this.widthDetail = 750;
		this.displayDetailInvoice = true;
		this.detailInvoice = e.InvoiceCode;
		this.selectedInvoice = e;
		this.isViewDetail = false;
		setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 50);
	}

	public isViewDetail: boolean = false;
	private selectedDetail = null;
	selectDetail(e){
		this.widthDetail = 500;
		this.selectedDetail = e;
		this.isViewDetail = true;
		setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 50);
	}
	backToListDetail(){
		this.widthDetail = 750;
		this.isViewDetail = false;
		setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 50);
	}

	concatData(arr){
		let arrData = [];
		_.map(arr, (x)=>{
			_.map(x.invoice_detail,(y)=>{
				let obj = {
					header: x,
					body: y
				};
				arrData.push(obj);
			});
		});
		_.map(arrData,(x)=>{
			delete x.header.invoice_detail;
		});
		return arrData;
	}

	// Export All Data
	// =========================== //
	downloadCSV(){
		this.loading = true;
		this.creatUrl();
		if (this.selectedDate != undefined) {
			let checkRangeDate =
      moment(this.selectedDate[1] ? this.selectedDate[1] : this.selectedDate[0]).diff(this.selectedDate[0], 'days') < 31;
			this.billingService.getBilling(this.setUrl+'&DownloadReport=1').subscribe(res =>{
				if (this.selectedDate[0] != null) {
					if (checkRangeDate) {
						this.mainService.exportDataCsv(res.Data,'Report Billing');
						this.loading = false;
						this.errorHandling={}
					}else{
						this.loading = false;
						this.errorHandling = {
							errStatus: true,
							msg: 'Limited 31 days!'
						};
					}
				}
			});
		}else{
			this.loading = false;
			this.errorHandling = {
				errStatus: true,
				msg: 'Required!'
			};
		}
	}
	downloadXLS() {
		this.loading = true;
		this.creatUrl();
		if (this.selectedDate != undefined) {
			let checkRangeDate =
        moment(this.selectedDate[1] ? this.selectedDate[1] : this.selectedDate[0]).diff(this.selectedDate[0], 'days') < 31;
			this.billingService.getBilling(this.setUrl+'&DownloadReport=1').subscribe(res =>{
				if (this.selectedDate[0] != null) {
					if (checkRangeDate) {
						this.mainService.exportDataXls(res.Data,'Report Billing');
						this.loading = false;
						this.errorHandling = {};
					}else{
						this.loading = false;
						this.errorHandling = {
							errStatus: true,
							msg: 'Limited 31 days!'
						};
					}
				}
			});
		}else{
			this.loading = false;
			this.errorHandling = {
				errStatus: true,
				msg: 'Required!'
			};
		}
	}

	// Filter Billing 
	// ========================================== //
	public selectedDate: Date;
	// onSelectDate(){
	// 	if(this.selectedDate[1] != null){
	// 		this.creatUrl();
	// 		this.fetchData();
	// 	}
	// }

	public invoiceStateList = [
		{label: 'All Status', value: null},
		{value: 'INV-001', label: 'SO Not Created'},
		{value: 'INV-002', label: 'SO Created'},
		{value: 'INV-003', label: 'Paid'},
		{value: 'INV-004', label: 'Confirm By Finance'}
	];
	public selectedInvoiceState: string = this.invoiceStateList[0].value;
	// selectInvoiceState(){
	// 	this.creatUrl();
	// 	this.fetchData();
	// }

	resetFilter(event){
		this.page=1;
		this.paginator.changePageToFirst(event);
		this.selectedCustomer=null;
		this.selectedCateogryFilter=null;
		this.searchValue='';
		this.selectedInvoiceState = null;
		this.selectedDate = undefined;
		this.creatUrl();
		setTimeout(()=>{
			this.fetchData();
		},300);
		
		this.errorHandling={};
	}


	// Payment 
	// ========================================= //
	public displayupdateBilling: boolean = false;
	private submitPayment: boolean = false;
	public updateBillingBtn: boolean = false;
	private invoiceId = null;
	public BillingSAPCode;
	public FakturPajak;
	
	submitupdateBilling(e){
		this.updateBillingBtn = true;
		this.billingService.updateBilling(e,this.invoiceId).subscribe(res =>{
			this.updateBillingBtn = false;
			this.fetchData();
			this.closeupdateBilling();
			this.msgs = [];
			this.msgs.push({severity:'success', summary: 'Success', detail: 'Success update'});
		}, err =>{
			this.updateBillingBtn = false;
			this.msgs = [];
			this.msgs.push({severity:'error', summary: 'Failed', detail: 'Filed update'});
		});
	}	
	selectUpdate(e){
		this.displayConfirm = false;
		this.displayDetailInvoice = false;
		this.displayupdateBilling = true;
		this.invoiceId = e.InvoiceCode;
		this.BillingSAPCode = e.BillingSAPCode;
		this.FakturPajak = e.FakturPajak;
		var elem = document.getElementById("body").setAttribute( 'class', 'on' );
		setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 50);
	}
	closeupdateBilling(){
		this.displayupdateBilling = false;
		this.invoiceId = null;
		setTimeout(()=>{
			var elem = document.getElementById("body").classList.remove("on");
		}, 500);
	}

	// ============================== //
	// Display List Order
	// ============================== //
	public displayListOrder: boolean = false;
	public loadingListORder: boolean = false;
	public listOrder = [];
	public selectedReservation = null;
	viewOrderInvoice(obj){
		this.selectedReservation = obj;
		this.displayListOrder = true;
		this.displayDetailInvoice = false;
		this.loadingListORder = true;
		this.billingService.getOrderHistoryDetail(obj.ReservationCode).subscribe(res =>{
			this.listOrder = res.Data.details;
			_.map(this.listOrder,(x)=>{
				x['submitButton'] = false;
			});
			this.loadingListORder = false;
			var elem = document.getElementById("body").setAttribute( 'class', 'on' );
			setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 50);
		}, err=>{
			this.loadingListORder = false;
			var elem = document.getElementById("body").setAttribute( 'class', 'on' );
			setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 50);

			if(err.status == 401){
				this.mainService.updateToken(() =>{
						this.viewOrderInvoice(obj);
				});
			}

			if(err.name == "TimeoutError"){
					this.viewOrderInvoice(obj);
			}
		});
	}
	closeListOrder(){
		this.selectedReservation = null;
		this.displayListOrder = false;
		this.displayDetailInvoice = true;
		setTimeout(()=>{
			window.dispatchEvent(new Event('resize'));
			var elem = document.getElementById("body").classList.remove("on");
		}, 500);
	}

	// ============================== //
	// Update SO Number
	// ============================== //
	public onUpdateSONumber: boolean = false;
	updateSONumber(item){
		item.submitButton = true;
		this.onUpdateSONumber = true;
		let obj = {
			NumberSO: item.NumberSO,
			InvoiceCode: this.selectedInvoice.InvoiceCode
		};
		this.billingService.putSONumber(obj,item.BookingOrderId).subscribe(res =>{
			item.submitButton = false;
			this.onUpdateSONumber = false;

			this.msgs = [];
			this.msgs.push({severity:'success', summary: 'Success', detail: 'Success update SO Number'});
		}, err=>{
			item.submitButton = false;
			this.onUpdateSONumber = false;

			this.msgs = [];
			this.msgs.push({severity:'error', summary: 'Failed', detail: 'Failed update SO Number'});
		});
	}

	// =========================== //
	// Fetch Customer
	// =========================== //
	public customers = [];
	public selectedCustomer = null;
	// selectCustomer(){
	// 	this.creatUrl();
	// 	this.fetchData();
	// }

	fetchCustomer(){
		this.customers = [{label: 'All Customer', value: null}];
		this.billingService.getCustomer().subscribe(res =>{
			_.map(res.Data, (x)=>{
				let obj = {
					value: x.CustomerId,
					label: x.CustomerName
				};
				this.customers.push(obj);
			});
			this.selectedCustomer = this.customers[0].value;
		}, err =>{
			if(err.status == 401){
				this.mainService.updateToken(() =>{
					this.fetchCustomer();
				});
			}

			if(err.name == "TimeoutError"){
				this.fetchCustomer();
			}
		});
	}
	public invoiceCode=null;
	confirmDisplay(item){
		this.displayConfirm=true
		this.invoiceCode=item.InvoiceCode;
	}
	confirmPayment(){
		let item=this.invoiceCode
		let obj ={StatusInvoice: 'INV-003'};
		this.loading = true;
		this.billingService.putInvoiceHeader(obj,item).subscribe(res =>{
			this.loading = false;
			this.displayConfirm=false;
			this.fetchData();
			this.msgs = [];
			this.msgs.push({severity:'success', summary: 'Success', detail: 'Success update invoice status'});
		}, err=>{
			this.displayConfirm=false;
			this.loading = false;
			this.msgs = [];
			this.msgs.push({severity:'error', summary: 'Failed', detail: 'Failed update update invoice status'});
		})
	}

	closeDialogConfirm(){
		this.displayConfirm=false;
		this.invoiceCode=null
	}

	convertDateTime(str){
		var date = moment(str.substring(0, 10)).format("DD MMM YYYY") + " - " + str.substring(11,16);	
		return str = date;
	}
}

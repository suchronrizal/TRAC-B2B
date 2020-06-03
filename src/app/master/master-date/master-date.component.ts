import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { MainService } from '../../lib/service/main.service';
import { MasterService } from '../master.service';
import { Message } from 'primeng/components/common/api';

@Component({
  selector: 'app-master-date',
  templateUrl: './master-date.component.html',
  styleUrls: ['./master-date.component.scss']
})
export class MasterDateComponent implements OnInit {
	// ============================================================================== //
	// Properties
	// ============================================================================== //
	public data = [];
	public cols: any[];
	public loading: boolean;
	private selectedValues: string[];
	private paginateTable: boolean = true;

	// Notification
	// =========================== //
	public msgs: Message[] = [];

	@ViewChild('filterSearch') filterSearch;

	constructor(
		private mainService: MainService,
		private masterService: MasterService,
	) { }

	ngOnInit() {
		this.cols = [
			{
				field: 'Id', 
				header: 'Id',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'DateName', 
				header: 'Date',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'Description', 
				header: 'Description',
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
		this.fetchAllDates();
	}

	fetchAllDates(){
		this.loading = true;
		this.masterService.getAllDate().subscribe(res =>{
			if(res.Data.length){
				_.map(res.Data, (x)=>{
					x.DateName = moment(x.Date).format('DD MMM YYYY');
				});
			}
			this.data = res.Data;
			this.loading = false;
		}, err =>{
			this.loading = false;
			if(err.status == 401){
				this.mainService.updateToken(() =>{
					this.fetchAllDates();
				});
			}

			if(err.name == "TimeoutError"){
				this.fetchAllDates();
			}
		})
	}

	// Submit Date
	// =========================== //
	public displayDate: boolean = false;
	public Date = null;
	public Description = null;
	public selectedDateItem = null;
	public onSubmitBtn: boolean = false;
	onSubmit(e){
		e.Date = moment(e.Date).format('YYYY-MM-DD');
		this.onSubmitBtn = true;

		if(this.selectedDateItem == null){
			this.masterService.postDate(e).subscribe(res =>{
				this.fetchAllDates();
				this.closeDisplayDate();
				this.onSubmitBtn = false;
				this.msgs = [];
				this.msgs.push({severity:'success', summary: 'Success', detail: 'Save Date'});
			}, err =>{
				this.onSubmitBtn = false;
				this.msgs = [];
				this.msgs.push({severity:'error', summary: 'Failed', detail: 'Save Date'});
			});
		}else{
			this.masterService.putDate(e,this.selectedDateItem.Id).subscribe(res =>{
				this.fetchAllDates();
				this.closeDisplayDate();
				this.onSubmitBtn = false;
				this.msgs = [];
				this.msgs.push({severity:'success', summary: 'Success', detail: 'Update Date'});
			}, err =>{
				this.onSubmitBtn = false;
				this.msgs = [];
				this.msgs.push({severity:'error', summary: 'Failed', detail: 'Update Date'});
			});
		}
	}
	showDialog(){
		this.displayDate = true;
		var elem = document.getElementById("body").setAttribute( 'class', 'on' );
	}
	selectUpdate(e){
		this.displayDate = true;
		this.selectedDateItem = e;
		this.Date = moment(e.Date)['_d'];
		this.Description = e.Description;
		var elem = document.getElementById("body").setAttribute( 'class', 'on' );
	}
	closeDisplayDate(){
		this.displayDate = false;
		setTimeout(()=>{
			var elem = document.getElementById("body").classList.remove("on");
		}, 500);
	}

	// Delete Menu
	// =========================== //
	public titleRemove = null;
	public displayConfirm: boolean = false;	
	public submitButtonRemove: boolean = false;
	removeData(){
		this.submitButtonRemove = true;
		this.masterService.deleteMasterDate(this.selectedDateItem.Id).subscribe(res =>{
			this.fetchAllDates();
			this.closeDialogConfirm();
			this.submitButtonRemove = false;
			this.msgs = [];
			this.msgs.push({severity:'success', summary: 'Success', detail: 'Delete menu'});
		}, err =>{
			this.submitButtonRemove = false;
			this.msgs = [];
			this.msgs.push({severity:'error', summary: 'Failed', detail: 'Delete menu'});
		});
	}
	selectRemove(e){
		this.selectedDateItem = e;
		this.displayConfirm = true;
		this.titleRemove = 'Remove date ' + moment(e.Date).format('DD MMM YYYY');
	}
	closeDialogConfirm(){
		this.selectedDateItem = null;
		this.displayConfirm = false;
	}
}

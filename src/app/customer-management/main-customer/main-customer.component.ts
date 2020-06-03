import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as _ from 'lodash';
import { CustomerManagementService } from '../customer-management.service';
import { MainService } from '../../lib/service/main.service';

@Component({
  selector: 'app-main-customer',
  templateUrl: './main-customer.component.html',
  styleUrls: ['./main-customer.component.scss']
})
export class MainCustomerComponent implements OnInit {
  private data = [];
  public filterData = [];
  public cols: any[];
  public loading: boolean;
  private selectedValues: string[];
  private selectedData: String[];
  private selectAll: boolean = false;
  public showDropdown: boolean = false;

  @ViewChild('filterSearch') filterSearch;

  constructor(
    private mainService: MainService,
    private customerSerive: CustomerManagementService
  ) {}

  ngOnInit() {
    if (this.mainService['dataUser'] != null) {
      let dataUser = JSON.parse(this.mainService['dataUser']);
      if (dataUser.UserIndicator[0].RoleIndicatorId == 'MRI001') {
        this.showDropdown = true;
      }
    }

    this.cols = [
      {
        field: 'CustomerId',
        header: 'Customer Id',
        filter: true,
        filterMatchMode: 'contains',
        ref: this.filterSearch,
        checked: true,
        disableCol: true
      },
      {
        field: 'ARStatus',
        header: 'AR Status',
        filter: true,
        filterMatchMode: 'contains',
        ref: this.filterSearch,
        checked: true,
        disableCol: false
      },
      {
        field: 'BillingContact',
        header: 'Billing Contact',
        filter: true,
        filterMatchMode: 'contains',
        ref: this.filterSearch,
        checked: true,
        disableCol: false
      },
      {
        field: 'CustomerName',
        header: 'Customer Name',
        filter: true,
        filterMatchMode: 'contains',
        ref: this.filterSearch,
        checked: true,
        disableCol: false
      },
      {
        field: 'CustomerSAPCode',
        header: 'Customer SAP Code',
        filter: true,
        filterMatchMode: 'contains',
        ref: this.filterSearch,
        checked: true,
        disableCol: false
      },
      {
        field: 'CustomerSAPCodeandNameForLookup',
        header: 'Customer SAP Code and Name For Lookup',
        filter: true,
        filterMatchMode: 'contains',
        ref: this.filterSearch,
        checked: false,
        disableCol: false
      },
      {
        field: 'DeliveryContact',
        header: 'Delivery Contact',
        filter: true,
        filterMatchMode: 'contains',
        ref: this.filterSearch,
        checked: false,
        disableCol: false
      },
      {
        field: 'Email',
        header: 'Email',
        filter: true,
        filterMatchMode: 'contains',
        ref: this.filterSearch,
        checked: true,
        disableCol: false
      },
      {
        field: 'BusinessUnitId',
        header: 'Business Unit Id',
        filter: true,
        filterMatchMode: 'contains',
        ref: this.filterSearch,
        checked: true,
        disableCol: false
      },
      {
        field: 'NameForLookup',
        header: 'Name For Lookup',
        filter: true,
        filterMatchMode: 'contains',
        ref: this.filterSearch,
        checked: false,
        disableCol: false
      },
      {
        field: 'OrderContact',
        header: 'Order Contact',
        filter: true,
        filterMatchMode: 'contains',
        ref: this.filterSearch,
        checked: false,
        disableCol: false
      },
      {
        field: 'Phone',
        header: 'Phone',
        filter: true,
        filterMatchMode: 'contains',
        ref: this.filterSearch,
        checked: false,
        disableCol: false
      },
      {
        field: 'RemainingCreditLimit',
        header: 'Remaining Credit Limit',
        filter: true,
        filterMatchMode: 'contains',
        ref: this.filterSearch,
        checked: false,
        disableCol: false
      },
      {
        field: 'ServiceLevelAgreement',
        header: 'Service Level Agreement',
        filter: true,
        filterMatchMode: 'contains',
        ref: this.filterSearch,
        checked: false,
        disableCol: false
      }
    ];

    let filterChecked = [];
    _.map(this.cols, x => {
      if (x.checked) {
        filterChecked.push(x.field);
      }
    });
    this.selectedValues = filterChecked;
    this.fetchData();
  }

  // Toggle Checkbox
  // ====================== //
  checkBox(e) {
    if (e.checked) {
      e.checked = false;
    } else {
      e.checked = true;
    }
  }

  // Fetch Data
  // ========================== //
  fetchData() {
    this.loading = true;
    this.customerSerive.getCustomer().subscribe(
      res => {
        this.data = res.Data;

        if (this.mainService['dataUser'] != null) {
          let dataUser = JSON.parse(this.mainService['dataUser']);
          if (dataUser.UserIndicator[0].RoleIndicatorId == 'MRI001') {
            this.filterData = res.Data;
          } else {
            this.filterData = _.filter(this.data, {
              BusinessUnitId: dataUser.UserCompanyMapping[0].BusinessUnitId
            });
          }
        }

        if (res.Data.length) {
          _.map(this.data, x => {
            x.routerLink = _.kebabCase(x.CustomerName);
          });
        }

        this.loading = false;
      },
      err => {
        if (err.status == 401) {
          this.mainService.updateToken(() => {
            this.fetchData();
          });
        }
      }
    );
  }

  // Filter Business Unit
  // =========================== //
  private selectedBusinessUnit = null;
  private businessUnits = [
    { label: 'All', value: null },
    { label: '0102', value: '0102' },
    { label: '0104', value: '0104' }
  ];
  selectBusinessUnit(e) {
    if (this.selectedBusinessUnit == null) {
      this.filterData = this.data;
    } else {
      this.filterData = _.filter(this.data, {
        BusinessUnitId: this.selectedBusinessUnit
      });
    }
  }

  // Export All Data
  // =========================== //
  downloadCSV() {
    this.loading = true;
    this.customerSerive.getCustomer().subscribe(res => {
      this.mainService.exportDataCsv(res.Data, 'Report Billing');
      this.loading = false;
    });
  }
  downloadXLS() {
    this.loading = true;
    this.customerSerive.getCustomer().subscribe(res => {
      this.mainService.exportDataXls(res.Data, 'Report Billing');
      this.loading = false;
    });
  }
}

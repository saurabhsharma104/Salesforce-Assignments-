import { api, LightningElement } from 'lwc';

export default class Pagination extends LightningElement {

    TotalAccounts = [];
    RecordPerPage = 5;
    TotalPages = 0;
    curentPage = 1;

    //setter method...
    @api
    set records(data){
        if(data){
            this.TotalAccounts = data;
            this.TotalPages = Math.ceil(data.length/this.RecordPerPage);
            this.updateRecords();
        }
    }

    // getter method...
    get records(){
        return this.TotalAccounts;
    }

    updateRecords(){
        const start = (this.curentPage-1)*this.RecordPerPage
        const end = this.curentPage * this.RecordPerPage
        this.visibleAccounts = this.TotalAccounts.slice(start, end)
        this.dispatchEvent(new CustomEvent('update',{
            detail:{
                records:this.visibleAccounts,
                offset:start
            }
        }))
    }

    // Handle previous button event
    previousHandler(){
        if(this.curentPage > 1){
            this.curentPage -= 1;
            this.updateRecords();
        }
    }
    // disable previous button if you are already on the first page...
    get disablePrevious(){
        return this.curentPage <= 1;
    }

    //handle next button event...
    nextHandler(){
        if(this.curentPage < this.TotalPages){
            this.curentPage += 1;
            this.updateRecords();
        }
    }
    // disable next button if you are already on the last page...
    get disableNext(){
        return this.curentPage >= this.TotalPages;
    }

}
import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
    selector: '[equalgrid]'
})
export class equalGridDirective {
    
    @Input() equalgrid;
    constructor(
        private el: ElementRef
    ){}

    // Window On Load
    @HostListener('window:load', ['$event']) onLoad(event) {
        this.matchHeight(this.el.nativeElement,this.equalgrid);
    }

    // Window On Resize
    @HostListener('window:resize', ['$event']) onResize(event) {
        setTimeout(()=>{
            this.matchHeight(this.el.nativeElement,this.equalgrid);            
        }, 250);
    }

    // Match Height
    matchHeight(parent: HTMLElement, children: string){
        let fullWidth = this.el.nativeElement.clientWidth;
        let arrHeight = [];
        let arrWidth = [];
        let groupColumn = [];
        let elements = parent.getElementsByClassName(children) as HTMLCollectionOf<HTMLElement>;

        // Initial Height
        for(let i=0; i<elements.length; i++){
            elements[i].style.height = 'auto';
            var obj = {
              index: i,
              height: elements[i].clientHeight
            };
            arrHeight.push(obj);
            arrWidth.push(elements[i].clientWidth);
            let width = arrWidth.reduce((a,b)=>{
                return a + b;
            }, 0);

            if(width >= (fullWidth - 1) && width <= (fullWidth + 1)){
                groupColumn.push(arrHeight.slice(0,i + 1));
                arrWidth = [];
                arrHeight = [];
            }
        }

        // Set Equal Height
        for(let i=0; i<groupColumn.length; i++){
            var arrgroupheight = [];
            var group = groupColumn[i];
            group.map((col)=>{
                arrgroupheight.push(col.height);
            });
            var maxHeight = Math.max.apply(Math, arrgroupheight);
            group.map((col)=>{
                elements[col.index].style.height = maxHeight + 'px'; 
            });
        }
    }

}
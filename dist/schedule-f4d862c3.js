(window.webpackJsonpCheckout=window.webpackJsonpCheckout||[]).push([[15],{1693:function(e,t,a){},1809:function(e,t,a){"use strict";a.r(t),a.d(t,"mapToScheduleProps",(function(){return N}));var i=a(28),n=a(1784),s=a.n(n),l=a(0),r=a.n(l),o=a(415),h=a(109),c=a(67),d=a(416),u=a(292),m=a(1359),v=a(1369),p=a(1367),D=a(421);var g=Object(u.a)(Object(h.withFormik)({mapPropsToValues:({selectedDateNum:e,selectedTime:t})=>({selectedDateNum:e||-1,selectedTime:t?t.displayString:""}),handleSubmit:(e,{props:{onSubmitSchedule:t,selectedDateNum:a,selectedTime:i}})=>{t({selectedDateNum:a||-1,selectedTime:i?i.displayString:""})},validationSchema:()=>{const e=Object(c.number)().integer(),t=Object(c.string)().max(256);return Object(c.object)({dateNum:e,time:t})}})(Object(l.memo)(({selectedDateNum:e,selectedTime:t})=>{const a=null!=e&&null!=t;return r.a.createElement(v.a,{className:"checkout-form",id:"checkout-schedule",testId:"checkout-schedule"},r.a.createElement(p.a,null,r.a.createElement(D.a,{type:"hidden",name:"selectedDateNum",value:e}),r.a.createElement(D.a,{type:"hidden",name:"selectedTime",value:null==t?void 0:t.displayString}),r.a.createElement("div",{className:"form-actions"},r.a.createElement(m.c,{disabled:!a,id:"checkout-schedule-continue",variant:m.b.Primary,type:"submit"},r.a.createElement(d.a,{id:"common.continue_action"})))))})));a(1693);class S{constructor(){this.staleLimit=3e4,this.staleTimer=8e3,this.hasData=!1,this.isStale=!0,this.lastUpdate=-1*this.staleLimit,this.updateCounter=0,setInterval(this.checkStaleness,this.staleTimer)}checkStaleness(){if(!this.isStale&&this.currentMonth){Date.now()-this.lastUpdate>this.staleLimit&&(this.isStale=!0,this.updateAllData(this.currentMonth))}}isUpdating(){return 0==this.updateCounter}getInfoForDate(e){var t;if(this.hasData){if(e.getMonth()!=(null===(t=this.currentMonth)||void 0===t?void 0:t.value)||e.getFullYear()!=this.currentMonth.year)throw new Error("Date is not in the month currently being viewed");return this.currentMonth.days[e.getDate()-1]}return{hasAvailableSlots:!1,isEnabled:!1,timeSlots:[]}}getTimeSlotsForDate(e){var t,a;if(e.getMonth()!=(null===(t=this.currentMonth)||void 0===t?void 0:t.value)||e.getFullYear()!=(null===(a=this.currentMonth)||void 0===a?void 0:a.year))throw new Error("Date is not in the month currently being viewed");return this.currentMonth.days[e.getDate()-1].timeSlots}changeMonth(e,t){var a,n,s;return Object(i.__awaiter)(this,void 0,void 0,(function*(){this.hasData=!1;const i={value:e,year:t};if(this.isStale)return this.updateAllData(i);if(i.value==(null===(a=this.prevMonth)||void 0===a?void 0:a.value)&&i.year==this.prevMonth.year){this.nextMonth=this.currentMonth,this.currentMonth=this.prevMonth;try{return this.prevMonth=yield this.fetchData(y(i)),this.hasData=!0,!0}catch(e){return console.error("Error retrieving schedule data from server for month: "+y(i).value),console.error(e),this.hasData=!1,!1}}else{if(i.value!=(null===(n=this.nextMonth)||void 0===n?void 0:n.value)||i.year!=this.nextMonth.year)return i.value==(null===(s=this.currentMonth)||void 0===s?void 0:s.value)&&i.year==this.currentMonth.year||this.updateAllData(i);this.prevMonth=this.currentMonth,this.currentMonth=this.nextMonth;try{return this.nextMonth=yield this.fetchData(f(i)),this.hasData=!0,!0}catch(e){return console.error("Error retrieving schedule data from server for month: "+f(i).value),console.error(e),this.hasData=!1,!1}}}))}updateAllData(e){return Object(i.__awaiter)(this,void 0,void 0,(function*(){const t=Promise.all([this.fetchData(y(e)),this.fetchData(e),this.fetchData(f(e))]);let a;try{return a=yield t,this.prevMonth=a[0],this.currentMonth=a[1],this.nextMonth=a[2],this.hasData=!0,this.isStale=!1,this.lastUpdate=Date.now(),!0}catch(t){return console.error("Error retrieving schedule data from server for month: "+e.value+" (including surrounding months)"),console.error(t),this.hasData=!1,!1}}))}fetchData(e){this.updateCounter++;const t=function(e){let t={year:e.year,value:e.value,days:[]};const a=f(e),i=new Date(a.year,a.value,0).getDate();for(let a=1;a<=i;a++)t.days.push(b(e.year,e.value,a));return t}(e);return this.updateCounter--,Promise.resolve(t)}}function f(e){return e.value<11?{value:e.value+1,year:e.year}:{value:0,year:e.year+1}}function y(e){return e.value>0?{value:e.value-1,year:e.year}:{value:11,year:e.year-1}}function b(e,t,a){const i=new Date(e,t,a),n=i.getDay();if(6==n){let e=[],t=!1;for(let a=0;a<8;a++){const n=C(i,9+a);n.isAvailable&&(t=!0),e.push(n)}return{isEnabled:!0,timeSlots:e,hasAvailableSlots:t}}if(0==n){let e=[],t=!1;for(let a=0;a<2;a++){const n=C(i,8+a);n.isAvailable&&(t=!0),e.push(n)}return{isEnabled:!0,timeSlots:e,hasAvailableSlots:t}}return{isEnabled:!1,timeSlots:[],hasAvailableSlots:!1}}function C(e,t,a){const i=null!=a?a:Math.random()<.8;let n=new Date(e),s=new Date(e);n.setHours(t,0,0,0),s.setHours(t+1,0,0,0);const l=new Intl.DateTimeFormat("en-US",{hour12:!0,timeStyle:"short"}),r=l.formatToParts(n),o=l.formatToParts(s),h=r.find(e=>"dayPeriod"==e.type),c=r.find(e=>"hour"==e.type),d=o.find(e=>"dayPeriod"==e.type),u=o.find(e=>"hour"==e.type);return{date:e,startTime:n,endTime:s,isAvailable:i,displayString:`${null==c?void 0:c.value} ${null==h?void 0:h.value} - ${null==u?void 0:u.value} ${null==d?void 0:d.value}`}}var M=a(12),E=a.n(M),w=a(1569);class T extends l.Component{constructor(e){super(e)}componentDidMount(){return Object(i.__awaiter)(this,void 0,void 0,(function*(){return Promise.resolve()}))}render(){const{selectedDate:e,selectedTime:t,shippingOption:a,hasData:i,onSelectTimeSlot:n,getTimeSlotsForDate:s}=this.props;let l;if(i)if(e){l=s(e).map(e=>{const a=E.a.isEqual(e,t);return r.a.createElement(w.ListGroupItem,{as:"a",key:e.startTime.valueOf(),disabled:!e.isAvailable,action:!0,active:a,onClick:()=>{this.handleTimeSlotClick(e,n)},title:e.isAvailable?"":"Unavailable"},e.displayString)})}else l=[r.a.createElement(w.ListGroupItem,{key:"blankTimeSlot",disabled:!0},"No date selected")];else l=[r.a.createElement(w.ListGroupItem,{key:"loadingTimeSlot",disabled:!0},"Loading...")];return r.a.createElement("div",{className:"TimeSlots"},r.a.createElement(w.ListGroup,null,l))}handleTimeSlotClick(e,t){e.isAvailable&&t(e)}}var k=T;class O extends l.Component{constructor(e){super(e),this.getDateClass=(e,t)=>{if("month"==t.view&&e){const e=this.schedule.getInfoForDate(t.date);return e.isEnabled?e.hasAvailableSlots?null:"Day__Unavailable":"Day__Disabled"}return null},this.isDateDisabled=e=>!this.schedule.getInfoForDate(e.date).isEnabled,this.handleViewChange=e=>Object(i.__awaiter)(this,void 0,void 0,(function*(){const t=e.activeStartDate.getMonth(),a=e.activeStartDate.getFullYear();yield this.schedule.changeMonth(t,a)})),this.handleDateClicked=(e,t)=>{this.setState({selectedDate:e,selectedDateNum:e.valueOf()})},this.handleScheduleSubmit=e=>Object(i.__awaiter)(this,void 0,void 0,(function*(){const{navigateNextStep:t=M.noop,onUnhandledError:a=M.noop}=this.props,i=e.selectedDateNum,n=e.selectedTime;console.log("Selected Date: "+i),console.log("Selected Time: "+n);try{-1!=i&&""!=n?(console.log("selected date exists"),t(!0)):(console.log("No date selected"),t(!1))}catch(e){console.error(e),a(e)}})),this.schedule=new S,this.props.timeSlot&&(this.state={isInitializing:!0,loadedData:!1,selectedDate:this.props.timeSlot.date,selectedDateNum:this.props.timeSlot.date.valueOf()})}componentDidMount(){var e;return Object(i.__awaiter)(this,void 0,void 0,(function*(){const t=(null===(e=this.state)||void 0===e?void 0:e.selectedDate)?this.state.selectedDate:new Date;return(yield this.schedule.changeMonth(t.getMonth(),t.getFullYear()))?void this.setState({isInitializing:!1,loadedData:!0}):void this.setState({isInitializing:!1,loadedData:!1})}))}render(){var e;const{shippingOption:t,onTimeSlotSelected:a,timeSlot:i}=this.props,{selectedDate:n,selectedDateNum:l,loadedData:o}=null!==(e=this.state)&&void 0!==e?e:{},h=this.schedule.getTimeSlotsForDate;return r.a.createElement("div",{className:"Calendar"},r.a.createElement(w.Container,{fluid:"md"},r.a.createElement(w.Row,null,r.a.createElement(w.Col,{xs:7},r.a.createElement("div",{className:"Calendar__container"},r.a.createElement("span",{className:"Calendar__container__content"},r.a.createElement(s.a,{calendarType:"US",minDate:new Date,minDetail:"month",showNeighboringMonth:!1,onActiveStartDateChange:this.handleViewChange,onClickDay:this.handleDateClicked,tileDisabled:this.isDateDisabled,tileClassName:e=>this.getDateClass(o,e)})))),r.a.createElement(w.Col,null,r.a.createElement(k,{getTimeSlotsForDate:h.bind(this.schedule),onSelectTimeSlot:a,shippingOption:t,selectedDate:n,selectedTime:i,hasData:o})))),r.a.createElement(g,{selectedDateNum:l,selectedTime:i,onSubmitSchedule:this.handleScheduleSubmit}))}}function N({checkoutService:e,checkoutState:t}){const{data:{getCart:a,getCheckout:i,getConfig:n,getCustomer:s,getOrder:l,getShippingAddress:r,getSelectedShippingOption:o},statuses:{isShippingStepPending:h,isSelectingShippingOption:c,isUpdatingConsignment:d,isCreatingConsignments:u,isCreatingCustomerAddress:m,isUpdatingCheckout:v}}=t,p=i(),D=n(),g=s(),{isComplete:S=!1}=l()||{},f=a();if(!p||!D||!g||!f||S)return null;const y=h()||c()||d()||u()||v()||m()||void 0===r()||void 0===o();return{cart:f,shippingAddress:r(),shippingOption:o(),isLoading:y,isGuest:g.isGuest,isInitializing:!1,initializeScheduling:(e,t)=>Promise.resolve({address:e,shipOption:t}),updateCheckout:e.updateCheckout}}t.default=Object(o.a)(N)(O)}}]);
//# sourceMappingURL=schedule-f4d862c3.js.map
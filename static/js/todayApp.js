var todayApp = {
	init: function() {
		$('.previousDay').on('click', function(e) {
			e.preventDefault();
			yesterday =  moment( todayApp.day ).subtract(1, "days").format("YYYYMMDD");

			todayApp.loadDate( yesterday );
		});
		$('.today').on('click', function(e) {
			e.preventDefault();
			today =  moment( $.now() ).format("YYYYMMDD");

			todayApp.loadDate( today );
		})
		this.loadDate( this.day );
	},
	day: moment( $.now() ).format( "YYYYMMDD" ),
	data: {
		items: [],
		// log: [],
	},
	template: $( '#TodayItem--template' ).html(),

	loadDate: function( date ) {
		this.day = date;
		var dateID = "today" + date;
		todayApp.data = { items: [] };
		var tempData = JSON.parse(
				localStorage.getItem( dateID ),
				this.fixBooleanAsString
			 );

		$('h1').html( moment(this.day).format('dddd, MMMM Do, YYYY') );
		$("#todos").html("");

		if(!tempData || !tempData.items || !tempData.items.length) {
			// debugger;
			new TodayItem( 0 ); // add it at the end
		} else {
			// debugger;
			for( item in tempData.items ) {
				// debugger;
				new TodayItem( $( '#todos .todo_item' ).length, tempData.items[item] );
			}
		}
	},
	saveDate: function() {
		localStorage.setItem( "today" + this.day, JSON.stringify( this.data ) );
	},
	// logChange: function( id, action, newValue ) {

	// },
	// replayChanges: function( start, end ) {

	// },
	// undoChanges: function( start, end ) {

	// },
	fixBooleanAsString: function( k,v ) {
		if( v=="true" ) return true;
		if( v=="false" ) return false;
		return v;
	},
	setCaretPosition: function(el, atStart) {
		el = el[0]

		if( !el ) {
			return;
		}

        el.focus();
        if (typeof window.getSelection != "undefined"
                && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(atStart);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(atStart);
            textRange.select();
        }
    }
}





var TodayItem = function( position, item ) {
	var save = true;
	if( !item ) {
		save = false;
		item = {
			id: $.now(),
			text: "",
			status: false
		}
	}

	this.id = item.id;
	this.text = item.text;
	this.status= item.status;
	var that = this;

	this.$item = $( todayApp.template )
		.addClass( this.status ? 'true' : '' )
		.data( 'id', this.id )
		.find( '.input' )
			.html( this.text )
			.on( 'keydown', function(e){
				switch( e.which ) {
					case 8: // backspace
						if( !$(this).html().length ) {
							e.preventDefault();
							that.remove();
						}
						break;

					case 13: // enter
						e.preventDefault();
						new TodayItem( that.$item.index() + 1 );
						break;
				}
			} )
			.on( 'keyup', function(e){
				that.updateText( $(this).html() );
			} )
			.on('paste', function(e){
				var $this = this;
				// it looks like the event is fired just before the content goes in
				// so a small delay makes sure we catch the new code in setTimeout
				setTimeout(function(){
					$("*", $this).removeAttr('style');
				}, 10)
			})
		.end()
		.find( '.todo_item__check' )
			.on( 'click', function( e ){
				that.toggleStatus( e );
			} )
		.end();


	if( position ) {
		$afterElement = $( '.todo_item:eq(' + (position-1) + ')', '#todos' );
		this.$item.insertAfter( $afterElement );
	} else {
		this.$item.appendTo( '#todos' );
	}

	todayApp.setCaretPosition( $('.input', this.$item), false ); // at the end

	if(todayApp.data.items[ position ]) {
		todayApp.data.items.splice(position, 0, item);
	} else {
		todayApp.data.items.push(item);
	}
	if(save) {
		todayApp.saveDate();
	}
}

TodayItem.prototype.updateText = function( text ) {
	var index = this.$item.index();

	if( !todayApp.data.items[index] ) {
		return false;
	}
	todayApp.data.items[index].text = text;
	todayApp.saveDate();
}
TodayItem.prototype.toggleStatus = function() {
	var index = this.$item.index();
	this.status = !this.status;
	this.$item.toggleClass( 'true' );

	todayApp.data.items[index].status = this.status;

	todayApp.saveDate();

}
TodayItem.prototype.remove = function() {
	var index = this.$item.index();

	todayApp.data.items.splice( index, 1 );
	todayApp.saveDate();


	if( index ) { // if this is not the first item
		todayApp.setCaretPosition( $('.input', this.$item.prev()), false );
	} else {
		todayApp.setCaretPosition( $('.input', this.$item.next()), false );
	}

	this.$item.remove();
}
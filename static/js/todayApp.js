var todayApp = {
	/*
		_______      _________________
		`MM'`MM\     `M'`MM'MMMMMMMMMM
		 MM  MMM\     M  MM /   MM   \
		 MM  M\MM\    M  MM     MM
		 MM  M \MM\   M  MM     MM
		 MM  M  \MM\  M  MM     MM
		 MM  M   \MM\ M  MM     MM
		 MM  M    \MM\M  MM     MM
		 MM  M     \MMM  MM     MM
		 MM  M      \MM  MM     MM
		_MM__M_      \M _MM_   _MM_
	*/

	init: function(){

		todayData.get();

		todayApp.display();



		$('body')
			.on('click','.todo_item__check',function(e){
				e.preventDefault();
				todayApp.toggleStatus( $(this).data('id') );
			})
			.on('click','.todo_item__remove',function(e){
				e.preventDefault();
				todayApp.removeItem( $(this).data('id') );
			})
			.on('keydown', '.input', function(e){
				if(e.which == 13 && $(this).hasClass('add_new_item')) { // enter key
					e.preventDefault();
					todayApp.addItem( $(this).html() );
					$(this).html("");
				} else {
					todayApp.updateItem( $(this).data('id'), $.trim( $(this).html() ) );
				}
			})
			.on('paste', '.input', function(e){
				var $this = this;
				// it looks like the event is fired just before the content goes in
				// so a small delay makes sure we catch the new code in setTimeout
				setTimeout(function(){
					$("*", $this).removeAttr('style');
				}, 10)
			})

		$('.previousDay').click(function(e){
			e.preventDefault();
			todayApp.shiftDate( -1 );
		});
		$('.today').click(function(e){
			e.preventDefault();
			todayApp.shiftDate( 0 );
		})
	},

	/*
		___       ___       _      _______      ___
		`MMb     dMM'      dM.     `MM'`MM\     `M'
		 MMM.   ,PMM      ,MMb      MM  MMM\     M
		 M`Mb   d'MM      d'YM.     MM  M\MM\    M
		 M YM. ,P MM     ,P `Mb     MM  M \MM\   M
		 M `Mb d' MM     d'  YM.    MM  M  \MM\  M
		 M  YM.P  MM    ,P   `Mb    MM  M   \MM\ M
		 M  `Mb'  MM    d'    YM.   MM  M    \MM\M
		 M   YP   MM   ,MMMMMMMMb   MM  M     \MMM
		 M   `'   MM   d'      YM.  MM  M      \MM
		_M_      _MM__dM_     _dMM__MM__M_      \M
	*/

	addItem: function( text ) {
		text = $.trim(String(text));
		id = $.now(),
		status = false;

		if(text !== "") {
			todayData.items[id] = {
				'text': text,
				'status': status
			};

			todayData.save();
			todayApp.display();
		}
	},
	display: function() {
		$('h1').html( moment(todayData.today).format('dddd, MMMM Do, YYYY') );

		var $todos = $('#todos');
		var items = todayData.items;
		var newMarkup = "";

		for(item in items) {
			id = item;
			text = items[item].text;
			status = items[item].status;

			newMarkup+= "<li class='todo_item " + status + "' id='" + id + "'><a href='' class='todo_item__icon todo_item__check' data-id='" + id + "'>&#10003;</a><div class='input' contenteditable data-id='" + id + "'>" + text + "</div><a href='' class='todo_item__icon todo_item__remove' data-id='" + id + "'>x</a></li>";
		}

		$todos.html(newMarkup);
	},
	removeItem: function( id ) {
		delete todayData.items[id];
		todayData.save();
		todayApp.display();
	},
	shiftDate: function( position ) {
		todayData.shiftDate( position );
		todayData.get();
		todayApp.display();
	},
	toggleStatus: function( id ) {
		todayData.items[id].status = !todayData.items[id].status;
		todayData.save();
		todayApp.display();
	},
	updateItem: function( id, text ) {
		todayData.items[id].text = text;
		todayData.save();
	},

	/*
		__________    ____       ____    ____       ____
		MMMMMMMMMM   6MMMMb     6MMMMb   `MM'      6MMMMb\
		/   MM   \  8P    Y8   8P    Y8   MM      6M'    `
		    MM     6M      Mb 6M      Mb  MM      MM
		    MM     MM      MM MM      MM  MM      YM.
		    MM     MM      MM MM      MM  MM       YMMMMb
		    MM     MM      MM MM      MM  MM           `Mb
		    MM     MM      MM MM      MM  MM            MM
		    MM     YM      M9 YM      M9  MM            MM
		    MM      8b    d8   8b    d8   MM    / L    ,M9
		   _MM_      YMMMM9     YMMMM9   _MMMMMMM MYMMMM9
	*/
}
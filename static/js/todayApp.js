/*
the motivations to build this app came out of my frustration with using todo apps. I always add a lot of items in the lists, more then i can handle. so every day when i check them i ALWAYS have unfinished stuff. and it just grows bigger and bigger to the point where i start feeling anxious.

to solve this i set up today, a todo list that resets every day. forget the baggage of yesterday! i'm going to work on whatever is important today. i might not finish everything by the end, but if i don't remember tomorrow about it, it means it wasn't important to begin with. every day is a fresh start!
*/
var today = {
	id: 0,
	display: function( todos ) {

		$('h1').html(
			moment(today.id).format('dddd, MMMM Do, YYYY')
		);

		$("#todos")
			.html( todos )
			.off( 'input' )
			.on( 'input', function(e){
				if( !$("div", this).length ) {
					var html = $.trim( $(this).html() );
					$(this).html("<div>" + html + "</div>");
				}
				$("*", this).removeAttr('style');
				today.save();
			})
			.off('click', 'div')
			.on('click', 'div', function(e){
				if(e.offsetX < 0) {
					$(e.target).toggleClass('active');
					today.save();
				}
			});
	},
	load: function( date ) {
		if(date) {
			this.id = moment( date ).format( "YYYYMMDD" );
		} else {
			this.id = moment( $.now() ).format( "YYYYMMDD" );
		}

		$.post(
			"./loadData.php",
			{
				dateID: this.id
			},
			function( todos ) {
				serverTodos = $('<div/>').html(todos).text(); // decode the html
				serverTodos = serverTodos != "" ? serverTodos : "<div></div>";

				today.display( serverTodos );
			}
		);
	},
	save: function() {
		var todos = $.trim($('#todos').html());

		$.post(
			"./saveData.php",
			{
				dateID : today.id,
				todos: todos
			}
		);
	}
}



$(document).ready(function(){

	today.load();

	$('#yesterday').on('click', function(e){
		e.preventDefault();
		yesterday = moment( today.id ).subtract(1, "days").format("YYYYMMDD");
		today.load( yesterday )
	});
	$('#today').on('click', function(e){
		e.preventDefault();
		today.load( moment( $.now() ).format( "YYYYMMDD" ) )
	});
	$('#tomorrow').on('click', function(e){
		e.preventDefault();
		tomorrow = moment( today.id ).add(1, "days").format("YYYYMMDD");
		today.load( tomorrow )
	});

});
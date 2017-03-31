/*
the motivations to build this app came out of my frustration with using todo apps. I always add a lot of items in the lists, more then i can handle. so every day when i check them i ALWAYS have unfinished stuff. and it just grows bigger and bigger to the point where i start feeling anxious.

to solve this i set up today, a todo list that resets every day. forget the baggage of yesterday! i'm going to work on whatever is important today. i might not finish everything by the end, but if i don't remember tomorrow about it, it means it wasn't important to begin with. every day is a fresh start!
*/
$todos = $("#todos");
CLASS_INTHEPAST = "in-the-past";
var today = {
	id: 0,
	display: function( todos ) {

		/*
		when you look in the past you want to focus more on what you have
		accomplished, not on what is still left to do. think reporting, feeling good etc.
		*/
		var now = moment( $.now() ).format( "YYYYMMDD" );
		dateHasPassed = moment(today.id).isBefore(now);
		if( dateHasPassed ) {
			$todos.addClass(CLASS_INTHEPAST)
		} else {
			$todos.removeClass(CLASS_INTHEPAST)
		}

		if(today.id == now) { //today
			$('h1').html(
				"<strong>Today</strong>, " +
				moment(today.id).format('dddd MMMM Do')
			);
		} else {
			$('h1').html(
				"<strong>" + moment(today.id).format('dddd') + "</strong> " +
				moment(today.id).format('MMMM Do YYYY')
			);
		}


		$todos
			.html( todos )
			.off( 'input' )
			.on( 'input', function(e){
				// make sure there's always a div in there aka a todo item
				if( !$("div", this).length ) {
					var html = $.trim( $(this).html() );
					$(this).html("<div>" + html + "</div>");
				}
				// remove inline styles, they are not needed
				$("*", this).removeAttr('style');

				// save the info on the server
				today.save();
			})
			.off('click', 'div')
			.on('click', 'div', function(e){
				if(e.offsetX < 0) {
					$(this).parent().blur();
					window.getSelection().removeAllRanges();

					$item = $(e.target);

					$item.toggleClass('active');

					// everytime you tick an item it should go to the top of the done pile
					// and when you untick it, it goes at the bottom of the to do pile
					$item.remove();
					if($('.active:first').length) {
						$('.active:first').before(e.target);
					} else {
						$item.appendTo('#todos');
					}
					today.save();
				}
			})
			.on('paste', function(e){
				// just after the user pasted, move all the nested divs up and
				// convert them to todo items
				setTimeout(
					function(){
						freeNestedDivs( $("#todos > div > div").first() );
					}, 10
				);
			});

			var freeNestedDivs = function(nestedDiv) {
				console.log( $(nestedDiv), $(nestedDiv).length );
				if( $(nestedDiv).length ) {
					var parent = $(nestedDiv).parent();
					$( parent ).replaceWith( $(parent).html() );
					// freeNestedDivs( $("#todos > div > div").first() );
				} else {
					console.log('nu');
				}
			}
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
		var todos = $.trim($todos.html());

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
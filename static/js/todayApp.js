/*
the motivations to build this app came out of my frustration with using todo apps. I always add a lot of items in the lists, more then i can handle. so every day when i check them i ALWAYS have unfinished stuff. and it just grows bigger and bigger to the point where i start feeling anxious.

to solve this i set up today, a todo list that resets every day. forget the baggage of yesterday! i'm going to work on whatever is important today. i might not finish everything by the end, but if i don't remember tomorrow about it, it means it wasn't important to begin with. every day is a fresh start!
*/
var $todos = $('#todos')
CLASS_INTHEPAST = 'in-the-past'
var today = {
  id: 0,
  token: null,
  init: function (dateid) {
    today.token = localStorage.getItem('id_token')

    today.load(dateid)

    $('#yesterday').on('click', function (e) {
      e.preventDefault()
      yesterday = moment(today.id).subtract(1, 'days').format('YYYYMMDD')
      today.load(yesterday)
    })
    $('#today').on('click', function (e) {
      e.preventDefault()
      today.load(moment($.now()).format('YYYYMMDD'))
    })
    $('#tomorrow').on('click', function (e) {
      e.preventDefault()
      tomorrow = moment(today.id).add(1, 'days').format('YYYYMMDD')
      today.load(tomorrow)
    })
  },
  display: function (todos) {
    /*
    when you look in the past you want to focus more on what you have
    accomplished, not on what is still left to do. think reporting, feeling good etc.
    */
    var now = moment($.now()).format('YYYYMMDD')
    dateHasPassed = moment(today.id).isBefore(now)
    if (dateHasPassed) {
      $todos.addClass(CLASS_INTHEPAST)
    } else {
      $todos.removeClass(CLASS_INTHEPAST)
    }

    if (today.id == now) { // today
      $('h1').html(
        '<strong>Today</strong>, ' +
        moment(today.id).format('dddd MMMM Do')
      )
    } else {
      $('h1').html(
        '<strong>' + moment(today.id).format('dddd') + '</strong>, ' +
        moment(today.id).format('MMMM Do YYYY')
      )
    }

    // console.log('yo', todos)
    $todos
      .html(todos)
      .off('input')
      .on('input', function (e) {
        // make sure there's always a div in there aka a todo item
        if (!$('div', this).length) {
          var html = $.trim($(this).html())
          $(this).html('<div>' + html + '</div>')
        }
        // remove inline styles, they are not needed
        $('*', this).removeAttr('style')

        // wrap accidental text nodes in a div
        $(this)
          .contents()
          .filter(function () {
            return this.nodeType === 3 // Node.TEXT_NODE
          }).wrap('<div/>')

        // save the info on the server
        today.save()
      })
      .on('keyup', function (e) {
        if (
          (e.keyCode > 36 && e.keyCode < 41) || // arrow keys
          e.keyCode == 13
        ) {
          findFocusedNode()
        }
      })
      .off('click', 'div')
      .on('click', 'div', function (e) {
        findFocusedNode()

        if (e.offsetX < 0) {
          $(this).parent().blur()
          window.getSelection().removeAllRanges()

          $item = $(e.target)

          $item.toggleClass('active')
          $item.removeClass('focused')

          // everytime you tick an item it should go to the top of the done pile
          // and when you untick it, it goes at the bottom of the to do pile
          $item.remove()
          if ($('.active:first').length) {
            $('.active:first').before(e.target)
          } else {
            $item.appendTo('#todos')
          }
          today.save()
        }
      })
      .on('paste', function (e) {
        // just after the user pasted, move all the nested divs up and
        // convert them to todo items
        setTimeout(
          function () {
            freeNestedDivs($('#todos > div > div').first())
            findFocusedNode()
          }, 10
        )
      })

    var freeNestedDivs = function (nestedDiv) {
      if ($(nestedDiv).length) {
        var parent = $(nestedDiv).parent()
        $(parent).replaceWith($(parent).html())
      }
    }

    var findFocusedNode = function () {
      var node = document.getSelection().anchorNode
      var focusedNode = (node.nodeType == 3 ? $(node).closest('div')[0] : node)
      $('.focused').removeClass('focused')
      $(focusedNode).addClass('focused')
    }
  },
  load: function (date) {
    if (date) {
      this.id = date
    } else {
      this.id = moment($.now()).format('YYYYMMDD')
    }

    var now = moment($.now()).format('YYYYMMDD')
    if (this.id === now) {
      window.history.replaceState('myState', 'Title', '/app.html')
    } else {
      window.history.replaceState('myState', 'Title', '/app.html?date=' + this.id)
    }

    $.ajax({
      url: 'https://api.zoreet.com/days/' + this.id,
      type: 'GET',
      headers: { 'Authorization': 'Bearer ' + today.token },
      dataType: 'json',
      success: function (response) {
        let serverTasks = response.day.tasks // decode the html
        serverTasks = serverTasks || '<div></div>'

        // return false
        today.display(serverTasks)
      },
      error: function (response) {
        console.log(response.status)
      }
    })
  },
  save: function () {
    var todos = $.trim($todos.html()).replace('focused', '')

    $.ajax({
      url: 'https://api.zoreet.com/days/' + this.id,
      type: 'POST',
      data: {
        tasks: todos
      },
      headers: { 'Authorization': 'Bearer ' + today.token },
      dataType: 'json'// ,
      // success: function (data) {
      //   console.info('saved', data);
      // }
    })
  }
}

$(function(){
	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;
		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	}
  function getRandomInt(max){
    return Math.floor(Math.random() * Math.floor(max));
  }
  function new_text_display(word_to_learn, meaning, learning, speaks){
    var pronunciation = window.meanings[meaning][speaks+'-'+learning];
    if (pronunciation == undefined){
      pronunciation = '';
    }
    return "<span class='native'>"+word_to_learn+"</span><span class='preference " + speaks + "'>" + pronunciation + "</span>"
  }
  function new_player_score($player){
    var score = Math.round($player.data('time-spent'));
    var name = $player.find("input.name").val();
    return "<div class='score'>" + name + ": " + String(score) + " seconds</div>";
  }
  function end_game(){
    $end_game_message = $("<div class='end-game'><div>Game Complete</div></div>");
    if ($("#timetracking").get(0).checked){
      $('.player').each(function(index, player){
        var $player = $(player);
        $end_game_message.append($(new_player_score($player)));
      });
    }
    $(".center")
      .html("")
      .append($end_game_message);
  }
  function start_game(){
    window.game_started = true;
    window.state = {
      "whose-turn": 0,
      "time-at-last-turn": Date.now()
    }
    $(".game-setup").parent().hide();
    $(".player").each(function(index, player){
      var $player = $(player);
      $player.data('time-spent', 0.0);
      var rounds = $("#rounds").val();
      var meaning_list = [];
      var grouping_selector = Object.keys(meaning_groups).map(function(el){return "[data-grouping='"+el+"']"}).join();
      for(var i=0; i<rounds; i++){
        $.each($(grouping_selector), function(index, el){
          $el = $(el);
          if (!el.checked){
            return true;
          }
          grouping = $el.data('grouping');
          meaning_list = meaning_list.concat(shuffle(meaning_groups[grouping].slice(0)));
        });
      }
      $player.data('meaining-list', meaning_list);
    });
    new_card();
  }
  function new_card(){
    var $player = $("#players").find(".player").eq(window.state["whose-turn"]);
    var $whose_turn = $("#whose-turn");
    var $display = $("#display");
    var learning = $player.find(".learning").val();
    var speaks = $player.find(".speaks").val();
    var meanings = Object.keys(window.meanings);
    var next_meaning = $player.data('meaining-list').pop();
    var $player_view = $(".player-view");
    $player_view
      .data('with-pronunciation', $player.find(".pronunciation").get(0).checked)
      .attr('data-with-pronunciation', $player.find(".pronunciation").get(0).checked)
    if (next_meaning == null){
      return false;
    }
    var word_to_learn = window.meanings[next_meaning][learning];
    $whose_turn.html($player.find(".name").val());
    $display.html(new_text_display(word_to_learn, next_meaning, learning, speaks));
    window.state = $.extend(window.state, {
      "meaning": next_meaning,
      "language": learning
    });
    return true;
  }
  function track_time($player){
    var time_spent = (Date.now() - window.state['time-at-last-turn'])/1000;
    var previous_time_spent = $player.data('time-spent');
    $player.data('time-spent', time_spent + previous_time_spent);
    window.state['time-at-last-turn'] = Date.now();
  }
  function player_chose(correctness){
    var $player = $("#players").find(".player").eq(window.state["whose-turn"]);
    if(correctness.type == "click"){
      correctness = correctness.data;
    }
    switch(correctness){
      case "correct":
        track_time($player);
        window.state["whose-turn"] += 1;
        if (window.state["whose-turn"] >= $(".player").length){
          window.state["whose-turn"] = 0;
        }
        $(".player-view").addClass("correct");
        if (!new_card()){
          end_game();
        }
        break;
      case "incorrect":
        $(".player-view").addClass("incorrect");
        break;
    };
    setTimeout(function(){
      $(".player-view").removeClass("correct incorrect");
    }, 400);
  }
  function guess_card(card_data){
    if (card_data == undefined){
      return;
    }
    var actual_meaning = window.state["meaning"];
    var language = window.state["language"];
    var actual_meaning_data = language[actual_meaning];
    var guessed_meaning_data = language[card_data];
    if (card_data["meaning"] == actual_meaning){
      player_chose("correct");
    } else {
      player_chose("incorrect");
    }
  }
  window.card_number = "";

  $("body").on("keydown", function(ev){
    if (!window.game_started){
      return true;
    }
    if (ev.key == "Enter"){
      var card_data = window.card_mappings[window.card_number];
      console.log(window.card_number);
      guess_card(card_data);
      window.card_number = "";
    } else {
      window.card_number += ev.key;
    }
  });
  function new_player(){
    return $("#player-template").html()
  }
  function new_language_option(language){
    return "<option value='" + language + "'>" + language + "</option>"
  }
  function supported_languages(){
    var retval = [];
    $(Object.keys(window.meanings)).each(function(index, el){
      $(Object.keys(window.meanings[el]).filter(function(el){return el.indexOf('-')==-1})).each(function(_index, _el){
        if (retval.indexOf(_el) == -1){
          retval.push(_el);
        }
      });
    });
    return retval;
  }
  function add_player(){
    var names = [
      "Foo",
      "Bar",
      "Fiz",
      "Bin"
    ];
    $blank_language_option = $(new_language_option(""));
    $new_player = $(new_player());
    $new_player.find(".speaks").append($blank_language_option.clone());
    $new_player.find(".learning").append($blank_language_option.clone());
    $(supported_languages()).each(function(index, el){
      $new_option = $(new_language_option(el));
      $new_player.find(".speaks").append($new_option.clone());
      $new_player.find(".learning").append($new_option.clone());
    });
    random_name = names[getRandomInt(names.length)];
    $new_player.find(".name").val(random_name);
    $("#players").append($new_player);
  }
  function debug_setup(){
    add_player();
    $("#rounds").val(1);
    $(".speaks").eq(0).val("english");
    $(".speaks").eq(1).val("arabic");
    $(".learning").eq(0).val("arabic");
    $(".learning").eq(1).val("english");
    start_game();
  }
  add_player();
  //debug_setup();
  $("#add-player").click(add_player);
  $("#start-game").click(start_game);
  $("#debug-correct").click("correct", player_chose);
  $("#debug-incorrect").click("incorrect", player_chose);
});

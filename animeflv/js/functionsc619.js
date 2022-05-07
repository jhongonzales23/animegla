$(document).ready(function() {
  var search_opts = {callback:function(value) {
    searchy(value);
  }, wait:500, highlight:true, allowSubmit:false, captureLength:2};
  $("#search-anime").typeWatch(search_opts);
  $("#search-anime").on("input", function() {
    var searchTerm = $(this).val();
    if (searchTerm.length > 1) {
      $(".Search").addClass("On");
      $(".ListResult").html('<li class="Loading"><img src="/animeflv/img/preloader_white.gif" alt="Loading" /> Buscando...</li>');
    } else {
      $(".Search").removeClass("On");
    }
  });
  function searchy(value) {
    if (value.length < 2) {
      return;
    }
    $.get("/api/search", {q:value}, function(data) {
      $(".Search").addClass("On");
      $(".ListResult").empty();
      var data_len = data.length;
      if (data.status != "error") {
        for (var i = 0; i < data_len; i++) {
          console.log(data[i]);
          if (i >= 5) {
            $(".ListResult").append('<li class="MasResultados"><a href="/animes?q=' + encodeURI(value) + '">Más Resultados</a></li>');
            return false;
          }
          var ttext = "ANIME";
          if (data[i].category.name == "Pelicula") {
            ttext = "PELICULA";
          } else {
            if (data[i].category.name == "Ova") {
              ttext = "OVA";
            }
          }
          $(".ListResult").append('<li><figure><a href="/anime/' + data[i].id + "/" + data[i].url + '"><img src="/storage/' + data[i].cover + '" alt=""></a></figure> <a href="/anime/' + data[i].id + "/" + data[i].url + '"><span class="title">' + data[i].title + '</span></a> <span class="Type" style="background-color: '+ data[i].category.color +';">' + ttext + "</span> </li>");
        }
      } else {
        $(".ListResult").append('<li class="Loading">No se encontraron resultados</li>');
      }
    }, "json");
  }
  $(".Search").click(function(e) {
    e.stopPropagation();
  });
  $(document).click(function() {
    $(".Search").removeClass("On");
  });

  $("#follow_anime").click(function() {
    library_action("follow", 0);
  });
  $("#unfollow_anime").click(function() {
    library_action("follow", 1);
  });
  $("#add_favorite").click(function() {
    library_action("favorite", 0);
  });
  $("#remove_favorite").click(function() {
    library_action("favorite", 1);
  });
  $("#add_pending").click(function() {
    library_action("pending", 0);
  });
  $("#remove_pending").click(function() {
    library_action("pending", 1);
  });
  function library_action(action, to_do) {
    if (!is_user) {
      alertify.error("Necesitas ser usuario registrado para poder usar está opción.");
      return;
    }
    $.ajax({url:"/api/library", method:"post", data:{"anime_id":anime_info[0], "action":action, "do":to_do,_token: $('meta[name="csrf-token"]').attr('content')}, success:function(data) {
      if (data.status == "success") {
        if (action == "favorite") {
          if (to_do == 1) {
            $("#add_favorite").show();
            $("#remove_favorite").hide();
            alertify.success("Anime quitado de favoritos.");
          } else {
            $("#add_favorite").hide();
            $("#remove_favorite").show();
            alertify.success("Anime agregado a favoritos.");
          }
        } else {
          if (action == "follow") {
            $("#add_pending").show();
            $("#remove_pending").hide();
            
            if (to_do == 1) {
              $("#follow_anime").show();
              $("#unfollow_anime").hide();
              alertify.success("Anime quitado de lista de seguimiento.");
            } else {
              $("#follow_anime").hide();
              $("#unfollow_anime").show();
              alertify.success("Anime agregado a lista de seguimiento.");
            }
          } else {
            if (action == "pending") {
              $("#follow_anime").show();
              $("#unfollow_anime").hide();
              if (to_do == 1) {
                $("#add_pending").show();
                $("#remove_pending").hide();
                alertify.success("Anime quitado de lista de espera.");
              } else {
                $("#add_pending").hide();
                $("#remove_pending").show();
                alertify.success("Anime agregado a lista de espera.");
              }
            }
          }
        }
      } else {
        alertify.error(data.error);
      }
    }, error:function() {
    }});
  }
  $("[id*='DpdwLnk-Shr']:checkbox").change(function() {
    $("body").toggleClass("DwBd");
  });
  $("#BtnMenu:checkbox").change(function() {
    $("body").toggleClass("NScr");
  });
  $("input[name='list_animes']").click(function() {
    $("input[name='" + $(this).attr("name") + "']:radio").not(this).removeData("chk");
    $(this).data("chk", !$(this).data("chk"));
    $(this).prop("checked", $(this).data("chk"));
  });
  $(window).load(function() {
    $(".ScrlV").mCustomScrollbar({autoExpandScrollbar:true, advanced:{updateOnContentResize:true}, scrollInertia:400});
  });
  $(window).load(function() {
    $(".ScrlH").mCustomScrollbar({axis:"x", autoExpandScrollbar:true, advanced:{autoExpandHorizontalScroll:true}, advanced:{updateOnContentResize:true}, scrollInertia:400});
  });
  $("[id$='circle']").percircle();
  $(".SldrHm").bxSlider({mode:"fade", pager:true, adaptiveHeight:true, controls:false});
  $(".RateIt>a").on("click", function() {
    var rating = $(this).attr("data-value");
    var parent = $(this).closest(".Strs");
    if (!is_user) {
      alertify.error("Necesitas ser usuario registrado para poder usar está opción.");
      return;
    }
    $.ajax({url:"/api/rank", method:"post", data:{"value":rating, "post_id":parent.attr("data-id"),_token: $('meta[name="csrf-token"]').attr('content')}, success:function(data) {
      if (data.status == 'success') {
     var new_stars;
     
        for (i = 5; i >= 1; i--) {
          new_stars += '<span class="fa-star-o';
          if (data.rating_js >= i) {
            new_stars += " On";
          } else {
            if (data.rating_js + 0.6 >= i) {
              new_stars += " Hf";
            }
          }
          new_stars += '  data-value="' + i + '" title="' + i + ' Estrellas"></span>';
        }
        parent.html(new_stars);
        $("#votes_nmbr").text(data.rating_votes);
        $("#votes_prmd").text(data.rating_valor);
         
        alertify.success("Valoraste con "+rating+" estrellas.");
      } else {
         alert(data.error);
      }
    }, error:function() {
    }});
  });

 $('#report_submit').on('click',function(){
  if($("#report_comment").val().length<10){
    alert("Debes ingresar un comentario de al menos 10 caracteres, sin un comentario tu reporte sera ignorado.");return false;}

  $.ajax({url:'/api/report',method:'post',data:{'type':$("#report_reason").val(),'comment':$("#report_comment").val(),'episode_id':episode_id,_token: $('meta[name="csrf-token"]').attr('content')},success:function(data){

  if(data.status == "success"){
    alertify.error("Se ha enviado el reporte con exito.");
    //alert('Se ha enviado el reporte con exito.');
    $('#ReportModal').modal('hide');
    $('#report_body').text('Ya haz enviado un reporte');
  }else{
    alertify.error("Necesitas ser usuario registrado para poder usar está opción.");
    //alert("Ha ocurrido el siguiente error:\n"+data.error);
  }
  },error:function(){}});
});
 

  $(".list_button").on("click", function() {
    var action = $(this).attr("data-action");
    $.ajax({url:"/api/animes/list", method:"post", data:{"action":action, "anime_id":anime_id}, success:function(data) {
      if (data.success) {
        if (action == "add") {
          $("#addToList").hide();
          $("#in_library").show();
        } else {
          $("#addToList").show();
          $("#in_library").hide();
        }
      } else {
        alert(data.error);
      }
    }, error:function() {
    }});
  });
  $(".CVst").on("click", function() {
    var seen = $(this).attr("data-seen");
    markEpisode(seen);
  });
  $("#library_add").on("click", function() {
    $("#library_wdgt").show();
    $(this).hide();
  });
  function markEpiRequest(seen) {
    $.ajax({url:"/api/markEpisode", method:"post", data:{"seen":seen, "anime_id":anime_id, "episode_id":episode_id, "number":episode_number, "latest_seen":latest_seen,_token: $('meta[name="csrf-token"]').attr('content')}, success:function(data) {
      if (data.status == "success") {
        if (seen == 1) {
          seen = 0;
          var sclass = "fa-eye-slash";
        } else {
          seen = 1;
          var sclass = "fa-eye";
        }
        $(".CVst").attr("data-seen", seen).removeClass("fa-eye fa-eye-slash").addClass(sclass);
        
      } else {
        alertify.error(data.error);
      }
    }, error:function() {
      alertify.error("Error(CODIGO:405 Method Not Allowed).");
    }});
  }
  function markEpisode(seen) {
    if (!is_user) {
      alertify.error("Necesitas ser usuario registrado para poder usar está opción.");
      return;
    }
    if (seen == 1 && !in_library) {
      if (episode_number == 1) {
        alertify.confirm("Se agregara a la lista de los animes que estás viendo.", function() {
          markEpiRequest(seen);
        });
      } else {
        alertify.confirm("Se agregara a la lista de los animes que estás viendo, y se marcaran todos los episodios anteriores como vistos.", function() {
          markEpiRequest(seen);
        });
      }
    } else {
      if (seen == 1 && episode_number-1 > latest_seen) {
        alertify.confirm("Se marcaran todos los episodios anteriores como vistos, ¿estás seguro?", function() {
          markEpiRequest(seen);
        });
      } else {
        if (seen == 0 && latest_seen > episode_number) {
          alertify.confirm("Se marcaran todos los episodios siguientes que has marcado visto como no vistos, ¿estás seguro?", function() {
            markEpiRequest(seen);
          });
        } else {
          markEpiRequest(seen);
        }
      }
    }
  }
  $("body").tooltip({selector:"[data-toggle='tooltip']", container:"body"});
  $(".AAShwHdd-lnk").on("click", function() {
    var shwhdd = $(this).attr("data-shwhdd");
    $(this).toggleClass("on");
    $("#" + shwhdd).toggleClass("show");
  });
  $(document).keyup(function(a) {
    if (a.keyCode == 27) {
      $(".lgtbx-on").toggleClass("lgtbx-on");
    }
  });
  $(".lgtbx").click(function(event) {
    event.preventDefault();
    $("body").toggleClass("lgtbx-on");
  });
  $(".lgtbx-lnk").click(function(event) {
    event.preventDefault();
    $("body").toggleClass("lgtbx-on");
  });

var prev_input='';
$("#eSearch").keyup(function(){var input=$('#eSearch').val();if(input===prev_input)
return false;
if(input===''){
  prev_input='';
  $("#episodeList").empty();
  current_page=1;
  renderEpisodes(1);
  }
if($.isNumeric(input)){
  prev_input=input;
  var found_result=0;
$("#episodeList").empty();
for(var i=0;i<episodes.length;i++){
  if(Math.floor(episodes[i][0])==input){found_result=1;appendEpisode(i,false);}
}
if(!found_result)$("#episodeList").append('<li class="Norslts fa-frown-o"> No se encontraron resultados</li>');}});

var current_page=1,per_page=25;

$('#episodeList').scroll(function(){var $this=$(this);var height=this.scrollHeight-$this.height();var scroll=$this.scrollTop();var isScrolledToEnd=(scroll>=height);if(isScrolledToEnd){var limit=Math.ceil(episodes.length/per_page);if(current_page<limit){current_page++;renderEpisodes(current_page);}}});

if( anime_info[3]!==''){
  $("#episodeList").append('<li class="fa-play-circle Next"><a href="#"><figure><img src="/animeflv/img/cnt/proximo.png" alt=""></figure><h3 class="Title">PROXIMO EPISODIO</h3><span class="Date fa-calendar">'+anime_info[3]+'</span></a></li>');
}
renderEpisodes=function(page){console.log(page);var start=(page-1)*per_page;var last_page=Math.ceil(episodes.length/per_page);var limit=start+per_page;if(page===last_page)
limit=episodes.length;



if(episodes==""){

  if(anime_info[4] == "Anime"){
    $("#episodeList").append('<li class="Norslts fa-frown-o"> Aun no se agregaron episodios.</li>');
  }else{
    $("#episodeList").append('<li class="Norslts fa-frown-o"> Aun no se agregaron formatos.</li>');
  }
}


for(var i=start;i<limit;i++){appendEpisode(i);}
$("#episodeList .lazy").lazy({appendScroll:$('#episodeList'),effect:"fadeIn"});};appendEpisode=function(i,lazy){lazy=typeof lazy!=='undefined'?lazy:true;
  if(episodes.length!=0){
$("#episodeList").append('<li class="fa-play-circle '+((episodes[i][0]<=last_seen)? 'Visto' :'')+'">'+
'<a href="/anime/'+anime_info[0]+'/'+anime_info[2]+'/'+episodes[i][1]+'">'+
'<figure><img '+(lazy?' class="lazy" data-src="':' src="')+site_info[1]+'storage/'+episodes[i][2]+'" alt=""></figure>'+
'<h3 class="Title">'+anime_info[1]+'</h3>'+
'<p>'+((anime_info[4]!="Anime")? episodes[i][3] : 'Episodio '+episodes[i][0])+' </p>'+
'<span class="Stts">'+((episodes[i][0]<=last_seen)? 'NO' :'')+' VISTO</span></a></li>');}};
 
$("#sortEpisodes").click(function(){$('#eSearch').val('');$('#episodeList').scrollTop(0);$("#episodeList").empty();episodes.reverse();current_page=1;renderEpisodes(1);});

});


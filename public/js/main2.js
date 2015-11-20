// CUSTOM JS FILE //

var thumbnailSpacing=2;

function init() {
  renderPeeps();

}

function renderPeeps(){
    var today=new Date();


    $('a.sortLink').on('click',function(e){
        e.preventDefault();
        $('a.sortLink').removeClass('selected');
        $(this).addClass('selected');
        var keyword=$(this).attr('data-keyword');
        sortThumbnails(keyword);
    });

    jQuery.ajax({
        url : '/api/get',
        dataType : 'json',
        success : function(response) {
            console.log(response);

            var moment = response.moment;


            for(var i=0;i<moment.length;i++){
                // moment[i].category == 1 2 3 4 5 6 7 8 9 일때 색깔 집어넣기
                //1: activity, 2: language 3: personality, 4: Cognition, 5: Sociality, 6: Body, 7: Other

            //------------------------------------------------------------------------------------
                var colorpick;
                var white='#FFFFFF';
                switch(moment[i].category){

                    case '1':
                        colorpick='#FF2600';
                        break;
                    case '2':
                        colorpick="#FF9300";
                        break;
                    case '3':
                        colorpick='#FFFB00';
                        break;
                    case '4':
                        colorpick="#00F900";
                        break;
                    case '5':
                        colorpick='#00c3FF';
                        break;
                    case '6':
                        colorpick="#3D00DF";
                        break;
                    case '7':
                        colorpick='#942192';
                        break;
                    //default : colorpick = "#FFFFFF";

                }

                console.log("color: "+colorpick);
                console.log("category: "+moment[i].category)

                var date_from_reply=new Date(moment[i].momentdate);
                var date_to_reply=new Date("2013-11-18");

                //var timeinmilisec=today.getTime() - date_to_reply.getTime();
                var timeinmilisec=date_from_reply.getTime() - date_to_reply.getTime();
                var passtime=Math.floor(timeinmilisec / (1000 * 60 * 60 * 24));
                console.log( Math.floor(timeinmilisec / (1000 * 60 * 60 * 24)) );


                $('.gallery .sorting').css('margin-bottom', window.thumbnailSpacing+'px');
                var htmlToAdd='<a class="thumbnail" title="Day '+passtime+' - '+moment[i].memo+'<br><a href=/'+moment[i]._id+'>edit</a> <a href=/api/delete/'+moment[i]._id+'>delete</a>   "href="'+moment[i].imageUrl+'" data-keywords="'+moment[i].category+'"><img  style="padding:0px;" src="'+moment[i].imageUrl+'"/></a>';
                //var htmlToAdd='<a class="thumbnail" title="Day '+passtime+' - '+moment[i].memo+'<a href=/'+moment[i]._id+'>edit</a> "href="'+moment[i].imageUrl+'" data-keywords="'+moment[i].category+'"><img  style="padding:0px;" src="'+moment[i].imageUrl+'"/></a>';
                //var htmlToAdd='<a class="thumbnail" title="Day '+passtime+' - '+moment[i].memo+'" href="'+moment[i].imageUrl+'" data-keywords="'+moment[i].category+'"><img  style="padding:0px;" src="'+moment[i].imageUrl+'"/></a>';

                $('.thumbnail_container a.thumbnail').addClass('showMe').addClass('fancybox').attr('rel','group');

                positionThumbnails();

                setInterval('checkViewport()',750);

                $("#moment-holder").append(htmlToAdd);

            }

        }
    })
}

function checkViewport(){

    var photosWidth=$('.photos').width();
    var thumbnailContainerWidth=$('.thumbnail_container').width();
    var thumbnailWidth=$('.thumbnail_container a.thumbnail:first-child').outerWidth();

    if(photosWidth<thumbnailContainerWidth){
        positionThumbnails();

    }
    if((photosWidth-thumbnailWidth)>thumbnailContainerWidth){
        positionThumbnails();
    }

    //Debug
    //$('.debug-size').html('photosWidth= '+photosWidth+'  thumbnailContainerWidth: '+thumbnailContainerWidth);
}


function sortThumbnails(keyword){
    // keyword --> all 1 2 3 4 5 6 7
    //alert(keyword);

    $('.thumbnail_container a.thumbnail').each(function(){

        var thumbnailKeywords=$(this).attr('data-keywords');

        if(keyword=="all"){
            $(this).addClass('showMe').removeClass('hideMe').attr('rel','group');
        }
        else{

            if(thumbnailKeywords.indexOf(keyword)!=-1){
                $(this).addClass('showMe').removeClass('hideMe').attr('rel','group');
            }
            else {
                $(this).addClass('hideMe').removeClass('showMe').attr('rel','none');

            }

        }
    });
    positionThumbnails();


}



function positionThumbnails(){

    //alert('ready to reposition');

    //debug
    //$('.debug-remainder').html('');

    $('.thumbnail_container a.thumbnail.hideMe').animate({opacity:0},1200,function(){
       $(this).css({'display':'none','top':'0px','left':'0px'});
    });

    var containerWidth=$('.photos').width();
    var thumbnail_R=0;
    var thumbnail_C=0;
    var thumbnailWidth=$('a.thumbnail img:first-child').outerWidth()+window.thumbnailSpacing;
    console.log("width: "+thumbnailWidth);
    var thumbnailHeight=$('a.thumbnail img:first-child').outerHeight()+window.thumbnailSpacing;
    var max_C=Math.floor(containerWidth/thumbnailWidth);


    console.log('out each');


    $('.thumbnail_container a.thumbnail.showMe').each(function(index){

        console.log('INININ each');
        var remainder=(index%max_C)/100;
        console.log(index+' remainder: '+remainder);
        var maxIndex=0;
       // $('.debug-remainder').append(remainder+' - ');

        if(remainder==0){
            if(index!=0){
                thumbnail_R+=thumbnailHeight;

            }
            thumbnail_C=0;

        }
        else{
            thumbnail_C+=thumbnailWidth;
        }
        console.log(thumbnail_R);

        $(this).css('display','block').animate({
            'opacity':1,
            'top':thumbnail_R+'px',
            'left':thumbnail_C+'px'
        },50);

        var newWidth=max_C*thumbnailWidth;
        var newHeight=thumbnail_R+thumbnailHeight;
        $('.thumbnail_container').css({'width':newWidth+'px','height':newHeight+'px'});




    });

    detectFancyboxLinks();

    var sortingWidth=$('.thumbnail_container').width()/thumbnailWidth;
    var newWidth=sortingWidth*thumbnailWidth-window.thumbnailSpacing;
    $('.sorting').css('width',newWidth+'px');
}


function detectFancyboxLinks(){



    console.log('DDTTECTFANCY');

    $('a.fancybox[rel="group"]').fancybox({

        // 1
        //'transitionIn':'elastic',
        //'transitionOut':'elastic',
        //'titlePosition':'over',
        //'speedIn':500,
        //'overlayColor':'#000',
        //'padding':0,
        //'overlayOpacity':.75,
        //
        //
        //helpers:  {
        //    title : {
        //        type : 'inside'
        //    },
        //    overlay : {
        //        showEarly : false
        //    },
        //    thumbs : {
        //        width: 50,
        //        height: 50
        //    }
        //}

        // 2
        //prevEffect	: 'none',
        //nextEffect	: 'none',
        //helpers	: {
        //    title	: {
        //        type: 'outside'
        //    },
        //    thumbs	: {
        //        width	: 50,
        //        height	: 50
        //    }
        //}

        // for static size
        //beforeShow:function(){
        //  this.width=800;this.height=600;
        //},

        // 3
        'transitionIn':'elastic',
        'transitionOut':'elastic',
        //'openEffect'	: 'elastic',
        //'closeEffect'	: 'elastic',
        'overlayColor':'#000',
        'overlayOpacity':.75,
        //'width':500,


        helpers : {
            title : {
                type : 'inside'
            }
        }


    });
}


window.addEventListener('load', init())
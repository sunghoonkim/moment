/*  JavaScript Document - lynda.com  */

var thumbnailSpacing=10;

$(document).ready(function(){

    $('.gallery .sorting').css('margin-bottom', window.thumbnailSpacing+'px');
    $('.thumbnail_container a.thumbnail').addClass('showMe');
    console.log("ready function");

    positionThumbnails();


})

function positionThumbnails(){

    //alert('ready to reposition');

    //debug
    $('.debug-remainder').html('');
    var containerWidth=$('.photos').width();
    var thumbnail_R=0;
    var thumbnail_C=0;
    var thumbnailWidth=$('a.thumbnail img:first-child').outerWidth()+window.thumbnailSpacing;
    var thumbnailHeight=$('a.thumbnail img:first-child').outerHeight()+window.thumbnailSpacing;
    var max_C=Math.floor(containerWidth/thumbnailWidth);


    console.log('out each');


    $('.thumbnail_container a.thumbnail.showMe').each(function(index){

        console.log('INININ each');
        var remainder=(index%max_C)/100;
        console.log('remainder: '+remainder);
        var maxIndex=0;
        $('.debug-remainder').append(remainder+' - ');

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
        },500);



    });
}

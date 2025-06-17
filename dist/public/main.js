HFS.onEvent('afterEntryName', ({ entry, h }) =>
    /mp3|wav|aac|ogg|flac|m4a/.test(entry.ext) &&
    HFS.h('button', { className: 'play-button', onClick: () => play(entry.n) }))

HFS.onEvent('beforeHeader', () => `
  <div class="contain" >
            <div class="music-player">
			    <div class="cover">
                    <img src="" alt="">   
          </div>
				<div class="wrap-text">
					<p id="aud-info">Play songs by clicking<button class="play-button"></button></p>
				</div>
				<div class="btn">
				    <button onclick="backward()" style="color: #aeaeae4d; background-color: transparent; border: none; display: block; padding: 0; position: absolute; left: 30%; top: 18.5%; z-index: 4;"><i class="icon-to-start"></i></button>
				    <button onclick="forward()" style="color: #aeaeae4d; background-color: transparent; border: none; display: block; padding: 0; position: absolute; left: 63%; top: 18.5%; z-index: 4;"><i class="icon-to-end"></i></button>
                    <button onclick="close_player()" title="Close player" style="color: #aeaeae4d; background-color: transparent; border: none; display: block; padding: 0; position: absolute; left: 75%; top: 18.5%; z-index: 4;"><i class="icon-close"></i></button>
					<button id="auto-play" style="color: #aeaeae4d; background-color: transparent; border: none; display: block; padding: 0; position: absolute; left: 55%; bottom: 13.5%; z-index: 4;"><i class="icon-wheelchair"></i></button>
				</div>
                <div class="lecteur">
                    <audio class="fc-media" src="null" autoplay></audio>
                </div>
            </div>
</div>

<div class="music_list">
	<div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--faint-contrast);">
	  <span>nothing</span>
      <div style="display: flex; flex-direction: row;">
	    <button id="hide"></button>
        <button onclick="close_playlist()" id = "close_playlist" title="Close playlist" style="margin-left: 0.5em;"><i class="icon-close"></i></button>
      </div>
	</div>
	<div id="scroll">
	  <ul id="list">
	  </ul>
	</div>
  </div>
</div>
`)

function close_playlist() {
    document.querySelector('.music_list').style.setProperty('display', 'none', 'important');
    let aud = document.querySelector("audio.fc-media");
    if (aud) aud.pause();
}

function close_player() {
    document.querySelector('.music-player').style.setProperty('display', 'none', 'important');
    let aud = document.querySelector("audio.fc-media");
    if (aud) aud.pause();
    close_playlist();
}

function open_player_if_closed() {
    document.querySelector('.music-player').style.removeProperty('display');
}

async function play(name2 = '') {

    open_player_if_closed();

    const root = document.querySelector('.fc-media')
    const audio = root.querySelector('audio')
    var acc = name2.split('.');
    acc.splice(-1);
    acc = acc.join('.');

    audio.src = encodeURIComponent(name2);

    elem = document.querySelectorAll('.file a');
    last_dir = location.href;
    var folder = last_dir.split('/');

    var cover = ""
    $(".file a").each((i, a) => {
        var name = $(a).text();
        var ext = name.split(".")[name.split(".").length - 1].trim()
        if (["jpg", "png", "jpeg", "webp", "gif", "avif"].includes(ext)) {
            cover = $(a).attr("href")
            if (name !== null && name.toLowerCase().trim().includes("cover")) return false;
        }
    })

    await getmeta(encodeURIComponent(name2), cover, folder, acc)


    list_append();
    song_pos = check_pos(acc);
    if (document.querySelector('.music_list #list').clientHeight <= 359) {
        $('.music_list #scroll').css('height', document.querySelector('.music_list #list').clientHeight + 'px')
    } else { $('.music_list #scroll').css('height', '360px') };
    check3 = false;
    $('.music_list #list li').removeAttr('style');
    $('.music_list #list li').eq(song_pos).css('animation', 'fade 2s ease infinite alternate')


}

async function play_temp(order) {
    var src = $(elem[order]).text();


    var acc = src.split('.');
    acc.splice(-1);
    acc = acc.join('.');
    const root = document.querySelector('.fc-media')
    const audio = root.querySelector('audio')
    audio.src = last_dir + encodeURIComponent(src);
    var cover = "";
    await getmeta(encodeURIComponent(src), cover, null, acc)

    song_pos = check_pos(acc);
    $('.music_list #list li').removeAttr('style');
    $('.music_list #list li').eq(song_pos).css('animation', 'fade 2s ease infinite alternate')
}

async function getmeta(name, cover, folder, acc) {
    var res = await fetch(last_dir + name)
    var blob = await res.blob();
    console.log(last_dir + name);

    jsmediatags.read(blob, {
        onSuccess: function (tag) {
            if (tag.tags.title != null) acc = tag.tags.title;
            if (tag.tags.artist != null) acc = tag.tags.artist + " - " + acc;
            if (tag.tags.album != null) { folder = tag.tags.album }
            else { folder = decodeURI(folder[folder.length - 2]) };
            if (tag.tags.picture != null) {
                var data = tag.tags.picture.data;
                var format = tag.tags.picture.format;
                let base64String = "";
                for (var i = 0; i < data.length; i++) {
                    base64String += String.fromCharCode(data[i]);
                }
                cover = `data:${data.format};base64,${btoa(base64String)}`;
            }
            if (cover != "") $('div.cover img').attr('src', cover)
            document.querySelector('#aud-info').innerText = decodeURIComponent(acc)
            d.setProperty('--width-text', document.querySelector('#aud-info').offsetWidth / 130 * 110 + '%');
            $('.music_list span').text(folder);
        },
        onError: function (error) {

            $('div.cover img').attr('src', cover)
            document.querySelector('#aud-info').innerText = decodeURIComponent(acc)
            d.setProperty('--width-text', document.querySelector('#aud-info').offsetWidth / 130 * 110 + '%');
            $('.music_list span').text(decodeURI(folder[folder.length - 2]));
        }
    })
}

function list_append() {
    document.querySelector('.music_list #list').innerHTML = ""

    $(elem).each(function () {
        var name = $(this).text();
        var acc = name.split('.');
        acc.splice(-1);
        acc = acc.join('.');
        var ext = name.split(".")[name.split(".").length - 1].trim();

        var check = 0
        for (check; check < elem.length; check++) {
            if ($(elem[check]).text() == name) break;
        }

        if (["m4a", "mp3", "flac", "wav", "ogg", "aiff"].includes(ext)) {
            $(".music_list #list").append(`<li><button onclick='play_temp(` + check + `)'>` + decodeURIComponent(acc) + `</button></li>`);
        }
    })

    var check = 0
    for (check; check < elem.length; check++) {
        if ($(elem[check]).attr('href') == $(".fc-media audio").attr('src')) break;
    }

}

function check_pos(acc) {
    var check = 0;
    for (check; check < $('.music_list #list button').length; check++) {
        if (decodeURIComponent(acc) == $('.music_list #list button').eq(check).text()) break;
    }
    console.log(check);
    return check;
}


var check3 = false;


elem = document.querySelectorAll('.file a');
let d = document.documentElement.style;
$('#menu-panel').parent().before($('#menu-panel'));




let aud = document.querySelector("audio.fc-media")
var cover_check;
play_pause = false
$(document).on('keyup', function (e) {
    if (e.which === 80) { play_pause = !play_pause }
    if (play_pause == true) { aud.pause() }
    else { if (aud) aud.play() }
    if (e.which === 188) backward();
    if (e.which === 190) forward();
    if (e.which === 191) atp();
})
$(document).on('keydown', function (e) {
    if (e.which === 37) aud.currentTime -= 1;
    if (e.which === 39) aud.currentTime += 1;
})

var song_pos = 0;
var last_dir = "";
function backward() {
    if (song_pos > 0) {
        song_pos -= 1;
        $('.music_list #list button').eq(song_pos).click();
    }
}

function forward() {
    if (song_pos < $('.music_list #list button').length - 1) {
        song_pos += 1;
        $('.music_list #list button').eq(song_pos).click();
    }
}

var stopint_check = true

function atp() {
    console.log(stopint_check);
    
    stopint_check = !stopint_check;
    if (stopint_check == true) {
        aud.onended = function () {
            console.log('autoplay-off');
        };
        d.setProperty('--autoplay-color', '#aeaeae4d');
    }
    else {
        aud.onended = function () {
            forward();
        };
        d.setProperty('--autoplay-color', '#c5c9d6');
    }
}


var audio = {
    init: function () {
        var $that = this;
        $(function () {
            $that.components.media();
        });
    },
    components: {
        media: function (target) {
            var media = $("audio.fc-media", (target !== undefined) ? target : 'body');
            if (media.length) {
                media.mediaelementplayer({
                    audioHeight: 100,
                    features: ['playpause', 'current', 'duration', 'progress', 'volume', 'tracks', 'fullscreen', 'next'],
                    alwaysShowControls: true,
                    timeAndDurationSeparator: '<span></span>',
                    iPadUseNativeControls: false,
                    iPhoneUseNativeControls: false,
                    AndroidUseNativeControls: false
                });
            }
        },

    },
};


//make thing dragable


function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;


    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

setTimeout(() => {
    audio.init()
    aud = document.querySelector("audio.fc-media")
    dragElement(document.querySelector(".music-player"))
    dragElement(document.querySelector(".music_list"))

    $('.music_list #hide').click(() => {
        // console.log(check3);

        check3 = !check3;

        if (check3 == true) {
            $('.music_list #scroll').css('height', '0');
        } else {
            if (document.querySelector('.music_list #list').clientHeight <= 359) {
                $('.music_list #scroll').css('height', document.querySelector('.music_list #list').clientHeight + 'px')
            } else { $('.music_list #scroll').css('height', '360px') }
        }
    })

    $("#auto-play").click(() => atp());
}, 500)

// document.addEventListener("load", () => {

// })

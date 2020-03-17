// https://api.genius.com/search?access_token=qQxv5qWytawZRrxyc9sLzpdH15N3hqKbOZ6hZv25pvDZmizwDjWRAsjuKkszxuQ8&q=tame%20impala%20borderline //metadata provider

/*

Application name	Lyrics Tester
API key	9b0d44d3c1eed4d5f488e26836844378
Shared secret	e93f60e089cb6d53d685ab17538a74d4
Registered to	yale_7212

*/ 

//https://api.lyrics.ovh/v1/artist/title    //lyrics provied

// http://ws.audioscrobbler.com/2.0/?method=track.search&track=track&api_key=YOUR_API_KEY&format=json   // track search provider


/* SEARCH */

const api_key_lastfm = "9b0d44d3c1eed4d5f488e26836844378";
const access_token = "qQxv5qWytawZRrxyc9sLzpdH15N3hqKbOZ6hZv25pvDZmizwDjWRAsjuKkszxuQ8";

const input = document.querySelector(".input");
input.addEventListener('keyup', searchSong);    //keyup sends all the chars else it's one behind
input.addEventListener('click', searchSong);    //when user focuses back 
input.addEventListener('blur', (e) => {         //to clear when blurs. if not for settimeout search won't happen as it blurs when clicked on the search result
    setTimeout(() => {
        clearUI();
    }, 1000);
});

function searchSong(e){
    // console.log(e.target.value);
    // let search = new RegExp(e.target.value, "i");
    let search = String(e.target.value);
    search = search.replace(/\s/g, "%20");  //replacing whitespaces with %20
    async function getSong(){
        const res = await fetch(`http://ws.audioscrobbler.com/2.0/?method=track.search&track=${search}&api_key=${api_key_lastfm}&format=json`);
        const data = await res.json();
        return data;
    }
    getSong().then((data) => {displaySearch(data)});
}





function displaySearch (obj){

    //meta



    // console.log(obj.results.trackmatches.track);
    let html = "";
    const songs = obj.results.trackmatches.track;
    songs.forEach((song, index) => {
        if(index < 3){
            html += `
                    <div class="welcome__text">
                        <a href="#" class="welcome__link">
                                 ${song.name} | ${song.artist}
                        </a>
                    </div>
                    `
        }
    })
    let parent = document.querySelector(".welcome__result");
    parent.innerHTML = html;
    // console.log(songs[1]);
}

document.querySelector(".welcome__result").addEventListener('click', showLyrics);

function showLyrics(e){

    if(e.target.className === "welcome__link"){
        //getting metadata

        let str = e.target.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();    //trim is used to remove white spaces from both sides
        str = str.split(" | ");
        str[0] = str[0].replace(/\s/g, "%20");  //replacing whitespaces with %20
        str[1] = str[1].replace(/\s/g, "%20"); //replacing whitespaces with %20
        async function getMeta(){
            const res = await fetch(`https://api.genius.com/search?access_token=${access_token}&q=${str[0]}%20${str[1]}`);
            const data = await res.json();
            return data;
        }
        getMeta().then((data) => {
            console.log(data);
            const img_url = data.response.hits[0].result.song_art_image_url;
            const title = data.response.hits[0].result.title;
            const artist = data.response.hits[0].result.primary_artist.name;

            document.querySelector(".result__artist").innerHTML = `<h1>${title}</h1><h1>${artist}</h1>`;
            document.querySelector(".result__album-image").src = img_url;
            clearUI();
        });
        getMeta().catch((err) => {
            //error
            document.querySelector(".result__artist").innerHTML = `<h1 class="error">Can't find that.</h1><h1 class="error">Sorry!!</h1>`;
        });

        //getting lyrics

        async function getLyrics(){
            const res = await fetch(`https://api.lyrics.ovh/v1/${str[1]}/${str[0]}`);
            const data = await res.json();
            return data;
        }
        getLyrics().then((data) => {
            console.log(data);
            if(data.lyrics){
                const lyrics = data.lyrics;
                document.querySelector(".result__lyrics").innerHTML = `<h4>${lyrics} </h4>`;
            }else{
                document.querySelector(".result__lyrics").innerHTML = `<h4 class="error">Error. Make sure you're searching the correct track. If you're searching for any regional song we're sorry to tell you that we currently have very limited database. </h4>`;
            }

        });

    }
    e.preventDefault();
}

function clearUI(){
    let parent = document.querySelector(".welcome__result");
    parent.innerHTML = "";
}

function init(){
    document.querySelector(".result__artist").innerHTML = "";
    document.querySelector(".result__album-image").src = "";
    document.querySelector(".result__lyrics").innerHTML = "";
    document.querySelector(".input").value = "";
}

document.querySelector(".header__list").addEventListener('click', (e) => {
    if(e.target.classList.contains("home")){
        clearUI();
        init();
        console.log("found");
    }
    e.preventDefault();
});


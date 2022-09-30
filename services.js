
if (get('access_token') !== null) {
    window.localStorage.setItem('spotify_token', get('access_token'));
    removeGet();
}

const cliend_id = 'c8ec8ae5f24c40ffb37859696810752d'
let token;

if (token = window.localStorage.getItem('spotify_token')) {
    document.querySelector('.spotify-login').classList.add('hidden')

    getSpotifyPlaylists('https://api.spotify.com/v1/me/playlists?limit=50');
}

function getSpotifyPlaylists(url) {
    fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            if (data['error'] !== undefined) {
                document.querySelector('.spotify-login').classList.remove('hidden')
                return window.localStorage.removeItem('spotify_token');
            }
            let user = data.href.replace(/.*\/users\/(.*?)\/.*/, '$1');
            let spotify_playlists = document.querySelector('.spotify');
            spotify_playlists.classList.remove('hidden');
            console.log(data)
            data.items.forEach(e => {
                if (e.owner.id == user) {
                    let playlist = document.createElement('p');
                    playlist.textContent = e.name;
                    playlist.dataset.id = e.id;
                    playlist.classList.add('hover:text-black');
                    playlist.classList.add('cursor-pointer');
                    spotify_playlists.querySelector('div').appendChild(playlist);
                    playlist.addEventListener('click', getSpotifyPlaylist)
                }
            });
            if (data.next !== null) {
                getSpotifyPlaylists(data.next);
            }
        });
}

function getSpotifyPlaylist(e) {
    const textarea = document.querySelector('#title');

    textarea.value = e.target.textContent;
    let submit = document.querySelector('.spotify-submit');
    let submit_button = submit.querySelector('button');
    submit_button.dataset.id = e.target.dataset.id;
    submit_button.textContent = 'Применить к "' + e.target.textContent + '"';
    if (submit.classList.contains('hidden')) {
        submit.classList.remove('hidden');
        submit_button.addEventListener('click', () => { applySpotifyPlaylist(submit_button.dataset.id) });
    }

    generateAvatar();
}

function applySpotifyPlaylist(playlist) {
    fetch('https://api.spotify.com/v1/playlists/' + playlist + '/images', {
        method: 'PUT',
        headers: {
            'Content-Type': 'image/jpeg',
            "Authorization": `Bearer ${token}`
        },
        body: generateAvatar().replace(/data:image\/jpeg;base64,/, '')
    })
        .then((response) => {
            return alert('image uploaded')
        })
}

function dataURLtoFile(dataurl, filename) {

    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}

function get(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&#]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function removeGet() {
    return window.location.replace(window.location.href.replace(/(.*?)[?#&].*/, '$1'));
}
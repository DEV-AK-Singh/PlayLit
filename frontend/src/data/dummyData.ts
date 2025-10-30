import { type Playlist, type Track } from "../App";

const sortArrayByKey = (array: any[], key: string) => {
  return array.sort((a: any, b: any) => {
    const nameA = a[key].toLowerCase();
    const nameB = b[key].toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
};

const dummyPlaylists : Playlist[] = [
    {
        "id": "PLFs8CRvnMihD4p8bbrWyb-Io-lrKC2BR9",
        "name": "Random YT Playlist",
        "description": "Test description",
        "tracks": 2,
        "image": "https://i.ytimg.com/vi/DPcQPReMSIc/hqdefault.jpg",
        "owner": "ABHISHEK SINGH",
        "privacy": "public",
        "platform": "youtube"
    },
    {
        "id": "PLFs8CRvnMihBtM5ANe9uWon4zMU1ABu19",
        "name": "sadaf",
        "description": "sdasf",
        "tracks": 1,
        "image": "https://i.scdn.co/image/ab67616d0000b2730bf17c0c9dc828e68794a66b",
        "owner": "ABHISHEK SINGH",
        "privacy": "public",
        "platform": "spotify"
    },
    {
        "id": "PLFs8CRvnMihDBvEt5cbjY6OmIvk4Q_yGn",
        "name": "Somesh playlist",
        "description": "pagal",
        "tracks": 9,
        "image": "https://i.ytimg.com/vi/D1Igl2J0gB4/hqdefault.jpg",
        "owner": "ABHISHEK SINGH",
        "privacy": "public",
        "platform": "youtube"
    },
    {
        "id": "PLFs8CRvnMihBGclI87xnSXvCWdcvUZBDu",
        "name": "test q",
        "description": "test q",
        "tracks": 1,
        "image": "https://i.ytimg.com/vi/DPcQPReMSIc/hqdefault.jpg",
        "owner": "ABHISHEK SINGH",
        "privacy": "private",
        "platform": "youtube"
    },
    {
        "id": "PLFs8CRvnMihDwK53uideXjuFtMXDcm3u_",
        "name": "test q1",
        "description": "test q1",
        "tracks": 1,
        "image": "https://i.ytimg.com/vi/T5rmd-vKQeM/hqdefault.jpg",
        "owner": "ABHISHEK SINGH",
        "privacy": "private",
        "platform": "youtube"
    },
    {
        "id": "PLFs8CRvnMihAsQwENd2Gvv7vhLwrtkZWx",
        "name": "test q2",
        "description": "test q2",
        "tracks": 2,
        "image": "https://i.ytimg.com/vi/l8zlKap1JEo/hqdefault.jpg",
        "owner": "ABHISHEK SINGH",
        "privacy": "private",
        "platform": "youtube"
    },
    {
        "id": "PLFs8CRvnMihC7Sd9UyqqCIZyJf_A6nonm",
        "name": "test q3",
        "description": "test q3",
        "tracks": 1,
        "image": "https://i.ytimg.com/vi/_oxjF1w9bik/hqdefault.jpg",
        "owner": "ABHISHEK SINGH",
        "privacy": "private",
        "platform": "youtube"
    },
    {
        "id": "PLFs8CRvnMihDJ9ic3Ex3CbOAv6gSLDzIp",
        "name": "test q4",
        "description": "test q4",
        "tracks": 1,
        "image": "https://i.ytimg.com/vi/_oxjF1w9bik/hqdefault.jpg",
        "owner": "ABHISHEK SINGH",
        "privacy": "private",
        "platform": "youtube"
    },
    {
        "id": "PLFs8CRvnMihDslaXi_-fXrunGqcy0MhEe",
        "name": "X",
        "description": "test description",
        "tracks": 4,
        "image": "https://i.ytimg.com/vi/Lc1Ll-euRSg/hqdefault.jpg",
        "owner": "ABHISHEK SINGH",
        "privacy": "private",
        "platform": "youtube"
    },
    {
        "id": "PLFs8CRvnMihDTE8lZKF_BsP9ylLBn3NJK",
        "name": "X V",
        "description": "XX",
        "tracks": 3,
        "image": "https://i.ytimg.com/vi/D1Igl2J0gB4/hqdefault.jpg",
        "owner": "ABHISHEK SINGH",
        "privacy": "public",
        "platform": "youtube"
    },
    {
        "id": "PLFs8CRvnMihCKGZHlGvxjGso4mhulXVp3",
        "name": "x123",
        "description": "xxxx",
        "tracks": 1,
        "image": "https://i.ytimg.com/vi/nDOpAEW2q2w/hqdefault.jpg",
        "owner": "ABHISHEK SINGH",
        "privacy": "public",
        "platform": "youtube"
    },
    {
        "id": "PLFs8CRvnMihDhbBspcj6Cy-e_LW8KuhKD",
        "name": "x123sdasd",
        "description": "xxxxasdasd",
        "tracks": 1,
        "image": "https://i.ytimg.com/vi/DPcQPReMSIc/hqdefault.jpg",
        "owner": "ABHISHEK SINGH",
        "privacy": "public",
        "platform": "youtube"
    },
    {
        "id": "PLFs8CRvnMihCtR9JWZ3BVPNHcI12bCAfU",
        "name": "XXXX",
        "description": "XXX",
        "tracks": 5,
        "image": "https://i.ytimg.com/vi/DPcQPReMSIc/hqdefault.jpg",
        "owner": "ABHISHEK SINGH",
        "privacy": "public",
        "platform": "youtube"
    },
    {
        "id": "PLFs8CRvnMihBEHfZHqRjMdrpXrm5GVasp",
        "name": "youtube xa1",
        "description": "youtube xa1",
        "tracks": 14,
        "image": "https://i.ytimg.com/vi/_oxjF1w9bik/hqdefault.jpg",
        "owner": "ABHISHEK SINGH",
        "privacy": "public",
        "platform": "youtube"
    }
];

const dummyTracks : Track[] = [
    {
        "id": "DPcQPReMSIc",
        "name": "\"Tum Hi Ho\" 1 Korean Guy Singing in 11 Indian Languages तुम ही हो - Cover by Travys Kim",
        "album": "YouTube Music",
        "artist": "Travys Kim",
        "image": "https://i.ytimg.com/vi/DPcQPReMSIc/hqdefault.jpg",
        "duration": 256000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=DPcQPReMSIc"
    },
    {
        "id": "T5rmd-vKQeM",
        "name": "#Flashup By Knox Artiste | #14SONGSON1BEAT",
        "album": "YouTube Music",
        "artist": "Knox Artiste",
        "image": "https://i.ytimg.com/vi/T5rmd-vKQeM/hqdefault.jpg",
        "duration": 249000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=T5rmd-vKQeM"
    },
    {
        "id": "D1Igl2J0gB4",
        "name": "1 GUY 40 VOICES (with music) | Part 2",
        "album": "YouTube Music",
        "artist": "Aksh Baghla",
        "image": "https://i.ytimg.com/vi/D1Igl2J0gB4/hqdefault.jpg",
        "duration": 369000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=D1Igl2J0gB4"
    },
    {
        "id": "nDOpAEW2q2w",
        "name": "Arijit Singh - Pal | Official Video | Nawazuddin Siddiqui | Monsoon Shootout | Rochak Kohli",
        "album": "YouTube Music",
        "artist": "Saregama Music",
        "image": "https://i.ytimg.com/vi/nDOpAEW2q2w/hqdefault.jpg",
        "duration": 235000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=nDOpAEW2q2w"
    },
    {
        "id": "YLg2U-KKc-s",
        "name": "BOLLYWOOD STYLE ZUMBA // FITNESS WORKOUT // BEGINNERS  // NONSTOP ZUMBA  AT HOME // WARM UP",
        "album": "YouTube Music",
        "artist": "Rishabh Singh",
        "image": "https://i.ytimg.com/vi/YLg2U-KKc-s/hqdefault.jpg",
        "duration": 187000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=YLg2U-KKc-s"
    }, 
    {
        "id": "l8zlKap1JEo",
        "name": "Dhindora | Official Music Video | BB Ki Vines",
        "album": "YouTube Music",
        "artist": "BB Ki Vines",
        "image": "https://i.ytimg.com/vi/l8zlKap1JEo/hqdefault.jpg",
        "duration": 251000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=l8zlKap1JEo"
    },
    {
        "id": "PzmNssVLcLQ",
        "name": "Dil Bechara- Khulke Jeene Ka (Official)|Sushant, Sanjana|A.R Rahman|Arijit, Shashaa|Amitabh B|Mukesh",
        "album": "YouTube Music",
        "artist": "Sony Music India",
        "image": "https://i.ytimg.com/vi/PzmNssVLcLQ/hqdefault.jpg",
        "duration": 206000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=PzmNssVLcLQ"
    },
    {
        "id": "pr-4GbR4DpQ",
        "name": "Dil Bechara- Taare Ginn |Official Video|Sushant, Sanjana|A.R.Rahman|Mohit, Shreya|Mukesh C|Amitabh B",
        "album": "YouTube Music",
        "artist": "Sony Music India",
        "image": "https://i.ytimg.com/vi/pr-4GbR4DpQ/hqdefault.jpg",
        "duration": 124000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=pr-4GbR4DpQ"
    },
    {
        "id": "_oxjF1w9bik",
        "name": "Dil Ibaadat (Reprise) | JalRaj | KK | Emraan Hashmi | Tum Mile | Latest Hindi Cover 2020",
        "album": "YouTube Music",
        "artist": "JalRaj",
        "image": "https://i.ytimg.com/vi/_oxjF1w9bik/hqdefault.jpg",
        "duration": 244000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=_oxjF1w9bik"
    },
    {
        "id": "QeL3Y2JZ4lo",
        "name": "Dulhe Ka Shera - Cover By || Kapil Bansal || Gulshan || Sohail || Best Performance || Apna TV Show",
        "album": "YouTube Music",
        "artist": "Apna TV Show",
        "image": "https://i.ytimg.com/vi/QeL3Y2JZ4lo/hqdefault.jpg",
        "duration": 601000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=QeL3Y2JZ4lo"
    },
    {
        "id": "vX2cDW8LUWk",
        "name": "Excuses (Official Video) | AP Dhillon | Gurinder Gill | Intense",
        "album": "YouTube Music",
        "artist": "Intense",
        "image": "https://i.ytimg.com/vi/vX2cDW8LUWk/hqdefault.jpg",
        "duration": 177000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=vX2cDW8LUWk"
    },
    {
        "id": "ZMLoJEgI2mY",
        "name": "Feelings - Vatsala | Female Version | Sumit Goswami",
        "album": "YouTube Music",
        "artist": "Whizz Music Productions",
        "image": "https://i.ytimg.com/vi/ZMLoJEgI2mY/hqdefault.jpg",
        "duration": 172000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=ZMLoJEgI2mY"
    },
    {
        "id": "JeGBNhyJeE4",
        "name": "Full Song: Kal Ki Hi Baat Hai | CHHICHHORE | Sushant, Shraddha | KK, Pritam, Amitabh Bhattacharya",
        "album": "YouTube Music",
        "artist": "T-Series",
        "image": "https://i.ytimg.com/vi/JeGBNhyJeE4/hqdefault.jpg",
        "duration": 233000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=JeGBNhyJeE4"
    },
    {
        "id": "hoNb6HuNmU0",
        "name": "Full Song: KHAIRIYAT (BONUS TRACK) | CHHICHHORE | Sushant, Shraddha | Pritam, Amitabh B|Arijit Singh",
        "album": "YouTube Music",
        "artist": "T-Series",
        "image": "https://i.ytimg.com/vi/hoNb6HuNmU0/hqdefault.jpg",
        "duration": 239000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=hoNb6HuNmU0"
    },
    {
        "id": "hOHKltAiKXQ",
        "name": "Hanumankind, Kalmi - Hanumankind – Big Dawgs | Prod. Kalmi (Official Music Video) | Def Jam India",
        "album": "YouTube Music",
        "artist": "HanumankindVEVO",
        "image": "https://i.ytimg.com/vi/hOHKltAiKXQ/hqdefault.jpg",
        "duration": 235000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=hOHKltAiKXQ"
    },
    {
        "id": "7GHfo6xya6c",
        "name": "hey ram hey ram -  jagjit singh full song | bhajan | rambhajan",
        "album": "YouTube Music",
        "artist": "JAY SHREE RAM",
        "image": "https://i.ytimg.com/vi/7GHfo6xya6c/hqdefault.jpg",
        "duration": 527000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=7GHfo6xya6c"
    },
    {
        "id": "bdXuuBQ1OuQ",
        "name": "JAB JAB NAVRATRE AAVE (OFFICIAL MUSIC VIDEO) | SHREYA GHOSHAL | RAAJ AASHOO | MURALI AGARWAL",
        "album": "YouTube Music",
        "artist": "SpotlampE",
        "image": "https://i.ytimg.com/vi/bdXuuBQ1OuQ/hqdefault.jpg",
        "duration": 213000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=bdXuuBQ1OuQ"
    },
    {
        "id": "aAEpNhlYFFw",
        "name": "Kahani suno by kreesh subscribe for more #kahanisuno2 #kaifikhalil #haniaamir",
        "album": "YouTube Music",
        "artist": "Itsyourkrish",
        "image": "https://i.ytimg.com/vi/aAEpNhlYFFw/hqdefault.jpg",
        "duration": 57000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=aAEpNhlYFFw"
    },
    {
        "id": "ZoWVweNC5kU",
        "name": "KAUN TUJHE - Violin by Japanese Musician | Tribute to Sushant Singh Rajput",
        "album": "YouTube Music",
        "artist": "Namaste Kohei",
        "image": "https://i.ytimg.com/vi/ZoWVweNC5kU/hqdefault.jpg",
        "duration": 136000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=ZoWVweNC5kU"
    },
    {
        "id": "xrM4afyLXxQ",
        "name": "Kya Mujhe Pyar Hai x Tu Hi Meri Shab Hai x Labon Ko I Khudgharz’s tribute to KK",
        "album": "YouTube Music",
        "artist": "Khudgharz",
        "image": "https://i.ytimg.com/vi/xrM4afyLXxQ/hqdefault.jpg",
        "duration": 259000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=xrM4afyLXxQ"
    },
    {
        "id": "jyv81Aq815Q",
        "name": "Kyun Diya Dard Hume Hum Aaj Talak Na Samjhe 💔 | Jo Tu Na Mila Mujhe | Love Status | #shorts #status",
        "album": "YouTube Music",
        "artist": "Akash Status Creates",
        "image": "https://i.ytimg.com/vi/jyv81Aq815Q/hqdefault.jpg",
        "duration": 29000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=jyv81Aq815Q"
    },
    {
        "id": "ywN_vG9b828",
        "name": "main agar kahoon (slowed + reverb)",
        "album": "YouTube Music",
        "artist": "joana's slowed n reverbed desi",
        "image": "https://i.ytimg.com/vi/ywN_vG9b828/hqdefault.jpg",
        "duration": 331000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=ywN_vG9b828"
    },
    {
        "id": "ohxFArvBpBc",
        "name": "New vs Old 2 Bollywood Songs Mashup | Raj Barman feat. Deepshikha | Bollywood Songs Medley",
        "album": "YouTube Music",
        "artist": "Raj Barman",
        "image": "https://i.ytimg.com/vi/ohxFArvBpBc/hqdefault.jpg",
        "duration": 409000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=ohxFArvBpBc"
    },
    {
        "id": "BOgiLwQ7Es0",
        "name": "Parichay - Amit Bhadana ( Official Music Video ) | Ikka | Byg Byrd |",
        "album": "YouTube Music",
        "artist": "Amit Bhadana",
        "image": "https://i.ytimg.com/vi/BOgiLwQ7Es0/hqdefault.jpg",
        "duration": 431000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=BOgiLwQ7Es0"
    }, 
    {
        "id": "6mg9c54Xhps",
        "name": "RE- START | VISSHHH | THE TALENT SPOTTERS (OFFICIAL LYRICAL VIDEO)",
        "album": "YouTube Music",
        "artist": "The Talent Spotters",
        "image": "https://i.ytimg.com/vi/6mg9c54Xhps/hqdefault.jpg",
        "duration": 89000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=6mg9c54Xhps"
    },
    {
        "id": "T94PHkuydcw",
        "name": "ROCKSTAR: Kun Faya Kun (Full Video Song) | Ranbir Kapoor | A.R. Rahman, Javed Ali, Mohit Chauhan",
        "album": "YouTube Music",
        "artist": "T-Series",
        "image": "https://i.ytimg.com/vi/T94PHkuydcw/hqdefault.jpg",
        "duration": 381000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=T94PHkuydcw"
    },
    {
        "id": "XKD9UxvdbVU",
        "name": "Saajna x Aadat  - JalRaj | Atif Aslam | Jal The Band | Falak | Latest Hindi Cover 2021",
        "album": "YouTube Music",
        "artist": "JalRaj",
        "image": "https://i.ytimg.com/vi/XKD9UxvdbVU/hqdefault.jpg",
        "duration": 275000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=XKD9UxvdbVU"
    },
    {
        "id": "DXCd7Moy3to",
        "name": "SHOORVEER 3 - A Tribute to छत्रपति शिवाजी महाराज | Rapperiya Baalam Ft. Shambho I Meetu Solanki",
        "album": "YouTube Music",
        "artist": "Rapperiya Baalam",
        "image": "https://i.ytimg.com/vi/DXCd7Moy3to/hqdefault.jpg",
        "duration": 210000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=DXCd7Moy3to"
    },
    {
        "id": "hocNc4eAOEY",
        "name": "Tiger Shroff and MJ5 | MJ5 Performance at Pune",
        "album": "YouTube Music",
        "artist": "MJ5 Official",
        "image": "https://i.ytimg.com/vi/hocNc4eAOEY/hqdefault.jpg",
        "duration": 488000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=hocNc4eAOEY"
    },
    {
        "id": "AX6OrbgS8lI",
        "name": "Tu Hai Kahan by AUR | تو ہے کہاں (Official Music Video)",
        "album": "YouTube Music",
        "artist": "AUR",
        "image": "https://i.ytimg.com/vi/AX6OrbgS8lI/hqdefault.jpg",
        "duration": 264000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=AX6OrbgS8lI"
    },
    {
        "id": "Vx7YkKpt-J4",
        "name": "Vilen - Chidiya (Official  Video)",
        "album": "YouTube Music",
        "artist": "Darks Music Company",
        "image": "https://i.ytimg.com/vi/Vx7YkKpt-J4/hqdefault.jpg",
        "duration": 415000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=Vx7YkKpt-J4"
    },
    {
        "id": "jz7mM8DrNXs",
        "name": "Vilen - Ek Raat (Acoustic Version) 2019",
        "album": "YouTube Music",
        "artist": "Darks Music Company",
        "image": "https://i.ytimg.com/vi/jz7mM8DrNXs/hqdefault.jpg",
        "duration": 191000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=jz7mM8DrNXs"
    },
    {
        "id": "zzwRbKI2pn4",
        "name": "YALGAAR - CARRYMINATI X Wily Frenzy",
        "album": "YouTube Music",
        "artist": "CarryMinati",
        "image": "https://i.ytimg.com/vi/zzwRbKI2pn4/hqdefault.jpg",
        "duration": 195000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=zzwRbKI2pn4"
    },
    {
        "id": "h6m_5uG6Wik",
        "name": "ZARA ZARA (Cover by Aksh Baghla)",
        "album": "YouTube Music",
        "artist": "Aksh Baghla",
        "image": "https://i.ytimg.com/vi/h6m_5uG6Wik/hqdefault.jpg",
        "duration": 189000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=h6m_5uG6Wik"
    },
    {
        "id": "pdoM2FzGoog",
        "name": "Zara Zara Behekta Hai [Cover 2018] | RHTDM | Omkar ft.Aditya Bhardwaj |Full Bollywood Music Video",
        "album": "YouTube Music",
        "artist": "Omkar Singh ",
        "image": "https://i.ytimg.com/vi/pdoM2FzGoog/hqdefault.jpg",
        "duration": 238000,
        "platform": "youtube",
        "platformUrl": "https://www.youtube.com/watch?v=pdoM2FzGoog"
    },
    {
        "id": "0FoAlOXHI6KJ4RHP9v8jnw",
        "name": "Baby Girl",
        "album": "Baby Girl",
        "artist": "Guru Randhawa, Dhvani Bhanushali",
        "image": "https://i.scdn.co/image/ab67616d0000b27333f648898c89bc72e75eec43",
        "duration": 207493,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/0FoAlOXHI6KJ4RHP9v8jnw"
    },
    {
        "id": "4rOvOF8mGZToUh1KuZW3iS",
        "name": "Bol Kaffara Kya Hoga",
        "album": "Bol Kaffara Kya Hoga",
        "artist": "chronically online",
        "image": "https://i.scdn.co/image/ab67616d0000b273c27a6440b4baeda9ecd100a4",
        "duration": 406000,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/4rOvOF8mGZToUh1KuZW3iS"
    },
    {
        "id": "7g2qM4Bv8TmVQbqLIHsum1",
        "name": "Choudhar Jaat Ki",
        "album": "Choudhar Jaat Ki",
        "artist": "Raju Punjabi",
        "image": "https://i.scdn.co/image/ab67616d0000b273a743fd419cc2de01a99aec5d",
        "duration": 242264,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/7g2qM4Bv8TmVQbqLIHsum1"
    },
    {
        "id": "0AYQ6M0xS5cCIm9WhYhwh1",
        "name": "Choudhar Jaat Ki (Slowed & Reverb)",
        "album": "Choudhar Jaat Ki (Slowed & Reverb)",
        "artist": "Raju Punjabi",
        "image": "https://i.scdn.co/image/ab67616d0000b27358594ecb30535cdb36c762cf",
        "duration": 275604,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/0AYQ6M0xS5cCIm9WhYhwh1"
    },
    {
        "id": "3ayMReTwLoo6jAg7adDqyz",
        "name": "Har Funn Maula (From \"Koi Jaane Na\")",
        "album": "Har Funn Maula (From \"Koi Jaane Na\")",
        "artist": "Tanishk Bagchi, Vishal Dadlani, Zahrah S Khan",
        "image": "https://i.scdn.co/image/ab67616d0000b2730bf17c0c9dc828e68794a66b",
        "duration": 247125,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/3ayMReTwLoo6jAg7adDqyz"
    },
    {
        "id": "3vLFA2nTU6usnRbYrmVo6f",
        "name": "Itna Na Mujhse Tu Pyar Badha",
        "album": "Chhaya",
        "artist": "Talat Mahmood, Lata Mangeshkar, Salil Chowdhury",
        "image": "https://i.scdn.co/image/ab67616d0000b2730ec64fd2f466c3799a63c900",
        "duration": 235333,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/3vLFA2nTU6usnRbYrmVo6f"
    },
    {
        "id": "64qn5oeo6Dcrur3dsu0gsJ",
        "name": "Koi Na",
        "album": "Koi Na",
        "artist": "Badshah, Uchana Amit, Hiten",
        "image": "https://i.scdn.co/image/ab67616d0000b2733bf39641499c19d29bc0df0c",
        "duration": 159000,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/64qn5oeo6Dcrur3dsu0gsJ"
    },
    {
        "id": "5I2wbDvSI98HLVB42YO9sU",
        "name": "Lagdi Lahore Di (From \"Street Dancer 3D\")",
        "album": "Lagdi Lahore Di (From \"Street Dancer 3D\")",
        "artist": "Guru Randhawa, Tulsi Kumar",
        "image": "https://i.scdn.co/image/ab67616d0000b27347478a4ab783457fe6766576",
        "duration": 215368,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/5I2wbDvSI98HLVB42YO9sU"
    },
    {
        "id": "5xWpxI216rbOSiAqjdn6gy",
        "name": "Lamborghini (From \"Jai Mummy Di\")",
        "album": "Lamborghini (From \"Jai Mummy Di\")",
        "artist": "Meet Bros., Neha Kakkar, Jassie Gill",
        "image": "https://i.scdn.co/image/ab67616d0000b273e22c786794d6374e0bebe350",
        "duration": 246635,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/5xWpxI216rbOSiAqjdn6gy"
    },
    {
        "id": "67E4z0PMJdO9ur4TZ6mWKs",
        "name": "Mile Hai Hum Tum",
        "album": "Mile Hai Hum Tum",
        "artist": "AKASH MEHTA, Vishrut Parikh, DIPAK NIMAJE",
        "image": "https://i.scdn.co/image/ab67616d0000b2734ad39097c0c9ca64908a6657",
        "duration": 197293,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/67E4z0PMJdO9ur4TZ6mWKs"
    },
    {
        "id": "5JeIhfMHRZzDcBVKiajU8I",
        "name": "Moment",
        "album": "Never Met A Me",
        "artist": "Teenear, Rick Ross",
        "image": "https://i.scdn.co/image/ab67616d0000b273b852d201d15c893895ca0573",
        "duration": 222141,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/5JeIhfMHRZzDcBVKiajU8I"
    },
    {
        "id": "1orM67pmkNc4alrZkWjYkV",
        "name": "Naach Meri Rani (Feat. Nora Fatehi)",
        "album": "Naach Meri Rani (Feat. Nora Fatehi)",
        "artist": "Guru Randhawa, Tanishk Bagchi, Nikhita Gandhi",
        "image": "https://i.scdn.co/image/ab67616d0000b273dda454f42377da49afb85551",
        "duration": 212692,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/1orM67pmkNc4alrZkWjYkV"
    },
    {
        "id": "1CM4rFDU9q4EoLy2K44qE6",
        "name": "Naah Goriye (From \"Bala\")",
        "album": "Naah Goriye (From \"Bala\")",
        "artist": "B Praak, Harrdy Sandhu, Swasti Mehul, Jaani",
        "image": "https://i.scdn.co/image/ab67616d0000b273663eaf611d42cdf2a76ea745",
        "duration": 184617,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/1CM4rFDU9q4EoLy2K44qE6"
    },
    {
        "id": "7JYzuz3FBHtlRk4xnvWDAg",
        "name": "Patola",
        "album": "Blackmail",
        "artist": "Guru Randhawa",
        "image": "https://i.scdn.co/image/ab67616d0000b273e35742b65cc5fe37d76e9ac4",
        "duration": 184410,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/7JYzuz3FBHtlRk4xnvWDAg"
    },
    {
        "id": "39ujbBjTwwqUFySaCYDMMT",
        "name": "Proper Patola",
        "album": "Namaste England (Original Motion Picture Soundtrack)",
        "artist": "Badshah, Diljit Dosanjh, Aastha Gill",
        "image": "https://i.scdn.co/image/ab67616d0000b273dd8f11e5b3c77cd2a9517ee0",
        "duration": 178604,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/39ujbBjTwwqUFySaCYDMMT"
    },
    {
        "id": "6fZ3OaJywyAGw4Lytc1nkv",
        "name": "Rimjhim Gire Saawan",
        "album": "Music Teacher",
        "artist": "Papon, Shreya Ghoshal, Rochak Kohli, R. D. Burman",
        "image": "https://i.scdn.co/image/ab67616d0000b273dc187a959b887b2c88672a0b",
        "duration": 263020,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/6fZ3OaJywyAGw4Lytc1nkv"
    },
    {
        "id": "5zCnGtCl5Ac5zlFHXaZmhy",
        "name": "Sajni (From \"Laapataa Ladies\")",
        "album": "Sajni (From \"Laapataa Ladies\")",
        "artist": "Ram Sampath, Arijit Singh, Prashant Pandey",
        "image": "https://i.scdn.co/image/ab67616d0000b273d5f4378b1ffc9119fdc7306d",
        "duration": 170044,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/5zCnGtCl5Ac5zlFHXaZmhy"
    },
    {
        "id": "7LHAKF7pBqHch8o6Yo0ad5",
        "name": "Suzume (feat. Toaka)",
        "album": "Suzume (feat. Toaka)",
        "artist": "RADWIMPS, Toaka",
        "image": "https://i.scdn.co/image/ab67616d0000b2735cde862db0ec9bb1e1566dd7",
        "duration": 236390,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/7LHAKF7pBqHch8o6Yo0ad5"
    },
    {
        "id": "555maXFEF9m0lE4UGRzCHk",
        "name": "Teka (with Peso Pluma)",
        "album": "Teka (with Peso Pluma)",
        "artist": "DJ Snake, Peso Pluma",
        "image": "https://i.scdn.co/image/ab67616d0000b27324861100b34630be0af122ce",
        "duration": 163809,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/555maXFEF9m0lE4UGRzCHk"
    },
    {
        "id": "0pPGUL7171TRGgI6wyP8wP",
        "name": "Tumhe Jo Maine Dekha",
        "album": "Main Hoon Na",
        "artist": "Abhijeet, Shreya Ghoshal",
        "image": "https://i.scdn.co/image/ab67616d0000b273e7fa423de639247fed12be4a",
        "duration": 341146,
        "platform": "spotify",
        "platformUrl": "https://open.spotify.com/track/0pPGUL7171TRGgI6wyP8wP"
    }
]

export const dummyData = {
    allTracks: sortArrayByKey(dummyTracks, 'name'),
    allPlaylists: sortArrayByKey(dummyPlaylists, 'name'), 
    youtubeTracks: sortArrayByKey(dummyTracks.filter(track => track.platform === 'youtube'), 'name'),
    spotifyTracks: sortArrayByKey(dummyTracks.filter(track => track.platform === 'spotify'), 'name'),
    youtubePlaylists: sortArrayByKey(dummyPlaylists.filter(playlist => playlist.platform === 'youtube'), 'name'),
    spotifyPlaylists: sortArrayByKey(dummyPlaylists.filter(playlist => playlist.platform === 'spotify'), 'name')
}
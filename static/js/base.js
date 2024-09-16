const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: false });

class QobuzDL {
    constructor() {
        this.notyf = new Notyf({
            position: {
                x: 'right',
                y: 'top',
              },
        });
        this.appReady = false;
        this.QobuzSecret = false;
        this.QobuzAppID = false;
        this.searchMode = "albums";
        this.BASE_URL = "https://www.qobuz.com/api.json/0.2/";
        this.readyApp();
        this.search_bar = document.querySelector("search-bar");
        this.search_icon = this.search_bar.querySelector("search-icon");
        this.search_input = this.search_bar.querySelector("input");
        this.SPINNER = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin" style="width: 20px; height: 20px;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`
        this.LOADING_SEARCH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin" style="width: 36px; height: 36px;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`
        this.NORMAL_SEARCH_ICON = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.59858 24.3796L4.59824 24.3793C3.29897 23.0811 2.26831 21.5397 1.56512 19.8431C0.861931 18.1466 0.5 16.3282 0.5 14.4918C0.5 12.6554 0.861931 10.8369 1.56512 9.1404C2.26831 7.44387 3.29897 5.90245 4.59824 4.60422L4.5987 4.60377C7.1132 2.0848 10.4942 0.619588 14.0522 0.507003C17.6102 0.394417 21.0772 1.64294 23.746 3.9979C26.4148 6.35286 28.0845 9.63686 28.4145 13.1801C28.7446 16.7234 27.7102 20.2592 25.5222 23.0662L25.2505 23.4148L25.5631 23.7272L35.1376 33.2989C35.3728 33.5439 35.5029 33.8712 35.5 34.2108C35.497 34.5517 35.3602 34.8779 35.119 35.119C34.8778 35.3602 34.5514 35.497 34.2103 35.5C33.8704 35.5029 33.5429 35.3728 33.2978 35.1375L23.7234 25.5659L23.411 25.2536L23.0626 25.5251C20.3752 27.6195 17.0145 28.6591 13.6136 28.4481C10.2126 28.2371 7.00629 26.7901 4.59858 24.3796ZM13.3714 3.16813C11.1338 3.38846 9.0206 4.26514 7.29148 5.67535V5.59465L6.43903 6.44178C5.37734 7.49684 4.53579 8.7522 3.96323 10.135C3.39078 11.5175 3.0986 13 3.10366 14.4963C3.10425 17.1289 4.01777 19.6798 5.68861 21.7146C7.35961 23.7496 9.68469 25.1424 12.2677 25.6557C14.8507 26.1691 17.5318 25.7712 19.8543 24.5299C22.1768 23.2886 23.9969 21.2807 25.0046 18.8481C26.0123 16.4156 26.1451 13.7091 25.3805 11.1896C24.6159 8.67013 23.0011 6.49368 20.8113 5.03104C18.6215 3.5684 15.9922 2.91005 13.3714 3.16813Z" fill="black" stroke="black"/></svg>`
        this.search_icon.innerHTML = this.LOADING_SEARCH_ICON;
        this.search_bar.classList.remove("bg-primary");
        this.search_bar.classList.add("bg-muted");
        this.search_input.classList.remove("bg-primary");
        this.search_input.classList.add("bg-muted");
        this.toggleAlbums = document.querySelector("[data-button='toggleAlbums']");
        this.toggleTracks = document.querySelector("[data-button='toggleTracks']");
        this.toggleAlbums.addEventListener("click", () => {
            if (this.searchMode === "tracks") {
                this.searchMode = "albums";
                this.toggleAlbums.classList.add("bg-gradient");
                this.toggleAlbums.classList.remove("bg-secondary"); 
                this.toggleTracks.classList.add("bg-secondary");
                this.toggleTracks.classList.remove("bg-gradient");
                this.toggleTracks.setAttribute("disabled", "");
                this.toggleAlbums.setAttribute("disabled", "");
                if (this.search_input.value) {
                    this.search(this.search_input.value)
                }
            }
        });
        this.toggleTracks.addEventListener("click", () => {
            if (this.searchMode === "albums") {
                this.searchMode = "tracks";
                this.toggleTracks.classList.add("bg-gradient");
                this.toggleTracks.classList.remove("bg-secondary");
                this.toggleAlbums.classList.add("bg-secondary");
                this.toggleAlbums.classList.remove("bg-gradient");
                this.toggleTracks.setAttribute("disabled", "");
                this.toggleAlbums.setAttribute("disabled", "");
                if (this.search_input.value) {
                    this.search(this.search_input.value)
                }
            }
        });
        this.search_bar.addEventListener("keydown", (event) => {
            if ((event.key === 'Enter') && this.appReady) {
                this.search(this.search_bar.querySelector("input").value);
            }
        })
        this.downloadMenu = document.querySelector("[data-content='downloadMenu']");
        this.downloadMenuButton = document.querySelector("[data-button='downloadMenu']");
        this.downloadMenuButton.addEventListener("click", () => {
            this.animateMenuIn(this.downloadMenu);
        });
        this.downloadMenuCloseButton = this.downloadMenu.querySelector("[data-button='closeDownloadMenu']");
        this.downloadMenuCloseButton.addEventListener("click", () => {
            this.animateMenuOut(this.downloadMenu);
        });
        this.seeMoreButton = `
            <button class="w-full bg-primary p-2 rounded-full flex items-center justify-center">
                See More
            </button>
        `
        document.querySelector("[data-button='discord']").addEventListener("click", () => {
            window.location = "https://discord.gg/mWQ6bCfkfA";
        });
        document.querySelector("[data-button='github']").addEventListener("click", () => {
            window.location = "https://github.com/QobuzDL/Qobuz-DL-Browser";
        })

        document.querySelector(".downloadManagePane").addEventListener("click", () => {
            this.downloadMenuCloseButton.click();
        })

        document.onkeydown = (e) => {
            if (e.key === "Escape") {
                this.downloadMenuCloseButton.click();
            }
        }
    }

    async checkToken(token) {
        let url = new URL(this.BASE_URL + 'user/lastUpdate'); 
        const headers = new Headers();
        headers.append('X-App-Id', this.QobuzAppID);
        headers.append("X-User-Auth-Token", token);
        const response = await fetch(url, {
            method: "GET",
            headers: headers
        })
        if (response.ok) {
            return true;
        } else {
            return false;
        };
    }

    async readyApp() {
        const result = await this.testCorsProxy();
        if (!result) {
            return;
        }
        const results = await this.getAppIdAndSecrets();
        this.TOKEN = await this.getToken(results.appId);
        if (this.TOKEN) {
            const secret = await this.getValidSecret(results.secrets, results.appId);
            this.onAppReady(secret, results.appId);
        };
    }
    
    async search(query) {
        try {
            if (query.trim()) {
                const type = this.searchMode;
                this.search_icon.innerHTML = this.LOADING_SEARCH_ICON;
                const searchResults = await this.searchQobuz(query);
                this.toggleTracks.removeAttribute("disabled");
                this.toggleAlbums.removeAttribute("disabled");
                this.renderSearchResults(searchResults[type].items, type);
                this.search_icon.innerHTML = this.NORMAL_SEARCH_ICON;
            }
        } catch (e) {
            this.showError(e);
        }
    }

    async onAppReady(secret, appID) {
        this.toggleTracks.removeAttribute("disabled");
        this.toggleAlbums.removeAttribute("disabled");
        this.appReady = true;
        this.search_icon.innerHTML = this.NORMAL_SEARCH_ICON;
        this.search_bar.classList.add("bg-primary");
        this.search_bar.classList.remove("bg-muted");
        this.search_input.classList.add("bg-primary");
        this.search_input.classList.remove("bg-muted");
        this.QobuzSecret = secret;
        this.QobuzAppID = appID;
    }

    async loadFFmpeg() {
        if (!ffmpeg.isLoaded()) {
            await ffmpeg.load();
        }
    };

    animateMenuIn(menu) {
        document.body.classList.add("overflow-hidden");
        if (window.matchMedia('(min-width: 768px)').matches) {
            menu.style.left = "-650px";
            menu.style.opacity = "0";
            menu.classList.remove("hidden");
            setTimeout(() => {
                menu.style.opacity = "1";
                setTimeout(() => {menu.style.left = "0px";}, 25);
            }, 25)
        } else {
            menu.style.setProperty('--animate-duration', '.75s');
            menu.classList.remove("hidden");
            menu.classList.add("animate__bounceIn");
            setTimeout(() => {
                menu.classList.remove("animate__bounceIn")
            }, 700);
        }
        const blackFade = document.querySelector("[data-mobile='mobileBlackScreen']");
        blackFade.style.opacity = "0";
        blackFade.classList.remove("hidden");
        setTimeout(() => {blackFade.style.opacity = "1"}, 10);
    }

    animateMenuOut(menu) {
        document.body.classList.remove("overflow-hidden");
        if (window.matchMedia('(min-width: 768px)').matches) {
            menu.style.opacity = "1";
            setTimeout(() => {
                menu.style.left = "-650px";
                setTimeout(() => {
                    menu.style.opacity = "0";
                    setTimeout(() => {menu.classList.add("hidden");menu.style.left = "0px";menu.style.opacity = "1";}, 100)
                }, 25);
            }, 25);
        } else {
            menu.style.setProperty('--animate-duration', '.75s');
            menu.classList.add("animate__bounceOut");
            setTimeout(() => {menu.classList.add("hidden");menu.classList.remove("animate__bounceOut");}, 500);
        }
        const blackFade = document.querySelector("[data-mobile='mobileBlackScreen']");
        blackFade.style.opacity = "0";
        setTimeout(() => {blackFade.classList.add("hidden");}, 200);
    }

    async testCorsProxy () {
        try {
            const response = await fetch(`https://corsproxy.io/?https://httpbin.org/status/200`);
            if ((response.ok) && ((await response.text()) === "")) {
                return true;
            }
        } catch {}
        const parser = new DOMParser();
        const blockedScreen =  parser.parseFromString(`
        <div class="bg-red-500 absolute w-screen h-screen left-0 right-0 top-0 flex items-center justify-center text-white text-center flex-col p-2 gap-2">
            <h1 class="text-3xl">Uh oh! Looks like your ISP has blocked access to <a class="underline" href="https://corsproxy.io" target="_blank">corsproxy.io</a>!</h1>
            <p class="text-lg">Without access to <a class="underline" href="https://corsproxy.io" target="_blank">corsproxy.io</a>, this website cannot function. To enable access, either use a VPN or change your DNS servers. More info on how to do this can be found <a class="underline" href="https://www.pcmag.com/how-to/how-and-why-to-change-your-dns-server" target="_blank">here</a>.</p>
        </div>
        `, "text/html").body.firstChild;
        document.body.appendChild(blockedScreen);
        return false;
    }

    renderAlbumTrack(track) {
        const parser = new DOMParser();
        return parser.parseFromString(`
            <div class="w-full flex items-center justify-start transition-all p-1 text-nowrap hover:bg-zinc-900/30 px-3">
                <div class="flex flex-col justify-center items-start w-full overflow-hidden">
                    <p class="font-medium truncate w-full">${this.formatTitle(track)}</p>
                    <p class="text-muted text-sm truncate w-full">${track.artists.length > 0 ? track.artists.map(artist => artist.name).join(", ") : "Various Artists"}</p>
                </div>
                <button data-button="downloadTrack" class="text-white bg-black py-2 px-4 font-medium rounded-[8px] text-lg flex gap-4 items-center w-fit">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12C18.7348 12 18.4804 12.1054 18.2929 12.2929C18.1054 12.4804 18 12.7348 18 13V17C18 17.2652 17.8946 17.5196 17.7071 17.7071C17.5196 17.8946 17.2652 18 17 18H3C2.73478 18 2.48043 17.8946 2.29289 17.7071C2.10536 17.5196 2 17.2652 2 17V13C2 12.7348 1.89464 12.4804 1.70711 12.2929C1.51957 12.1054 1.26522 12 1 12C0.734784 12 0.48043 12.1054 0.292893 12.2929C0.105357 12.4804 0 12.7348 0 13V17C0 17.7956 0.316071 18.5587 0.87868 19.1213C1.44129 19.6839 2.20435 20 3 20H17C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7956 20 17V13C20 12.7348 19.8946 12.4804 19.7071 12.2929C19.5196 12.1054 19.2652 12 19 12ZM9.29 13.71C9.3851 13.801 9.49725 13.8724 9.62 13.92C9.7397 13.9729 9.86913 14.0002 10 14.0002C10.1309 14.0002 10.2603 13.9729 10.38 13.92C10.5028 13.8724 10.6149 13.801 10.71 13.71L14.71 9.71C14.8983 9.5217 15.0041 9.2663 15.0041 9C15.0041 8.7337 14.8983 8.4783 14.71 8.29C14.5217 8.1017 14.2663 7.99591 14 7.99591C13.7337 7.99591 13.4783 8.1017 13.29 8.29L11 10.59V1C11 0.734784 10.8946 0.48043 10.7071 0.292893C10.5196 0.105357 10.2652 0 10 0C9.73478 0 9.48043 0.105357 9.29289 0.292893C9.10536 0.48043 9 0.734784 9 1V10.59L6.71 8.29C6.61676 8.19676 6.50607 8.1228 6.38425 8.07234C6.26243 8.02188 6.13186 7.99591 6 7.99591C5.86814 7.99591 5.73757 8.02188 5.61575 8.07234C5.49393 8.1228 5.38324 8.19676 5.29 8.29C5.19676 8.38324 5.1228 8.49393 5.07234 8.61575C5.02188 8.73757 4.99591 8.86814 4.99591 9C4.99591 9.13186 5.02188 9.26243 5.07234 9.38425C5.1228 9.50607 5.19676 9.61676 5.29 9.71L9.29 13.71Z" fill="white"/>
                    </svg>
                </button>
            </div>
        `, "text/html").body.firstChild;
    }

    renderSearchResult(result) {
        const parser = new DOMParser();
        return parser.parseFromString(`
            <div data-id="${result.id}" class="w-full bg-tertiary text-white rounded-[24px] py-3 overflow-hidden flex flex-col">
                <div class="flex items-stretch gap-2 w-full my-2 ml-5">
                    <img src="${result.image.small}" data-info="album-art" class="h-32 w-32 md:h-44 md:w-44">
                    <div class="flex flex-col overflow-hidden md:w-full mr-5 md:mr-0 pr-2 md:pr-0">
                        <h2 data-info="album" class="text-nowrap text-xl md:text-2xl font-medium truncate">${this.formatTitle(result)}</h2>
                        <div class="flex gap-1 md:gap-2 text-muted text-lg items-center md:mb-3 mb-1">
                            <p data-info="artist" class="text-nowrap md:text-base text-xs">${result.artists.length > 0 ? result.artists.map(artist => artist.name).join(", ") : "Various Artists"}</p>
                            <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.799988 2.99999C0.799988 3.58346 1.03177 4.14304 1.44435 4.55562C1.85693 4.9682 2.41651 5.19999 2.99999 5.19999C3.58346 5.19999 4.14304 4.9682 4.55562 4.55562C4.9682 4.14304 5.19999 3.58346 5.19999 2.99999C5.19999 2.41651 4.9682 1.85693 4.55562 1.44435C4.14304 1.03177 3.58346 0.799988 2.99999 0.799988C2.41651 0.799988 1.85693 1.03177 1.44435 1.44435C1.03177 1.85693 0.799988 2.41651 0.799988 2.99999Z" fill="#BBBBBB"/></svg>
                            <p data-info="year" class="text-nowrap text-xs md:text-base">${new Date(result.release_date_original).getFullYear()}</p>
                        </div>
                        <div class="flex gap-2">
                            <button data-button='download-album' class="text-white bg-black py-2 px-4 font-medium rounded-[8px] text-lg flex gap-4 items-center w-fit">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 12C18.7348 12 18.4804 12.1054 18.2929 12.2929C18.1054 12.4804 18 12.7348 18 13V17C18 17.2652 17.8946 17.5196 17.7071 17.7071C17.5196 17.8946 17.2652 18 17 18H3C2.73478 18 2.48043 17.8946 2.29289 17.7071C2.10536 17.5196 2 17.2652 2 17V13C2 12.7348 1.89464 12.4804 1.70711 12.2929C1.51957 12.1054 1.26522 12 1 12C0.734784 12 0.48043 12.1054 0.292893 12.2929C0.105357 12.4804 0 12.7348 0 13V17C0 17.7956 0.316071 18.5587 0.87868 19.1213C1.44129 19.6839 2.20435 20 3 20H17C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7956 20 17V13C20 12.7348 19.8946 12.4804 19.7071 12.2929C19.5196 12.1054 19.2652 12 19 12ZM9.29 13.71C9.3851 13.801 9.49725 13.8724 9.62 13.92C9.7397 13.9729 9.86913 14.0002 10 14.0002C10.1309 14.0002 10.2603 13.9729 10.38 13.92C10.5028 13.8724 10.6149 13.801 10.71 13.71L14.71 9.71C14.8983 9.5217 15.0041 9.2663 15.0041 9C15.0041 8.7337 14.8983 8.4783 14.71 8.29C14.5217 8.1017 14.2663 7.99591 14 7.99591C13.7337 7.99591 13.4783 8.1017 13.29 8.29L11 10.59V1C11 0.734784 10.8946 0.48043 10.7071 0.292893C10.5196 0.105357 10.2652 0 10 0C9.73478 0 9.48043 0.105357 9.29289 0.292893C9.10536 0.48043 9 0.734784 9 1V10.59L6.71 8.29C6.61676 8.19676 6.50607 8.1228 6.38425 8.07234C6.26243 8.02188 6.13186 7.99591 6 7.99591C5.86814 7.99591 5.73757 8.02188 5.61575 8.07234C5.49393 8.1228 5.38324 8.19676 5.29 8.29C5.19676 8.38324 5.1228 8.49393 5.07234 8.61575C5.02188 8.73757 4.99591 8.86814 4.99591 9C4.99591 9.13186 5.02188 9.26243 5.07234 9.38425C5.1228 9.50607 5.19676 9.61676 5.29 9.71L9.29 13.71Z" fill="white"/>
                                </svg>
                                <p class="hidden md:inline-flex">Download</p>
                            </button>
                            <button device="sm" data-button="show-tracklist" class="text-white bg-black py-2 px-4 font-medium rounded-[8px] text-lg flex gap-4 items-center w-fit inline-flex md:hidden">
                                <svg-wrap>
                                    <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1H14M1 7H14M1 13H14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </svg-wrap>
                            </button>
                        </div>
                        <div class="flex items-end flex-1 gap-2">
                            <div>
                                <p class="text-xs md:text-base">Avaliable in:</p>
                                <div class="flex gap-1 md:gap-2 items-center">
                                    <p data-info="bit-depth" class="text-nowrap font-medium text-xs md:text-base ${result.hires ? "text-yellow-600" : "text-sky-400"}">${result.maximum_bit_depth}-bit</p>
                                    <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.799988 2.99999C0.799988 3.58346 1.03177 4.14304 1.44435 4.55562C1.85693 4.9682 2.41651 5.19999 2.99999 5.19999C3.58346 5.19999 4.14304 4.9682 4.55562 4.55562C4.9682 4.14304 5.19999 3.58346 5.19999 2.99999C5.19999 2.41651 4.9682 1.85693 4.55562 1.44435C4.14304 1.03177 3.58346 0.799988 2.99999 0.799988C2.41651 0.799988 1.85693 1.03177 1.44435 1.44435C1.03177 1.85693 0.799988 2.41651 0.799988 2.99999Z" fill="${result.hires ? "#ca8a04" : "#38bdf8"}"/></svg>
                                    <p data-info="sample-rate" class="text-nowrap font-medium text-xs md:text-base ${result.hires ? "text-yellow-600" : "text-sky-400"}">${result.maximum_sampling_rate}kHz</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end items-start hidden md:inline-flex mr-5 px-2">
                        <button device="md" data-button="show-tracklist" class="text-white bg-black py-2 px-4 font-medium rounded-[8px] text-lg flex gap-4 items-center w-fit">
                            <svg-wrap>
                                <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1H14M1 7H14M1 13H14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </svg-wrap>
                            <p class="text-nowrap">Show Tracklist</p>
                        </button>
                    </div>
                </div>
                <div data-tracks="unloaded" class="transition-all ease-in-out delay-150 overflow-hidden" style="max-height: 0px;">
                    <div class="px-2">
                        <div class="w-full h-0.5 bg-muted opacity-40 rounded-full z-[0]"></div>
                    </div>
                </div>
            </div>
        `, "text/html").body.firstChild;
    }

    createDownloadJob(result, type) {
        if (!result.artists) {
            result.artists = [result.album.artist]
        };
        const downloadsContainer = document.querySelector("[data-content='downloadMenuDownloads']")
        downloadsContainer.querySelector("[data-no-content='downloadMenuDownloads']").classList.add("hidden");
        const parser = new DOMParser();
        const element = parser.parseFromString(`
                <div data-id="${result.id}" class="relative w-full bg-tertiary p-3 overflow-hidden rounded-[24px] flex flex-col justify-center gap-2 flex-shrink-0" data-state="incomplete">
                    <div class="absolute w-full h-full flex items-start justify-end py-2 px-5">
                        <button data-button="removeDownloadJob" class="hidden z-[100]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    </div>
                    <div class="w-full overflow-hidden flex pt-2 items-start gap-2 px-2 z-[51]">
                        <img src="${type.toLowerCase() === "track" ? result.album.image.small : result.image.small}" alt="" class="w-[100px] h-[100px]">
                        <div class="flex flex-col w-full overflow-hidden">
                            <h2 class="text-nowrap text-xl md:text-xl font-medium truncate pr-3">${this.formatTitle(result)}</h2>
                            <h3 class="text-nowrap md:text-base text-xs text-muted truncate">${result.artists.length > 0 ? result.artists.map(artist => artist.name).join(", ") : "Various Artists"}</h3>
                        </div>
                    </div>
                    <div class="w-full flex flex-col items-center justify-center px-2 gap-1 z-[51]">
                        <progress-bar class="w-full bg-zinc-500 h-1.5 rounded-full overflow-hidden">
                            <div class="h-full transition-all rounded-md" style="width: 50%;"></div>
                        </progress-bar>
                        <p class="text-white text-center pt-1" data-status>Downloading...</p>
                    </div>
                </div>
            `, "text/html").body.firstChild;
        downloadsContainer.appendChild(element);
        return {
            "base": element,
            "progress-bar": element.querySelector("progress-bar div"),
            "status": element.querySelector("[data-status]"),
            "close-button": element.querySelector("[data-button='removeDownloadJob']")
        }
    }

    handleTrackDownloadButton(button, track) {
        const oldSVG = button.querySelector("svg");
        button.addEventListener("click", async () => {
            try {
                const parser = new DOMParser();
                const spinner = parser.parseFromString(this.SPINNER, "text/html").body.firstChild;
                spinner.style.height = "24px";
                spinner.style.width = "24px";
                button.setAttribute("disabled", "");
                button.querySelector("svg").replaceWith(spinner);
                const downloadsContainer = document.querySelector("[data-content='downloadMenuDownloads']")
                const controller = new AbortController();
                const signal = controller.signal;
                let downloadBlobLink = "";
                const notification = this.notyf.success({
                    message: `Added "${this.formatTitle(track)}" to the download queue.`,
                    duration: 3000,
                    dismissible: true,
                    ripple: true,
                  });
                notification.on("click", () => {
                    this.notyf.dismissAll()
                    this.animateMenuIn(this.downloadMenu);
                });
                const downloadJob = this.createDownloadJob(track, "track");
                downloadJob["progress-bar"].style.width = "0%";
                downloadJob["progress-bar"].classList.add("bg-primary");
                downloadJob.status.textContent = `Waiting in queue...`;
                downloadJob["close-button"].classList.remove("hidden");
                downloadJob["close-button"].addEventListener("click", () => {
                    controller.abort();
                    downloadJob.base.remove();
                    if (document.querySelector("[data-content='downloadMenuDownloads']").children.length === 1) {
                        document.querySelector("[data-no-content='downloadMenuDownloads']").classList.remove("hidden");
                    };
                    URL.revokeObjectURL(downloadBlobLink);
                    button.querySelector("svg").replaceWith(oldSVG);
                    button.removeAttribute("disabled");
                })
                while (true) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    if ((Array.from(downloadsContainer.querySelectorAll("[data-state='incomplete']")).indexOf(downloadJob.base) === 0)) {
                        break
                    };
                };
                downloadJob.status.textContent = `Loading FFMPEG...`
                await this.loadFFmpeg();
                downloadJob.status.textContent = `Fetching file size...`
                const downloadLink = await this.downloadTrack(track);
                let response = await fetch(downloadLink, {
                    method: 'HEAD'
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch file size: ${response.statusText}`);
                }
                const fileSize = parseInt(response.headers.get('content-length'), 10);
                if (!fileSize) {
                    throw new Error('Unable to retrieve file size');
                }
                const albumArtURL = track.album.image.large.slice(0, -7) + "org.jpg";
                downloadJob.status.textContent = "Fetching cover art...";
                const albumArt = new Uint8Array(await (await fetch(albumArtURL)).arrayBuffer());
                track.album.image.org = albumArt;
                downloadJob.status.textContent = `Downloading... (0 Bytes / ${this.formatBytes(fileSize)})`
                let downloadedBytes = 0;
                let chunks = [];
                response = await fetch(downloadLink, { signal });
                if (!response.ok) {
                    throw new Error(`Failed to download file: ${response.statusText}`);
                }
                const reader = response.body.getReader();
                const contentLength = response.headers.get('content-length');
                const total = parseInt(contentLength, 10);
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    downloadedBytes += value.length;
                    chunks.push(value);
                    const percentComplete = (downloadedBytes / total) * 100;
                    downloadJob.status.textContent = `Downloading... (${this.formatBytes(downloadedBytes)} / ${this.formatBytes(fileSize)})`
                    downloadJob["progress-bar"].style.width = percentComplete.toFixed(2) + '%';
                }
                let downloadedContent = new Uint8Array(downloadedBytes);
                let position = 0;
                for (let chunk of chunks) {
                    downloadedContent.set(chunk, position);
                    position += chunk.length;
                };
                downloadJob.status.textContent = `Applying metadata...`
                const outputFile = await this.applyMetadata(new Uint8Array(downloadedContent), track)
                downloadBlobLink = URL.createObjectURL(new Blob([outputFile]));
                downloadJob.status.innerHTML = `<a class="hover:underline" href="${downloadBlobLink}">Track not downloaded to your device? Click here to download it again.</a>`
                downloadJob.status.querySelector("a").download = (track.artists.length > 0 ? track.artists.map(artist => artist.name).join(", ") : "Various Artists") + " - " + this.formatTitle(track) + ".flac";
                downloadJob["progress-bar"].style.width = '100%';
                button.querySelector("svg").replaceWith(oldSVG);
                button.removeAttribute("disabled");
                downloadJob.status.querySelector("a").click();
                downloadJob.base.setAttribute("data-state", "complete");
            } catch (e) {
                if (!(e.name === 'AbortError')) {
                    this.showError(e);
                    button.querySelector("svg").replaceWith(oldSVG);
                    button.removeAttribute("disabled");
                }
            }
        })
    }

    renderSingleTrack(result) {
        const parser = new DOMParser();
        return parser.parseFromString(`
            <div data-id="${result.id}" class="w-full bg-tertiary text-white rounded-[24px] py-3 overflow-hidden flex flex-col">
                <div class="flex items-stretch gap-4 w-full my-2 ml-5">
                    <img src="${result.album.image.small}" data-info="album-art" class="h-32 w-32 md:h-44 md:w-44">
                    <div class="flex flex-col overflow-hidden md:w-full mr-5 md:mr-0 pr-2 md:pr-0">
                        <h2 data-info="album" class="text-nowrap text-xl md:text-2xl font-medium truncate">${result.title}</h2>
                        <div class="flex gap-1 md:gap-2 text-muted text-lg items-center md:mb-3 mb-1">
                            <p data-info="artist" class="text-nowrap md:text-base text-xs">${result.album.artist ? result.album.artist.name : "Various Artists"}</p>
                            <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.799988 2.99999C0.799988 3.58346 1.03177 4.14304 1.44435 4.55562C1.85693 4.9682 2.41651 5.19999 2.99999 5.19999C3.58346 5.19999 4.14304 4.9682 4.55562 4.55562C4.9682 4.14304 5.19999 3.58346 5.19999 2.99999C5.19999 2.41651 4.9682 1.85693 4.55562 1.44435C4.14304 1.03177 3.58346 0.799988 2.99999 0.799988C2.41651 0.799988 1.85693 1.03177 1.44435 1.44435C1.03177 1.85693 0.799988 2.41651 0.799988 2.99999Z" fill="#BBBBBB"/></svg>
                            <p data-info="year" class="text-nowrap text-xs md:text-base">${new Date(result.release_date_original).getFullYear()}</p>
                        </div>
                        <div class="flex gap-2">
                            <button data-button='download-album' class="text-white bg-black py-2 px-4 font-medium rounded-[8px] text-lg flex gap-4 items-center w-fit">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 12C18.7348 12 18.4804 12.1054 18.2929 12.2929C18.1054 12.4804 18 12.7348 18 13V17C18 17.2652 17.8946 17.5196 17.7071 17.7071C17.5196 17.8946 17.2652 18 17 18H3C2.73478 18 2.48043 17.8946 2.29289 17.7071C2.10536 17.5196 2 17.2652 2 17V13C2 12.7348 1.89464 12.4804 1.70711 12.2929C1.51957 12.1054 1.26522 12 1 12C0.734784 12 0.48043 12.1054 0.292893 12.2929C0.105357 12.4804 0 12.7348 0 13V17C0 17.7956 0.316071 18.5587 0.87868 19.1213C1.44129 19.6839 2.20435 20 3 20H17C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7956 20 17V13C20 12.7348 19.8946 12.4804 19.7071 12.2929C19.5196 12.1054 19.2652 12 19 12ZM9.29 13.71C9.3851 13.801 9.49725 13.8724 9.62 13.92C9.7397 13.9729 9.86913 14.0002 10 14.0002C10.1309 14.0002 10.2603 13.9729 10.38 13.92C10.5028 13.8724 10.6149 13.801 10.71 13.71L14.71 9.71C14.8983 9.5217 15.0041 9.2663 15.0041 9C15.0041 8.7337 14.8983 8.4783 14.71 8.29C14.5217 8.1017 14.2663 7.99591 14 7.99591C13.7337 7.99591 13.4783 8.1017 13.29 8.29L11 10.59V1C11 0.734784 10.8946 0.48043 10.7071 0.292893C10.5196 0.105357 10.2652 0 10 0C9.73478 0 9.48043 0.105357 9.29289 0.292893C9.10536 0.48043 9 0.734784 9 1V10.59L6.71 8.29C6.61676 8.19676 6.50607 8.1228 6.38425 8.07234C6.26243 8.02188 6.13186 7.99591 6 7.99591C5.86814 7.99591 5.73757 8.02188 5.61575 8.07234C5.49393 8.1228 5.38324 8.19676 5.29 8.29C5.19676 8.38324 5.1228 8.49393 5.07234 8.61575C5.02188 8.73757 4.99591 8.86814 4.99591 9C4.99591 9.13186 5.02188 9.26243 5.07234 9.38425C5.1228 9.50607 5.19676 9.61676 5.29 9.71L9.29 13.71Z" fill="white"/>
                                </svg>
                                <p class="hidden md:inline-flex">Download</p>
                            </button>
                        </div>
                        <div class="flex items-end flex-1 gap-2">
                            <div>
                                <p class="text-xs md:text-base">Avaliable in:</p>
                                <div class="flex gap-1 md:gap-2 items-center">
                                    <p data-info="bit-depth" class="text-nowrap font-medium text-xs md:text-base ${result.hires ? "text-yellow-600" : "text-sky-400"}">${result.maximum_bit_depth}-bit</p>
                                    <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.799988 2.99999C0.799988 3.58346 1.03177 4.14304 1.44435 4.55562C1.85693 4.9682 2.41651 5.19999 2.99999 5.19999C3.58346 5.19999 4.14304 4.9682 4.55562 4.55562C4.9682 4.14304 5.19999 3.58346 5.19999 2.99999C5.19999 2.41651 4.9682 1.85693 4.55562 1.44435C4.14304 1.03177 3.58346 0.799988 2.99999 0.799988C2.41651 0.799988 1.85693 1.03177 1.44435 1.44435C1.03177 1.85693 0.799988 2.41651 0.799988 2.99999Z" fill="${result.hires ? "#ca8a04" : "#38bdf8"}"/></svg>
                                    <p data-info="sample-rate" class="text-nowrap font-medium text-xs md:text-base ${result.hires ? "text-yellow-600" : "text-sky-400"}">${result.maximum_sampling_rate}kHz</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end items-start hidden md:inline-flex mr-5 px-2">
                    </div>
                </div>
                <div data-tracks="unloaded" class="transition-all ease-in-out delay-150 overflow-hidden" style="max-height: 0px;">
                    <div class="px-2">
                        <div class="w-full h-0.5 bg-muted opacity-40 rounded-full z-[0]"></div>
                    </div>
                </div>
            </div>
            `, "text/html").body.firstChild;
    }

    renderSearchResults(results, type, extend=false, originalQuery=this.search_input.value) {
        const contentFrame = document.querySelector("[data-content='releaseList']");
        if (!extend) {
            contentFrame.innerHTML = "";
        };
        if (type === "albums") {
            results.map((result) => {
                const renderedResult = this.renderSearchResult(result)
                contentFrame.appendChild(renderedResult);
                const tracklistButtons = Array.from(renderedResult.querySelectorAll("[data-button='show-tracklist']"));
                tracklistButtons.map((tracklistButton) => {
                    tracklistButton.addEventListener("click", async (event) => {
                        const appendTracksTo = renderedResult.querySelector("[data-tracks='unloaded']");
                        if (appendTracksTo) {
                            appendTracksTo.setAttribute("data-tracks", "loaded");
                            const tracklistSVG = tracklistButton.querySelector("svg-wrap").innerHTML;
                            tracklistButton.querySelector("svg-wrap").innerHTML = this.SPINNER;
                            let albumInfo = await this.getAlbumInfo(result.id);
                            albumInfo.image.small = result.image.small;
                            tracklistButton.querySelector("svg-wrap").innerHTML = tracklistSVG;
                            albumInfo.tracks.items.map((track, trackNumber) => {
                                track.artists = albumInfo.artists;
                                track.album = albumInfo;
                                track.trackNumber = trackNumber+1;
                                const trackElement = this.renderAlbumTrack(track);
                                appendTracksTo.appendChild(trackElement);
                                const downloadTrackButton = trackElement.querySelector("[data-button='downloadTrack']");
                                this.handleTrackDownloadButton(downloadTrackButton, track);
                            })
                        }
                        const collapsible = renderedResult.querySelector("[data-tracks]");
                        if (collapsible.style.maxHeight === "0px") {
                            if (tracklistButton.getAttribute("device") === "md") {
                                setTimeout(() => {tracklistButton.querySelector("p").textContent = "Hide Tracklist"}, 150)
                            }
                            collapsible.style.maxHeight = collapsible.scrollHeight;
                        } else {
                            if (tracklistButton.getAttribute("device") === "md") {
                                setTimeout(() => {tracklistButton.querySelector("p").textContent = "Show Tracklist"}, 150)
                            }
                            collapsible.style.maxHeight = "0px";
                        }
                    })
                })
                const downloadAlbumButton = renderedResult.querySelector("[data-button='download-album']");
                const oldSVG = downloadAlbumButton.querySelector("svg");
                downloadAlbumButton.addEventListener("click", async () => {
                    try {
                        const parser = new DOMParser();
                        const spinner = parser.parseFromString(this.SPINNER, "text/html").body.firstChild;
                        spinner.style.height = "24px";
                        spinner.style.width = "24px";
                        downloadAlbumButton.setAttribute("disabled", "");
                        downloadAlbumButton.querySelector("svg").replaceWith(spinner)
                        let downloadURLs = [];
                        let fileSizes = [];
                        let totalAlbumBytes = 0;
                        let downloadedBytes = 0;
                        let tracks = [];
                        let downloadBlobLink = "";
                        let downloaded = false;
                        const downloadsContainer = document.querySelector("[data-content='downloadMenuDownloads']")
                        const controller = new AbortController();
                        const signal = controller.signal;
                        const notification = this.notyf.success({
                            message: `Added "${(result.artists.length > 0 ? result.artists.map(artist => artist.name).join(", ") : "Various Artists") + " - " + result.title}" to the download queue.`,
                            duration: 3000,
                            dismissible: true,
                            ripple: true,
                        });
                        notification.on("click", () => {
                            this.notyf.dismissAll()
                            this.animateMenuIn(this.downloadMenu);
                        });
                        const downloadJob = this.createDownloadJob(result, "album");
                        downloadJob["progress-bar"].style.width = "0%";
                        downloadJob["progress-bar"].classList.add("bg-amber-500");
                        downloadJob.status.textContent = `Waiting in queue...`;
                        downloadJob["close-button"].classList.remove("hidden");
                        downloadJob["close-button"].addEventListener("click", () => {
                            controller.abort();
                            downloadJob.base.remove();
                            if (document.querySelector("[data-content='downloadMenuDownloads']").children.length === 1) {
                                document.querySelector("[data-no-content='downloadMenuDownloads']").classList.remove("hidden");
                            };
                            if (!downloaded) {
                                downloadAlbumButton.removeAttribute("disabled");
                                downloadAlbumButton.querySelector("svg").replaceWith(oldSVG);
                            };
                            URL.revokeObjectURL(downloadBlobLink);
                        })
                        while (true) {
                            await new Promise(resolve => setTimeout(resolve, 200));
                            if ((Array.from(downloadsContainer.querySelectorAll("[data-state='incomplete']")).indexOf(downloadJob.base) === 0)) {
                                break
                            };
                        };
                        downloadJob.status.textContent = `Fetching album info...`;
                        const album = await this.getAlbumInfo(result.id)
                        downloadJob.status.textContent = `Fetching file sizes...`;
                        for (const [index, track] of album.tracks.items.entries()) {
                            const url = await this.downloadTrack(track);
                            downloadURLs.push(url);
                            const response = await fetch(url, { method: "HEAD", signal: signal });
                            if (!response.ok) {
                                throw new Error(`Failed to fetch file size: ${response.statusText}`);
                            }
                            const fileSize = parseInt(response.headers.get('content-length'), 10);
                            fileSizes.push(fileSize)
                            if (!fileSize) {
                                throw new Error(`Unable to retrieve file size. Content-Length returned ${response.headers.get('content-length')}`);
                            }
                            totalAlbumBytes += fileSize
                            downloadJob["progress-bar"].style.width = `${100 * (index/(album.tracks.items.length-1))}%`;
                        }
                        downloadJob["progress-bar"].classList.remove("bg-amber-500");
                        downloadJob["progress-bar"].classList.add("bg-primary");
                        downloadJob["progress-bar"].style.width = "0";
                        downloadJob["progress-bar"].classList.remove("transition-all");
                        const albumArtURL = album.image.large.slice(0, -7) + "org.jpg";
                        downloadJob.status.textContent = "Fetching cover art...";
                        const albumArt = new Uint8Array(await (await fetch(albumArtURL)).arrayBuffer());
                        album.image.org = albumArt;
                        for (const [index, track] of album.tracks.items.entries()) {
                            track.artists = album.artists;
                            track.album = album;
                            track.trackNumber = index+1;
                            const response = await fetch(downloadURLs[index], { signal });
                            if (!response.ok) {
                                throw new Error(`Failed to download file: ${response.statusText}`);
                            }
                            let chunks = [];
                            const reader = response.body.getReader();
                            while (true) {
                                const { done, value } = await reader.read();
                                if (done) break;
                                downloadedBytes += value.length;
                                chunks.push(value);
                                const percentComplete = (downloadedBytes / totalAlbumBytes) * 100;
                                downloadJob.status.textContent = `Downloading "${this.formatTitle(track)}"... (${this.formatBytes(downloadedBytes)} / ${this.formatBytes(totalAlbumBytes)})`
                                downloadJob["progress-bar"].classList.add("transition-all");
                                downloadJob["progress-bar"].style.width = percentComplete.toFixed(2) + '%';
                            };
                            let downloadedContent = new Uint8Array(fileSizes[index]);
                            let position = 0;
                            for (let chunk of chunks) {
                                downloadedContent.set(chunk, position);
                                position += chunk.length;
                            };
                            downloadJob.status.textContent = `Applying Metadata to "${this.formatTitle(track)}"... (${this.formatBytes(downloadedBytes)} / ${this.formatBytes(totalAlbumBytes)})`;
                            const appliedMetadata = await this.applyMetadata(downloadedContent, track)
                            tracks.push(appliedMetadata);
                        };
                        downloadJob["progress-bar"].classList.remove("bg-primary");
                        downloadJob["progress-bar"].classList.add("bg-cyan-300");
                        downloadJob["progress-bar"].style.width = "0";
                        downloadJob["progress-bar"].classList.remove("transition-all");
                        downloadJob.status.textContent = "Zipping album...";
                        if (totalAlbumBytes < (1.8 * 1024 * 1024 * 1024)) {
                            var zipJS = new JSZip();
                            for (const [index, track] of album.tracks.items.entries()) {
                                zipJS.file(this.cleanFileName(`${(index+1).toString().padStart(2, '0')} ${this.formatTitle(track)}.flac`), tracks[index]);
                            }
                            zipJS.file("cover.jpg", album.image.org);
                            const zipBlob = await zipJS.generateAsync({type:"blob"}, (update) => {
                                downloadJob["progress-bar"].classList.add("transition-all");
                                downloadJob["progress-bar"].style.width = update.percent + "%";
                            })
                            downloadBlobLink = URL.createObjectURL(zipBlob);
                        } else {
                            const blobWriter = new zip.BlobWriter("application/zip");
                            const zipWriter = new zip.ZipWriter(blobWriter);

                            for (const [index, track] of album.tracks.items.entries()) {
                                downloadJob["progress-bar"].classList.add("transition-all");
                                downloadJob["progress-bar"].style.width = (((index+1) / album.tracks.items.length) * 100) + "%";
                                downloadJob.status.textContent = `Zipping album (Track ${index+1}/${album.tracks.items.length})...`;
                                await zipWriter.add(this.cleanFileName(`${(index+1).toString().padStart(2, '0')} ${this.formatTitle(track)}.flac`), new zip.BlobReader(new Blob([tracks[index]], { type: "application/octet-stream" })));
                            }
                            await zipWriter.add("cover.jpg", new zip.BlobReader(new Blob([album.image.org], { type: "application/octet-stream" })))
                            const zipBlob = await zipWriter.close();
                            downloadBlobLink = URL.createObjectURL(zipBlob);
                        }

                        downloadJob["progress-bar"].style.width = "100%";
                        downloadJob.base.setAttribute("data-state", "complete");
                        downloadAlbumButton.removeAttribute("disabled");
                        downloadAlbumButton.querySelector("svg").replaceWith(oldSVG);
                        downloadJob.status.innerHTML = `<a class="hover:underline" href="${downloadBlobLink}">Album not downloaded to your device? Click here to download it again.</a>`
                        downloadJob.status.querySelector("a").download = (album.artists.length > 0 ? album.artists.map(artist => artist.name).join(", ") : "Various Artists") + " - " + this.formatTitle(album) + ".zip";
                        downloadJob.status.querySelector("a").click();
                        downloaded = true;
                    } catch (e) {
                        downloadAlbumButton.removeAttribute("disabled");
                        downloadAlbumButton.querySelector("svg").replaceWith(oldSVG);
                        if (!(e.name === 'AbortError')) {
                            this.showError(e);
                        }
                    }
                })
            })
        } else {
            results.map((result) => {
                const renderedResult = this.renderSingleTrack(result);
                Array.from(renderedResult.querySelectorAll("button")).map((button) => {
                    this.handleTrackDownloadButton(button, result)
                })
                contentFrame.appendChild(renderedResult)
            })
        }
        const parser = new DOMParser();
        const seeMore = parser.parseFromString(this.seeMoreButton, "text/html").body.firstChild
        contentFrame.appendChild(seeMore);
        seeMore.addEventListener("click", async () => {
            seeMore.style.height = seeMore.scrollHeight;
            seeMore.innerHTML = this.SPINNER;
            const results = await this.searchQobuz(originalQuery, contentFrame.children.length, 10);
            contentFrame.removeChild(seeMore);
            this.renderSearchResults(results[type].items, type, true, originalQuery);
        })
    }

    cleanFileName(filename) {
        const bannedChars = ["/", "\\", "?", ":", "*", '"', "<", ">", "|"];
        for (const char in bannedChars) {
            filename = filename.replace(bannedChars[char], "_");
        };
        return filename;
    }

    formatTitle(result) {
        return `${result.title}${result.version ? " (" + result.version + ")" : ""}`.trim();
    }

    async applyMetadata(trackBlob, resultData) {
        let metadata = `;FFMETADATA1`
        metadata += `\ntitle=${this.formatTitle(resultData)}`;
        metadata += `\nalbum_artist=${resultData.artists.length > 0 ? resultData.artists[0].name : "Various Artists"}`;
        metadata += `\nartist=${resultData.artists.length > 0 ? resultData.artists.map(artist => artist.name).join("; ") : "Various Artists"}`;
        metadata += `\nalbum=${this.formatTitle(resultData.album)}`
        metadata += `\ngenre=${resultData.album.genre.name}`
        metadata += `\ndate=${resultData.album.release_date_original}`
        metadata += `\nyear=${new Date(resultData.album.release_date_original).getFullYear()}`
        if (resultData.trackNumber) {
            metadata += `\ntrack=${resultData.trackNumber}`;
        }
        await this.loadFFmpeg();
        ffmpeg.FS("writeFile", "input.flac", new Uint8Array(trackBlob));
        const encoder = new TextEncoder();
        ffmpeg.FS("writeFile", "metadata.txt", encoder.encode(metadata))
        ffmpeg.FS("writeFile", "albumArt.jpg", resultData.album.image.org);
        await ffmpeg.run(
            "-i", "input.flac",
            "-i", "metadata.txt",
            "-map_metadata", "1",
            "-codec", "copy",
            "secondInput.flac"
        );
        await ffmpeg.run(
            '-i', 'secondInput.flac',
            '-i', 'albumArt.jpg',
            '-c', 'copy',
            '-map', '0',
            '-map', '1',
            '-disposition:v:0', 'attached_pic',
            'output.flac'
        );
        const output = ffmpeg.FS("readFile", `output.flac`);
        ffmpeg.FS('unlink', 'input.flac');
        ffmpeg.FS('unlink', 'output.flac');
        ffmpeg.FS('unlink', 'albumArt.jpg');
        ffmpeg.FS('unlink', 'secondInput.flac');
        return output;
    }

    async downloadTrack(track) {
        const timestamp = new Date().getTime() / 1000;
        const r_sig = `trackgetFileUrlformat_id${27}intentstreamtrack_id${track.id}${timestamp}${this.QobuzSecret}`;
        const r_sig_hashed = CryptoJS.MD5(r_sig).toString(CryptoJS.enc.Hex);
        let url = new URL(this.BASE_URL + 'track/getFileUrl'); 
        url.searchParams.append("format_id", 27);
        url.searchParams.append("intent", "stream");
        url.searchParams.append("track_id", track.id);
        url.searchParams.append("request_ts", timestamp);
        url.searchParams.append("request_sig", r_sig_hashed);
        const headers = new Headers();
        headers.append('X-App-Id', this.QobuzAppID);
        headers.append("X-User-Auth-Token", this.TOKEN);
        const response = await fetch(url, {
            method: "GET",
            headers: headers
        })
        return (await response.json()).url;
    }

    async getAlbumInfo(id) {
        try {
            let url = new URL(this.BASE_URL + 'album/get'); 
            url.searchParams.append("album_id", id);
            url.searchParams.append("extra", "track_ids");
            const headers = new Headers();
            headers.append('X-App-Id', this.QobuzAppID);
            headers.append("X-User-Auth-Token", this.TOKEN);
            const response = await fetch(url, {
                method: "GET",
                headers: headers
            })
            return await response.json();
        } catch (e) {
            this.showError(e);
        }
    }

    async searchQobuz(query, offset=0, limit=10) {
        try {
            let url = new URL(this.BASE_URL + 'catalog/search'); 
            url.searchParams.append("query", query);
            url.searchParams.append("offset", offset);
            url.searchParams.append("limit", limit);
            const headers = new Headers();
            headers.append('X-App-Id', this.QobuzAppID);
            headers.append("X-User-Auth-Token", this.TOKEN);
            const response = await fetch(url, {
                method: "GET",
                headers: headers
            })
            const responseJSON = await response.json();
            if (this.searchMode === "albums") {
                await Promise.all(responseJSON.albums.items.map(async (album, index) => {
                    responseJSON.albums.items[index].image.small = URL.createObjectURL(await (await fetch(responseJSON[this.searchMode].items[index].image.small)).blob());
                }));
            } else {
                await Promise.all(responseJSON.tracks.items.map(async (album, index) => {
                    responseJSON.tracks.items[index].album.image.small = URL.createObjectURL(await (await fetch(responseJSON.tracks.items[index].album.image.small)).blob());
                }));
            }
            return responseJSON;
        } catch (e) {
            this.showError(e);
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
    
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
        const i = Math.floor(Math.log(bytes) / Math.log(k));
    
        const formatted = i >= 3 
            ? parseFloat((bytes / Math.pow(k, i)).toFixed(2))
            : Math.round(bytes / Math.pow(k, i));
    
        return `${formatted} ${sizes[i]}`;
    }

    showError(error) {
        this.notyf.error({
            message: error,
            dismissible: true,
            duration: 60000
        })
    }

    async getToken() {
        try {
            const response = await fetch("/static/tokens.json");
            let tokens = await response.json();
            while (true) {
                if (tokens.length > 0) {
                    const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
                    if (this.checkToken(randomToken)) {
                        return randomToken;
                    } else {
                        tokens = tokens.filter(token => token != randomToken);
                    }
                } else {
                    this.showError("No valid Qobuz tokens were found in the tokens.json config!");
                    return false;
                }
            }
        } catch (e) {
            this.showError(e)
        }
    }

    async getAppIdAndSecrets() {
        try {
            const seedTimezoneRegex = /[a-z]\.initialSeed\("(?<seed>[\w=]+)",window\.utimezone\.(?<timezone>[a-z]+)\)/g;
            const infoExtrasRegex = (timezones) => 
                new RegExp(`name:"\\w+/(?<timezone>${timezones})",info:"(?<info>[\\w=]+)",extras:"(?<extras>[\\w=]+)"`, 'g');
            const appIdRegex = /production:{api:{appId:"(?<app_id>\d{9})",appSecret:"(\w{32})/;
        
            const response = await fetch(`https://corsproxy.io/?${encodeURIComponent("https://play.qobuz.com/login")}`);
            const loginPage = await response.text();
        
            const bundleUrlMatch = loginPage.match(/<script src="(\/resources\/\d+\.\d+\.\d+-[a-z]\d{3}\/bundle\.js)"><\/script>/);
            if (!bundleUrlMatch) throw new Error("Could not find bundle URL.");
            const bundleUrl = bundleUrlMatch[1];

            const bundleResponse = await fetch(`https://corsproxy.io/?${encodeURIComponent("https://play.qobuz.com" + bundleUrl)}`);
            const bundle = await bundleResponse.text();
        
            const appIdMatch = bundle.match(appIdRegex);
            if (!appIdMatch) throw new Error("Could not find app id.");
            const appId = appIdMatch.groups.app_id;
        
            const secrets = new Map();
        
            let seedMatch;
            while ((seedMatch = seedTimezoneRegex.exec(bundle)) !== null) {
                const { seed, timezone } = seedMatch.groups;
                secrets.set(timezone, [seed]);
            }
        
            const timezones = Array.from(secrets.keys()).map(tz => tz.charAt(0).toUpperCase() + tz.slice(1)).join('|');
            const infoExtrasMatches = [...bundle.matchAll(infoExtrasRegex(timezones))];
        
            for (const match of infoExtrasMatches) {
                const { timezone, info, extras } = match.groups;
                secrets.get(timezone.toLowerCase()).push(info, extras);
            }
        
            const decodedSecrets = Array.from(secrets.values()).map(secretArray => {
                const combinedSecret = secretArray.join('').slice(0, -44);
                return atob(combinedSecret);
            }).filter(secret => secret !== "");
            return { appId, secrets: decodedSecrets };
        } catch (e) {
            this.showError(e)
        }
    }

    async getValidSecret(secrets, appid) {
        try {
            return new Promise((resolve, reject) => {
                secrets.map(async (secret) => {
                    const timestamp = new Date().getTime() / 1000;
                    const r_sig = `trackgetFileUrlformat_id${27}intentstreamtrack_id1${timestamp}${secret}`;
                    const r_sig_hashed = CryptoJS.MD5(r_sig).toString(CryptoJS.enc.Hex);
                    let url = new URL(this.BASE_URL + 'track/getFileUrl'); 
                    url.searchParams.append("format_id", 27);
                    url.searchParams.append("intent", "stream");
                    url.searchParams.append("track_id", 1);
                    url.searchParams.append("request_ts", timestamp);
                    url.searchParams.append("request_sig", r_sig_hashed);
                    const headers = new Headers();
                    headers.append('X-App-Id', appid);
                    headers.append("X-User-Auth-Token", this.TOKEN);
                    const response = await fetch(url, {
                        method: "GET",
                        headers: headers
                    })
                    if (response.status === 404) {
                        resolve(secret);
                    }
                })
            })
        } catch (e) {
            this.showError(e);
        }
    }
}

new QobuzDL()
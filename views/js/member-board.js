class MemberBoard extends HTMLElement {
    constructor() {
        super();
        this.areas = new Map();
        this.areas_text = [];
        this.SCROLL_RATIO = 0.4;
    }

    getAreasFrom(children = []) {
        children.forEach((child) => {
            const area = child.getAttribute('area');
            if (area && !this.areas_text.includes(area)) {
                if (area.toLowerCase().includes('executiv')) {
                    this.areas_text.unshift(area); // Executivo sempre em primeiro
                } else {
                    this.areas_text.push(area);
                }
            }
        });
    }

    connectedCallback() {
        const children = Array.from(this.children);
        this.getAreasFrom(children);

        const title = this.getAttribute('title') || '';

        this.innerHTML = `
            <div class="member-board__bg"></div>
            <div class="member-board__header">
                <h2>${title}</h2>
            </div>
            <div class="member-board__container"></div>
        `;

        this.initParallaxEffect();

        const container = this.querySelector('.member-board__container');

        if (children.length <= 0) {
            container.innerHTML = '<h2>Lista de membros indisponível</h2><br><h3>Verifique os cards de membros.</h3>';
            return;
        } else if (this.areas_text.length <= 0) {
            container.innerHTML = '<h2>Lista de membros indisponível</h2><br><h3>Verifique as áreas.</h3>';
            return;
        }

        // Separates the areas
        this.areas_text.forEach((area) => {
            const box = document.createElement('div');
            box.className = "member-board__area";
            box.innerHTML = `
                <h3 class="member-board__area-title">${area}</h3>
                <div class="member-board__area-content"></div>
            `;
            this.areas.set(area, box);
            container.appendChild(box);
        });

        // Fill with the Members
        children.forEach((child) => {
            const area = child.getAttribute('area');
            if (area && this.areas.has(area)) {
                this.areas.get(area).querySelector('.member-board__area-content').appendChild(child);
            }
        });
    }

    // Makes the bg's parallax
    initParallaxEffect() {
        const bg = this.querySelector('.member-board__bg');
        bg.style.backgroundImage = `
            linear-gradient(rgba(22, 27, 34, 0.9), rgba(22, 27, 34, 0.9)),
            url('${this.getBackgroundImg(0)}')
        `;
        window.addEventListener('scroll', () => {
            const scrollPosition = window.pageYOffset;
            // Speed: SCROLL_RATIO of scroll
            bg.style.transform = `translateY(${scrollPosition * this.SCROLL_RATIO}px)`;
        });
    }

    getBackgroundImg(fixed = undefined) {
        if (fixed === 0 || fixed === 1) return `./assets/membros/default/background-member-${fixed}.jpg`;
        return `./assets/membros/default/background-member-${this.isDay()}.jpg`;
    }

    isDay() {
        const DAY_START = 6;
        const DAY_END = 18;
        const hour = new Date().getHours();
        return ((hour >= DAY_START) && (hour < DAY_END))? 1 /* Good Day! */ : 0 /* Good Evening! */;
    }
}

class MemberCard extends HTMLElement {
    constructor() {
        super();
        this.media = new Map();
        this.QNT_DEFAULT_IMG = 3
    }

    getBlankMemberImg() {
        const num = Math.floor(Math.random() * this.QNT_DEFAULT_IMG) + 1;  // 3 = Qnt. of default member images.
        return `./assets/membros/default/blank-member-${num}.jpg`;
    }

    renderShareIconsIn(element) {
        if (typeof MEDIA_ICONS === 'undefined') return;

        Object.keys(MEDIA_ICONS).forEach((key) => {
            const attrValue = this.getAttribute(key);
            if (attrValue) {
                this.media.set(key, attrValue);

                const link = document.createElement('a');
                link.href = attrValue;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.className = 'member-card__media-icon';
                link.title = `Acessar ${capitalize(key)}`;

                link.innerHTML = MEDIA_ICONS[key];
                element.appendChild(link);

                // console.log(link)
            }
        });
    }

    connectedCallback() {
        const name = this.getAttribute('name') || "";
        const img = this.getAttribute('img') || this.getBlankMemberImg();
        const role = this.getAttribute('role') || "";
        const highlight = this.hasAttribute('highlight');

        this.innerHTML = `
            <div class="member-card__container ${highlight? 'member-card__highlight' : ''}">
                <div class="member-card__frame">
                    <img src="${img}" alt="Foto de ${name}">
                </div>
                <label class="member-card__name">${name}</label>
                <label class="member-card__role">${role}</label>
                <div class="member-card__media"></div>
            </div>
        `;

        const mediaBox = this.querySelector('.member-card__media');
        this.renderShareIconsIn(mediaBox);

        // GET ERROR
        const memberImg = this.querySelector('.member-card__frame img');
        memberImg.addEventListener('error', () => {
            const fallbackImg = this.getBlankMemberImg();
            if (memberImg.src !== fallbackImg) {
                memberImg.src = fallbackImg;
            }
        });
    }
}

customElements.define('member-board', MemberBoard);
customElements.define('member-card', MemberCard);
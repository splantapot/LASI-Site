class CardBox extends HTMLElement {
    connectedCallback() {
        const children = Array.from(this.children);

        const title = this.getAttribute('title') || '';
        const subtitle = this.getAttribute('subtitle') || '';
        const grid = this.hasAttribute('grid') || undefined;
        const row = this.hasAttribute('row') || undefined;
        const column = this.hasAttribute('column') || undefined;


        this.innerHTML = `
            <div class="card-box__container">
                <div class="card-box__header">
                    <h2 class="card-box__title">${title}</h2>
                    <h3 class="card-box__subtitle">${subtitle}</h3>
                </div>
                <div class="card-box__body"></div>
            </div>
        `;

        if (this.hasAttribute('start')) {
            this.querySelector('.card-box__title').classList.add('start');
            this.querySelector('.card-box__subtitle').classList.add('start');
        }

        const cardBoxBody = this.querySelector('.card-box__body');
        if (row) cardBoxBody.classList.add('card-box__row');
        else if (column) cardBoxBody.classList.add('card-box__column');
        else cardBoxBody.classList.add('card-box__grid');

        children.forEach((child) => {
            cardBoxBody.appendChild(child);
        });
    }
}

class CardItem extends HTMLElement {
    constructor() {
        super();
        this.SHAPES = {
            SQUARE: '--square',
            RECT: '--rect',
            CIRCLE: '--circle'
        }
    }

    getShapeAttribute() {
        if (this.hasAttribute('rect')) return this.SHAPES.RECT;
        else if (this.hasAttribute('circle')) return this.SHAPES.CIRCLE;
        else return this.SHAPES.SQUARE;
    }

    connectedCallback() {
        const img = this.getAttribute('img') || '';
        const title = this.getAttribute('title') || '';
        const text = this.getAttribute('text') || '';

        const logo = this.getAttribute('logo') || this.getAttribute('media') || undefined;
        const logo_url = this.getAttribute('logo-url') || this.getAttribute('media-url') || undefined;

        const shape = this.getShapeAttribute();

        let imgContent = '';
        if (img) {
            imgContent = `<img src="${img}" alt="${title}" class="card-item__img" />`;
        }

        // Media (only logo) Card or Common Card
        if (logo && logo_url) {
            /* Exists icon for this media? Is media = YES. */
            const isMedia = MEDIA_ICONS[logo];
            const TAG = isMedia? '--media' : shape;
            const LOGO_OBJ = isMedia?
                MEDIA_ICONS[logo] :
                `<img src="${logo}" class="card-item__img" alt="${title? title : ''}">`

            const imgTitle = isMedia? capitalize(logo) : capitalize(title) || '';
            
            // Finally render
            this.innerHTML = `
                <div class="card-item__container${TAG}">
                    <a href="${logo_url}" target="_blank" rel="noopener noreferrer" title="${imgTitle}">
                        <div class="card-item__img${TAG}">${LOGO_OBJ}</div>
                    </a>
                </div>
            `;
        } else {
            this.innerHTML = `
                <div class="card-item__container ${img ? '' : 'card-item__container--no-img'}">
                    ${img ? `<div class="card-item__img-box">${imgContent}</div>` : ''}
                    <div class="card-item__content">
                        ${title ? `<h4 class="card-item__title">${title}</h4>` : ''}
                        ${text ? `<p class="card-item__text">${text}</p>` : ''}
                    </div>
                </div>
            `;
        }

    }
}

customElements.define('card-box', CardBox);
customElements.define('card-item', CardItem);
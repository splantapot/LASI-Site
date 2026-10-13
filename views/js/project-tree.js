class ProjectTree extends HTMLElement {
    connectedCallback() {
        const children = Array.from(this.children); // Obtém a lista dos projetos

        const title = this.getAttribute('title') || 'Título';
        const footer = this.getAttribute('footer') || 'Footer';

        this.innerHTML = `
            <div class="project-tree__container">
                <div class="project-tree__header">
                    <h2 class="project-tree__header-title">${title}</h2>
                </div>
                <div class="project-tree__body">
                    <div class="project-tree__body-left"></div>
                    <div class="project-tree__body-right"></div>
                </div>
                <div class="project-tree__footer">
                    <h2 class="project-tree__footer-title">${footer}</h2>
                </div>
            </div>
        `

        const treeBody = this.querySelector('.project-tree__body');
        const bodyLeft = this.querySelector('.project-tree__body-left');
        const bodyRight = this.querySelector('.project-tree__body-right');
        const hasProjectChild = children.some((child, i) => child.tagName.toLowerCase() == 'project-branch');

        if (children.length <= 0 || !hasProjectChild) {
            const noProjectLabel = document.createElement('h4');
            noProjectLabel.className = 'project-tree__no-project-label';
            noProjectLabel.innerHTML = 'Não há projetos ainda...'
            treeBody.appendChild(noProjectLabel);
            return;
        }

        children.forEach((child, ix) => {
            if (ix % 2 == 0) {
                bodyLeft.appendChild(child);
            } else {
                bodyRight.appendChild(child);
            }
        });
    }
}

class ProjectBranch extends HTMLElement {
    constructor() {
        super();
        // this.title = this.date = this.text = this.thumbnail = '';
        this.media = new Map();
        this.presentation = undefined;
        this.presentation_images = [];
    }

    hasMedia() {
        return Object.keys(MEDIA_ICONS).some((key) => this.media[key]);
    }

    renderShareIconsIn(element) {
        Object.keys(MEDIA_ICONS).forEach((key) => {
            const attrValue = this.getAttribute(key);
            this.media.set(key, attrValue);

            if (attrValue) {
                const link = document.createElement('a');
                link.href = attrValue;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.className = 'project-branch__link-icon';
                link.title = `Acessar ${capitalize(key)}`;

                link.innerHTML = MEDIA_ICONS[key];
                
                link.addEventListener('click', (event) => {
                    event.stopPropagation();
                });

                element.appendChild(link);
            }
        });
    }

    renderPresentation(element) {
        this.presentation = undefined;
        this.presentation_images = [];
        // Get all presentation images [Numbered from 1 to 10 (max)]
        for (let i = 1; i <= 10; i++) {
            const present = this.getAttribute(`img${i}`) || undefined;
            if (present) {
                this.presentation_images.push(present);
            } /* else break; */
        }

        if (this.presentation_images.length > 0) {
            const slideshow = document.createElement('slider-box');
            slideshow.setAttribute('interval', 5000);
            this.presentation_images.forEach((img) => {
                const sliderItem = document.createElement('slider-item');
                sliderItem.setAttribute('img', img);
                sliderItem.setAttribute('shadow-off', 'shadow-off');
                slideshow.appendChild(sliderItem);
            });
            this.presentation = slideshow;
            if (element) element.prepend(slideshow);
        }
    }

    connectedCallback() {
        this.title = this.getAttribute('title') || '';
        this.date = this.getAttribute('date') || '';
        this.text = this.getAttribute('text') || '';

        this.innerHTML = `
            <div class="project-branch__container">
                <!-- Thumbnail Inserted via JS -->
                <div class="project-branch__content">
                    <div class="project-branch__header">
                        <div class="project-branch__title-wrapper">
                            <h3 class="project-branch__title">${this.title}</h3>
                        </div>
                        <span class="project-branch__date">${this.date}</span>
                    </div>

                    <div class="project-branch__media-wrapper"></div>

                    <p class="project-branch__text">${this.text}</p>
                    <!--
                    <div class="project-branch__footer">
                        <h4  class="project-branch__details-text">Detalhes</h4>
                    </div>
                    -->
                </div>
            </div>
        `;

        const mediaWrapper = this.querySelector('.project-branch__media-wrapper');
        this.renderShareIconsIn(mediaWrapper);

        const branchContainer = this.querySelector(".project-branch__container");
        this.renderPresentation(branchContainer);
        if (!this.presentation) {
            this.querySelector('.project-branch__text').classList.add('project-branch__long-text')
        }

        // Add Button event
        this.addEventListener('click', (e) => this.openDetailedView());
    }

    openDetailedView() {
        const overlay = document.createElement('div');
        overlay.className = 'project-branch__modal-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'project-branch__modal-container';

        modal.innerHTML = `
            <!-- SLIDESHOW INSERTED VIA JS -->
            <div class="project-branch__modal-content">
                <div class="project-branch__modal-header">
                    <div class="project-branch__modal-title-wrapper">
                        <h3 class="project-branch__title">${this.title}</h3>
                        <span class="project-branch__date">${this.date}</span>
                    </div>
                    <div class="project-branch__modal-icons-wrapper"></div>
                </div>
                <div class="project-branch__modal-text-box">
                    <p class="project-branch__modal-text">${this.text}</p>
                </div>
            </div>
        `;

        const iconsWrapper = modal.querySelector('.project-branch__modal-icons-wrapper');
        this.renderShareIconsIn(iconsWrapper);

        this.renderPresentation(modal);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);


        // Fade in ---------------------------------------------
        requestAnimationFrame(() => {
            overlay.classList.add('project-branch__modal-visible');
        });

        // Fade out --------------------------------------------
        const closeModal = () => {
            document.removeEventListener('keydown', handleEscPress);
            overlay.classList.remove('project-branch__modal-visible');
            setTimeout(() => {
                overlay.remove();
            }, 300); 
        };

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closeModal();
            }
        });

        const handleEscPress = (event) => {
            if (event.key === 'Escape') closeModal();
        };

        document.addEventListener('keydown', handleEscPress);
    }
}

customElements.define('project-tree', ProjectTree);
customElements.define('project-branch', ProjectBranch);
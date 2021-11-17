"use strict";

document.addEventListener('DOMContentLoaded', () => {
    //Tabs
    const tabs = document.querySelectorAll('.tabheader__item'),
          tabsContent = document.querySelectorAll('.tabcontent'),
          tabsParent = document.querySelector('.tabheader__items');
          
    function hideTabContent() {
        tabsContent.forEach(item => {
            item.classList.add('hide');
            item.classList.remove('show', 'fade');
        });

        tabs.forEach(item => {
            item.classList.remove('tabheader__item_active');
        });
    }

    function showTabContent(i = 0) {
        tabsContent[i].classList.add('show', 'fade');
        tabsContent[i].classList.remove('hide');
        tabs[i].classList.add('tabheader__item_active');
    }

    hideTabContent();
    showTabContent();

    tabsParent.addEventListener('click', (event) => {
        const target = event.target;

        if (target && target.classList.contains('tabheader__item')) {
            tabs.forEach((item, i) => {
                if (target == item) {
                    hideTabContent();
                    showTabContent(i);
                }
            });
        }
    })

    //Timer

    const deadline = '2022-01-19';

    function getTimeRemaining(endtime) {
        const t = Date.parse(endtime) - Date.parse(new Date()),
              days = Math.floor(t / (1000 * 60 * 60 * 24)),
              hours = Math.floor((t / (1000 * 60 * 60) % 24)),
              minutes = Math.floor((t / (1000 * 60) % 60)),
              seconds = Math.floor((t / 1000) % 60);

        return {
            "total": t,
            days,
            hours,
            minutes,
            seconds
        };
    }

    function getZero(num) {
        if (num >= 0 && num <10) {
            return `0${num}`;
        } else {
            return num;
        }
    }

    function setClock(selector, endtime) {
        const timer = document.querySelector(selector),
              days = timer.querySelector('#days'),
              hours = timer.querySelector('#hours'),
              minutes = timer.querySelector('#minutes'),
              seconds = timer.querySelector('#seconds'),
              timeInterval = setInterval(updateClock, 1000);

        updateClock();

        function updateClock() {
            const t = getTimeRemaining(endtime);

            days.textContent = getZero(t.days);
            hours.textContent = getZero(t.hours);
            minutes.textContent = getZero(t.minutes);
            seconds.textContent = getZero(t.seconds);

            if (t.total <= 0) {
                clearInterval(timeInterval);
            }
        }
    }

    setClock('.timer', deadline);

    //Modal window

    const modalTrigger = document.querySelectorAll("[data-modal]"),
          modal = document.querySelector('.modal');


    function openModal() {
        // modal.style.display = "block"; //inline styles
        modal.classList.add('show');
        modal.classList.remove('hide');
        // modal.classList.toggle("show"); //toggle
        document.body.style.overflow = 'hidden';
        clearInterval(modalTimerId);
    }
    
    modalTrigger.forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    

    function closeModal() {
        modal.classList.add('hide');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }   
    
    modal.addEventListener('click', (event) => {
        if (event.target === modal || event.target.getAttribute('data-close') == "") {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.code === "Escape" && modal.classList.contains('show')) {
            closeModal();
        }
    });

    const modalTimerId = setTimeout(openModal, 60000);

    function showModalByScroll(){        
        if(window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight - 1) {
            openModal();
            window.removeEventListener('scroll', showModalByScroll);
        }        
    }
    
    window.addEventListener('scroll', showModalByScroll);

    // Added class for Cards

    class MenuItem {
        constructor(src, alt, subtitle, descr, price, parent, ...classes) {
            this.src = src;
            this.alt = alt;
            this.subtitle = subtitle;
            this.descr = descr;
            this.price = price;
            this.parent = document.querySelector(parent);
            this.transfer = 27;
            this.classes = classes;
            this.changeToUAH();
        }

        changeToUAH() {
            this.price = this.price * this.transfer;
        }

        render() {
            const element = document.createElement('div');

            if(this.classes.length === 0) {
                this.element = "menu__item";
                element.classList.add(this.element);
            } else {
                this.classes.forEach(className => element.classList.add(className))
            }
            
            element.innerHTML = `                
                <img src=${this.src} alt=${this.alt}>
                <h3 class="menu__item-subtitle">${this.subtitle}</h3>
                <div class="menu__item-descr">${this.descr}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Цена:</div>
                    <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
                </div>                
            `;           
            this.parent.append(element);
        }
    };

    const getResource = async url => {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Could not fetch ${url}, status: ${res.status}`);
        }

        return await res.json();
    };

    // getResource('http://localhost:3000/menu')
    //     .then(data => {
    //         data.forEach(({src, alt, subtitle, descr, price}) => {
    //             new MenuItem(src, alt, subtitle, descr, price, ".menu .container").render();
    //         });
    //     });

    axios.get("http://localhost:3000/menu") //Access to the JSON-server 
        .then(object => {
            object.data.forEach(({src, alt, subtitle, descr, price}) => {
                new MenuItem(src, alt, subtitle, descr, price, ".menu .container").render();
            });
        });

    //Forms

    const forms = document.querySelectorAll('form');

    const message = {
        loading: "img/form/spinner.svg",
        success: "Success",
        failure: 'Error'
    };

    forms.forEach(form => {
        bindPostData(form);
    });

    const postData = async (url, data) => {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: data
        });

        return await res.json();
    };

    function bindPostData(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const statusMassage = document.createElement('img');
            statusMassage.src = message.loading;
            statusMassage.style.cssText = `
                display: block;
                margin: 0 auto;
            `;
            form.insertAdjacentElement("afterend", statusMassage);            

            const formData = new FormData(form);
            
            const jsonData = JSON.stringify(Object.fromEntries(formData.entries()));
            
            postData("http://localhost:3000/requests", jsonData)
                .then(data => {
                    console.log(data); 
                    showThanksModal(message.success);
                    statusMassage.remove();
                })
                .catch(() => {
                    showThanksModal(message.failure);
                })
                .finally(() => {
                    form.reset();
                })
        });
    }

    function showThanksModal(message) {
        const prevModalDialog = document.querySelector(".modal__dialog");

        prevModalDialog.classList.add('hide');
        openModal();

        const thanksModal = document.createElement('div');
        thanksModal.classList.add('modal__dialog');
        thanksModal.innerHTML = `
            <div class="modal__content">
                <div class="modal__close" data-close>&times;</div>
                <div class="modal__title">${message}</div>
            </div>
        `;

        document.querySelector(".modal").append(thanksModal);
        setTimeout(() => {
            thanksModal.remove();
            prevModalDialog.classList.add("show");
            prevModalDialog.classList.remove("hide");
            closeModal();
        }, 4000);
    }

    //Slider

    const slides = document.querySelectorAll(".offer__slide"),
          slidesCount = slides.length,
          slider = document.querySelector(".offer__slider"),
          previousSlide = document.querySelector(".offer__slider-prev"),
          nextSlide = document.querySelector(".offer__slider-next"),
          correntSlide = document.querySelector("#current"),
          totalSlide = document.querySelector("#total"),
          slideCounter = document.querySelector(".offer__slider-counter"),
          slidesWrapper = document.querySelector(".offer__slider-wrapper"),
          slidesField = document.querySelector(".offer__slider-inner"),
          widthSliderWrapper = window.getComputedStyle(slidesWrapper).width;

    let activeSlideIndex = 1,
        offset = 0;

    correntSlide.textContent = getZero(activeSlideIndex);
    totalSlide.textContent = getZero(slidesCount);
   
    slidesField.style.width = 100 * slidesCount + "%";
    slidesField.style.display = "flex";
    slidesField.style.transition = "0.5s all";

    slidesWrapper.style.overflow = 'hidden'; //We hide everything that is not in the wrapper 
    slides.forEach(slide => {
        slide.style.width = widthSliderWrapper;
    });

    slider.style.position = 'relative';

    const dots = document.createElement("ol"),
          indicator = [];
    dots.classList.add('carusel-indicators');
    dots.style.cssText = `
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 15;
        display: flex;
        justify-content: center;
        margin-right: 15%;
        margin-left: 15%;
        list-style: none;
    `;

    slider.append(dots);

    for (let i = 0; i < slidesCount; i++) {
        const dot = document.createElement('li');
        dot.setAttribute('data-slide-to', i + 1);
        dot.style.cssText = `
            box-sizing: content-box;
            flex: 0 1 auto;
            width: 30px;
            height: 6px;
            margin-right: 3px;
            margin-left: 3px;
            cursor: pointer;
            background-color: #fff;
            background-clip: padding-box;
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            opacity: .5;
            transition: opacity .6s ease;
        `;		
        if (i == 0) {
           dot.style.opacity = 1;
        };
        dots.append(dot);
        indicator.push(dot);
    }

    nextSlide.addEventListener('click', () => {
        if (offset == +widthSliderWrapper.slice(0, widthSliderWrapper.length - 2) * (slidesCount - 1)) {
            offset = 0;
        } else {
            offset += +widthSliderWrapper.slice(0, widthSliderWrapper.length - 2);
        }

        moveSlide();

        if (activeSlideIndex == slidesCount) {
            activeSlideIndex = 1;
        } else {
            activeSlideIndex++;
        }
        correntSlide.textContent = getZero(activeSlideIndex);

        makeButtonActive();
    });

    previousSlide.addEventListener('click', () => {
        if (offset == 0) {
            offset = +widthSliderWrapper.slice(0, widthSliderWrapper.length - 2) * (slidesCount - 1)
        } else {
            offset -= +widthSliderWrapper.slice(0, widthSliderWrapper.length - 2);
        }
        
        moveSlide();

        if (activeSlideIndex == 1) {
            activeSlideIndex = slidesCount;
        } else {
            activeSlideIndex--;
        }
        correntSlide.textContent = getZero(activeSlideIndex);

        makeButtonActive();
    });

    //Navigation for slider
    indicator.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const slideTo = e.target.getAttribute('data-slide-to');

            activeSlideIndex = slideTo;
            offset = +widthSliderWrapper.slice(0, widthSliderWrapper.length - 2) * (slideTo - 1);

            moveSlide();

            correntSlide.textContent = getZero(activeSlideIndex);
            
            makeButtonActive();
        });
    });

    function moveSlide() {
        slidesField.style.transform = `translateX(-${offset}px)`;
    }

    function makeButtonActive() {
        indicator.forEach(dot => dot.style.opacity = '.5');
            indicator[activeSlideIndex - 1].style.opacity = '1';
    }
});
function generateTOC() {
    const mainContent = document.getElementById('main-content');
    const headings = mainContent.querySelectorAll('h2, h3');
    const menuList = document.getElementById('menu-list');
    function generateId(string) { return string.toLowerCase().replace(/[^\w]+/g, '-'); }
    for (const heading of headings) {
        const text = heading.textContent;
        const id = generateId(text);
        heading.id = id;
        const link = document.createElement('a');
        link.className = 'heading-link';
        link.href = '#' + id;
        link.textContent = text;
        heading.textContent = '';
        heading.appendChild(link);
        const li = document.createElement('li');
        const menuLink = document.createElement('a');
        menuLink.href = '#' + id;
        menuLink.textContent = text;
        li.appendChild(menuLink);
        if (heading.tagName.toLowerCase() === 'h3') li.style.paddingLeft = '1rem';
        menuList.appendChild(li);
    }
    const headingSections = [];
    for (const h of headings) {
        headingSections.push({ id: h.id, offsetTop: h.offsetTop });
    }
    function onScroll() {
        const scrollPosition = window.scrollY + 10;
        let currentId = null;
        for (let i = headingSections.length - 1; i >= 0; i--) {
            if (scrollPosition >= headingSections[i].offsetTop) { currentId = headingSections[i].id; break; }
        }
        const menuLinks = menuList.querySelectorAll('a');
        for (const link of menuLinks) link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    }
    window.addEventListener('scroll', onScroll);
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) window.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    }
}
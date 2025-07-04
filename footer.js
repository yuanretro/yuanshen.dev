const currentPath = window.location.pathname;
const hideTimeouts = new Map();  // 用 Map 来保存每个 submenu 的定时器

// 显示子菜单
function showMenu(submenuID) {
    const submenu = document.querySelector('#submenu-container' + submenuID);

    // 清除该 submenu 的隐藏计时器
    if (hideTimeouts.has(submenuID)) {
        clearTimeout(hideTimeouts.get(submenuID));
        hideTimeouts.delete(submenuID);
    }

    submenu.classList.add('show');
}

// 隐藏子菜单
function hideMenu(submenuID) {
    const submenu = document.querySelector('#submenu-container' + submenuID);

    const timeout = setTimeout(function () {
        submenu.classList.remove('show');
        hideTimeouts.delete(submenuID);  // 移除对应的定时器
    }, 300);

    hideTimeouts.set(submenuID, timeout);
}

// 点击切换语言时候跳转到对应页面
function changeLang() {
    const parts = currentPath.split("/");          // 使用 / 分割字符串
    const lastPart = parts[parts.length - 1];      // 获取最后一段
    if (currentPath.includes("/en/")) {
        window.location.href = `/${lastPart}`;
    } else {
        window.location.href = `/en/${lastPart}`;
    }
}

function adjustFooterMargin() {
    const body = document.body;
    const html = document.documentElement;
    const footer = document.querySelector('.site-footer');

    // 计算页面内容高度（body或html的scrollHeight）
    const contentHeight = Math.max(body.scrollHeight, html.scrollHeight);
    // 视口高度
    const viewportHeight = window.innerHeight;

    if (contentHeight <= viewportHeight) {
        // 内容不满屏幕，底部推开
        footer.classList.remove("footer-margin-2rem");
        footer.classList.add('footer-margin-auto');
    } else {
        // 内容超过屏幕，高度自动，不推开
        footer.classList.remove('footer-margin-auto');
        footer.classList.add("footer-margin-2rem");
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // 初始运行一次
    adjustFooterMargin();
    // 监听窗口大小变化时也运行
    window.addEventListener('resize', adjustFooterMargin);
});

//页面加载时调用这个方法
window.onload = function () {
    //随机选取一个背景图
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const bodyElement = document.getElementById("body");
    let backgroundURL;
    backgroundURL = `url('/img/bg${getRandomInt(1, 11)}.webp') no-repeat center center fixed`;
    bodyElement.style.background = backgroundURL;
    bodyElement.style.backgroundSize = "cover";
    bodyElement.style.animation = "slideInLeft 0.5s ease-out forwards";
    bodyElement.style.webkitAnimation = "slideInLeft 0.5s ease-out forwards";
}


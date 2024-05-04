/**
 * Preloads fonts by dynamically creating link elements in the document head.
 */
const preloadFonts = () => {
  const fonts = [
    "Helvetica.ttc",
  ];
  fonts.forEach((filename) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "font";
    link.href = `_static/fonts/${filename}`;
    link.crossOrigin = "";
    document.head.appendChild(link);
  });
}

/**
 * Rearranges the DOM structure by moving all the body divs into a wrapper div,
 * adding a backdrop div, and repositioning the content element.
 */
const rearrangeDom = () => {
  const bodyDivs = document.querySelectorAll("body>div");
  bodyDivs.forEach((div) => { div.remove(); });
  const wrapperDiv = document.createElement("div");
  wrapperDiv.classList.add(WRAPPER_CLASS);
  bodyDivs.forEach((div) => wrapperDiv.appendChild(div));
  document.body.prepend(wrapperDiv);

  moveRstVersions()

  const backdrop = document.createElement("div");
  backdrop.classList.add("backdrop");
  wrapperDiv.appendChild(backdrop);

  const content = document.querySelector(".wy-nav-content");
  content.id = "content";
  const oldWrap = document.querySelector("section.wy-nav-content-wrap");
  oldWrap.remove();
  document.querySelector(".wy-grid-for-nav").appendChild(content);
}

/**
 * Updates the label of the edit button.
 */
const updateEditButtonLabel = () => {
  const editButton = document.querySelector(".wy-breadcrumbs-aside a");
  if (!editButton) return;
  editButton.textContent = "Edit on GitHub";
}

/**
 * Preload color-mode icons, storing them in the loadedSvgs object.
 */
const preloadColorModeIcons = () => {
  const icons = COLOR_MODES.map(({ icon }) => icon);
  icons.forEach((path, idx) => {
    fetch(path)
      .then(response => response.text())
      .then(data => {
        loadedSvgs[icons[idx].value] = data;
      })
  })
}

/**
 * Clean up unused elements from side nav search
 */
const cleanSearchInput = () => {
  // Select the side nav search container
  const sideNavSearch = document.querySelector('.wy-side-nav-search');

  // Remove the anchor and div.version siblings before the input
  const anchor = sideNavSearch.querySelector('a');
  const versionDiv = sideNavSearch.querySelector('div.version');
  if (anchor) sideNavSearch.removeChild(anchor);
  if (versionDiv) sideNavSearch.removeChild(versionDiv);
}

/**
 * Adds a horizontal rule (hr) element under the search form in the vertical menu.
 */
const addHrUnderSearchForm = () => {
  const verticalMenu = document.querySelector(".wy-menu-vertical[role=navigation]");
  const hr = document.createElement("hr");
  verticalMenu.parentNode.insertBefore(hr, verticalMenu);
}

/**
 * Adds a footer note to the content info section.
 */
const addFooterNote = () => {
  const contentInfo = document.querySelector("div[role=contentinfo]");
  const footerNote = document.createElement("p");
  footerNote.classList.add("footer-note");
  footerNote.innerHTML =
    'Customized with ❤️ by the <a href="https://ethereum.org/" target="_blank">ethereum.org</a> team.';
  contentInfo.parentNode.insertBefore(footerNote, contentInfo.nextSibling);
};

/**
 * Updates the footer button icons via switching fa class
 */
const updateFooterButtonIcons = () => {
  const rightArrow = document.querySelector(".fa-arrow-circle-right")
  if (rightArrow) {
    rightArrow.classList.add("fa-caret-right")
    rightArrow.classList.remove("fa-arrow-circle-right")
  }
  const leftArrow = document.querySelector(".fa-arrow-circle-left")
  if (leftArrow) {
    leftArrow.classList.add("fa-caret-left")
    leftArrow.classList.remove("fa-arrow-circle-left")
  }
}

/**
 * Builds the header element for the website app
 */
const buildHeader = () => {
  const header = document.createElement("div");
  header.classList.add("unified-header");
  document.querySelector(`.${WRAPPER_CLASS}`).prepend(header);

  const innerHeader = document.createElement("div");
  innerHeader.classList.add("inner-header");
  header.appendChild(innerHeader);

  const homeLink = document.createElement("a");
  homeLink.classList.add("home-link");
  homeLink.href = REMIX_HOME_URL;
  homeLink.ariaLabel = "Remix project home";
  innerHeader.appendChild(homeLink);

  appendSvg(REMIX_LOGO_PATH, homeLink, REMIX_LOGO_CLASS);

  const skipToContent = document.createElement("a");
  skipToContent.classList.add("skip-to-content");
  skipToContent.href = "#content";
  skipToContent.innerText = "skip to content";
  innerHeader.appendChild(skipToContent);

  const navBar = document.createElement("nav");
  navBar.classList.add("nav-bar");
  innerHeader.appendChild(navBar);

  /**
   * type NavItem = { name: string } & ({ href: string } | { items: NavItem[] })
   */
  const linkElements = NAV_LINKS.map(({ name, href, items }) => {
    if (href) {
      const link = document.createElement("a");
      link.classList.add("nav-link");
      link.setAttribute("key", name);
      link.setAttribute("href", href);
      link.setAttribute("aria-label", name);
      link.innerText = name;

      href === REMIX_DOCS_URL && link.classList.add("active");
      if (href.startsWith("http") && href !== REMIX_HOME_URL) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }

      return link;
    }
    // Learn menu dropdown
    if (items) {
      const dropdown = document.createElement("div");
      dropdown.classList.add("nav-dropdown");
      dropdown.setAttribute("key", name);

      // Return button, styled the same as the other links, with a chevron icon
      const button = document.createElement("button");
      button.classList.add("nav-link");
      button.classList.add("dropdown-button");
      button.id = "dropdown-button";
      button.innerText = name;
      button.setAttribute("key", name);
      button.setAttribute("aria-label", name);
      button.setAttribute("aria-haspopup", "true");
      button.setAttribute("aria-expanded", "false");
      button.onclick = toggleDropdown;
      appendSvg(CHEVRON_DOWN_PATH, button, "chevron-icon");

      const dropdownItemsBox = document.createElement("div");
      dropdownItemsBox.classList.add("dropdown-items");
      dropdown.appendChild(button);
      dropdown.appendChild(dropdownItemsBox);

      const dropdownItems = items.map(({ name, href }) => {
        const item = document.createElement("a");
        item.classList.add("dropdown-item");
        item.setAttribute("key", name);
        item.setAttribute("href", href);
        item.setAttribute("aria-label", name);
        if (href.startsWith("http")) {
          item.setAttribute("target", "_blank");
          item.setAttribute("rel", "noopener noreferrer");
        }
        item.innerText = name;
        appendSvg(NE_ARROW_PATH, item, "external-link-icon")
        return item;
      });
      dropdownItems.forEach((item) => dropdownItemsBox.appendChild(item));
      return dropdown;
    }
  });
  linkElements.forEach((link) => navBar.appendChild(link));

  // Flex wrapper for color mode and mobile menu buttons
  const navButtonContainer = document.createElement("div");
  navButtonContainer.classList.add("nav-button-container");
  innerHeader.appendChild(navButtonContainer);

  // Add theme dropdown button
  const themeButtonWrapper = document.createElement("div");
  themeButtonWrapper.classList.add(THEME_BUTTON_WRAPPER_CLASS);
  navButtonContainer.appendChild(themeButtonWrapper);

  // Create the theme dropdown button
  const themeDropdownButton = document.createElement('button');
  themeDropdownButton.classList.add(THEME_BUTTON_CLASS);
  themeDropdownButton.setAttribute("type", "button");
  themeDropdownButton.setAttribute("aria-label", "Theme menu button");
  appendSvg(getIconFromMode(mode), themeDropdownButton, COLOR_TOGGLE_ICON_CLASS)
  themeButtonWrapper.appendChild(themeDropdownButton);
  
  // Create the dropdown menu
  const dropdownMenu = document.createElement('div');
  dropdownMenu.classList.add(THEME_DROPDOWN_MENU_CLASS); // .theme-dropdown-menu
  dropdownMenu.setAttribute("aria-expanded", "false");
  dropdownMenu.setAttribute("aria-label", "Toggle theme menu");

  COLOR_MODES.forEach(({ name, icon, value }) => {
    const dropdownItem = document.createElement('button');
    dropdownItem.classList.add('theme-dropdown-item');

    const label = document.createElement('span');
    label.textContent = name;
    dropdownItem.appendChild(label);

    const iconContainer = document.createElement('div');
    appendSvg(icon, iconContainer, 'mode-choice-icon');
    dropdownItem.appendChild(iconContainer);

    dropdownItem.onclick = () => {
      setColorMode(value)
      closeThemeMenu()
    };
    dropdownItem.setAttribute('key', value);

    dropdownMenu.appendChild(dropdownItem);
  });

  // Append the dropdown menu to the dropdown button
  themeButtonWrapper.appendChild(dropdownMenu);

  // Add event listeners to toggle aria-expanded attribute
  themeDropdownButton.addEventListener('click', () => {
    const isExpanded = dropdownMenu.getAttribute('aria-expanded') === 'true';
    dropdownMenu.setAttribute('aria-expanded', !isExpanded);
  });

  // Build mobile hamburger menu
  const menuButton = document.createElement("button");
  menuButton.classList.add("mobile-menu-button");
  menuButton.setAttribute("type", "button");
  menuButton.setAttribute("aria-label", "Toggle menu");
  menuButton.setAttribute("key", "menu button");
  menuButton.addEventListener("click", toggleMenu);
  appendSvg(HAMBURGER_PATH, menuButton, MOBILE_MENU_ICON_CLASS);
  navButtonContainer.appendChild(menuButton);
}

/**
 * Toggles the mobile menu.
 * @param {Object} options - The options object.
 * @param {boolean} options.force - forces the menu to open (true) or close (false).
 */
const toggleMenu = (options = {}) => {
  const handleClassToggle = ({ classList }, className) => {
    if (typeof options.force !== "undefined") {
      classList.toggle(className, options.force);
    } else {
      classList.toggle(className);
    }
  };
  document
    .querySelectorAll('[data-toggle="rst-versions"]')
    .forEach((e) => handleClassToggle(e, MOBILE_MENU_TOGGLE_CLASS));
  document
    .querySelectorAll('[data-toggle="wy-nav-shift"]')
    .forEach((e) => handleClassToggle(e, MOBILE_MENU_TOGGLE_CLASS));
  handleClassToggle(document.querySelector(`.${WRAPPER_CLASS}`), "menu-open");
}

/**
 * Updates the flyover menu by modifying the DOM elements.
 */
const updateFlyoverMenu = () => {
  const rtdVersion = document.querySelector(".rst-current-version");
  // Assign current label and caret elements to variables
  const rtdLabel = rtdVersion.querySelector(".fa.fa-book");
  rtdLabel.textContent = "RTD"; // Update label to RTD
  const caretDown = rtdVersion.querySelector(".fa.fa-caret-down");
  // Clear inner HTML of rtdVersion
  rtdVersion.innerHTML = "";
  // Append rtdLabel and caret to rtdVersion
  rtdVersion.appendChild(rtdLabel);
  rtdVersion.appendChild(caretDown);
  // Append new span with "Latest" label
  const latestSpan = document.createElement("span");
  latestSpan.textContent = "Latest";
  rtdVersion.appendChild(latestSpan);
}
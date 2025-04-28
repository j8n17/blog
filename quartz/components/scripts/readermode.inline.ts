let isReaderMode = false

const emitReaderModeChangeEvent = (mode: "on" | "off") => {
  const event: CustomEventMap["readermodechange"] = new CustomEvent("readermodechange", {
    detail: { mode },
  })
  document.dispatchEvent(event)
}

const handleScroll = () => {
  const firstH1 = document.querySelector(".breadcrumb-container");
  const firstH1Top = firstH1 ? firstH1.getBoundingClientRect().top + window.scrollY : 100;
  const scrolledToTop = window.scrollY <= firstH1Top;
  document.documentElement.toggleAttribute("scrolled-to-top", scrolledToTop);
};

document.addEventListener("nav", () => {
  const switchReaderMode = () => {
    isReaderMode = !isReaderMode
    const newMode = isReaderMode ? "on" : "off"
    document.documentElement.setAttribute("reader-mode", newMode)
    emitReaderModeChangeEvent(newMode)
  }

  for (const readerModeButton of document.getElementsByClassName("readermode")) {
    readerModeButton.addEventListener("click", switchReaderMode)
    window.addCleanup(() => readerModeButton.removeEventListener("click", switchReaderMode))
  }

  handleScroll();

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addCleanup(() => window.removeEventListener("scroll", handleScroll));

  // Set initial state based on path
  const currentPath = window.location.pathname
  const initialMode = currentPath.endsWith('/') ? "off" : "on";
  isReaderMode = initialMode === "on";
  document.documentElement.setAttribute("reader-mode", initialMode)
})

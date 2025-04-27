import { computePosition, flip, shift, Placement } from "@floating-ui/dom"
import { normalizeRelativeURLs } from "../../util/path"
import { fetchCanonical } from "./util"

const p = new DOMParser()
let activeAnchor: HTMLAnchorElement | null = null

// --- Helper Functions ---

/** Computes position and sets styles for the popover */
async function setPosition(
  anchorElement: HTMLElement,
  popoverElement: HTMLElement,
  isFootnote: boolean,
) {
  let placement: Placement

  if (isFootnote) {
    placement = 'top-start'
  } else {
    placement = 'bottom'
  }

  try {
    const { x, y } = await computePosition(anchorElement, popoverElement, {
      strategy: "fixed",
      placement: placement,
      middleware: [shift(), flip()],
    })
    Object.assign(popoverElement.style, {
      transform: `translate(${x.toFixed()}px, ${y.toFixed()}px)`,
    })
  } catch (e) {
    // ignore compute position errors (mostly happens when anchor is detached)
    console.warn(`Couldn't compute position for popover: ${popoverElement.id}`, e)
  }
}

/** Shows the popover, clearing any existing ones */
function showPopover(
  popoverElement: HTMLElement,
  anchorElement: HTMLAnchorElement,
) {
  clearActivePopover() // Clear any currently active popovers

  // Determine if it's a footnote popover
  const isFootnote = !!popoverElement.querySelector(".footnote-popover-inner")

  popoverElement.classList.add("active-popover")
  setPosition(anchorElement, popoverElement, isFootnote)

  // Scroll to hash logic (only relevant for non-footnote internal links)
  if (!isFootnote) {
    const hash = decodeURIComponent(anchorElement.hash)
    if (hash !== "") {
      const targetAnchor = `#popover-internal-${hash.slice(1)}`
      const popoverInner = popoverElement.querySelector(".popover-inner")
      if (popoverInner) {
        const heading = popoverInner.querySelector(targetAnchor) as HTMLElement | null
        if (heading) {
          // leave ~12px of buffer when scrolling to a heading
          popoverInner.scroll({ top: heading.offsetTop - 12, behavior: "instant" })
        }
      }
    }
  }
}

// --- Mouse Enter Handlers ---

/** Handles mouseenter for regular internal links (fetches content) */
async function mouseEnterHandler(this: HTMLAnchorElement) {
  const link = (activeAnchor = this)
  if (link.dataset.noPopover === "true") {
    return
  }

  const targetUrl = new URL(link.href)
  const hash = decodeURIComponent(targetUrl.hash)
  targetUrl.hash = ""
  targetUrl.search = ""
  const popoverId = `popover-${link.pathname}${hash.replace("#", "__")}`
  const prevPopoverElement = document.getElementById(popoverId)

  // dont refetch if there's already a popover
  if (!!document.getElementById(popoverId)) {
    showPopover(prevPopoverElement as HTMLElement, link)
    return
  }

  const response = await fetchCanonical(targetUrl).catch((err) => {
    console.error(err)
  })

  if (!response) return
  const [contentType] = response.headers.get("Content-Type")!.split(";")
  const [contentTypeCategory, typeInfo] = contentType.split("/")

  const popoverElement = document.createElement("div")
  popoverElement.id = popoverId
  popoverElement.classList.add("popover")
  const popoverInner = document.createElement("div")
  popoverInner.classList.add("popover-inner")
  popoverInner.dataset.contentType = contentType ?? undefined
  popoverElement.appendChild(popoverInner)

  switch (contentTypeCategory) {
    case "image":
      const img = document.createElement("img")
      img.src = targetUrl.toString()
      img.alt = targetUrl.pathname

      popoverInner.appendChild(img)
      break
    case "application":
      switch (typeInfo) {
        case "pdf":
          const pdf = document.createElement("iframe")
          pdf.src = targetUrl.toString()
          popoverInner.appendChild(pdf)
          break
        default:
          break
      }
      break
    default:
      const contents = await response.text()
      const html = p.parseFromString(contents, "text/html")
      normalizeRelativeURLs(html, targetUrl)
      // prepend all IDs inside popovers to prevent duplicates
      html.querySelectorAll("[id]").forEach((el) => {
        const targetID = `popover-internal-${el.id}`
        el.id = targetID
      })
      const elts = [...html.getElementsByClassName("popover-hint")]
      if (elts.length === 0) return

      elts.forEach((elt) => popoverInner.appendChild(elt))
  }

  // Check again if the popover was somehow created while fetching
  if (!!document.getElementById(popoverId)) {
    return
  }

  document.body.appendChild(popoverElement)
  if (activeAnchor !== this) {
    return
  }

  showPopover(popoverElement, link)
}

/** Handles mouseenter for footnote reference links */
function footnoteMouseEnterHandler(this: HTMLAnchorElement) {
  const link = (activeAnchor = this)
  const footnoteId = link.getAttribute("href")?.substring(1) // Get ID like "fn:1"
  if (!footnoteId) return

  const popoverId = `popover-${footnoteId}`
  const prevPopoverElement = document.getElementById(popoverId)

  // If popover already exists, just show it
  if (prevPopoverElement) {
    showPopover(prevPopoverElement, link)
    return
  }

  // Find the footnote definition element
  const footnoteDefElement = document.getElementById(footnoteId)
  if (!footnoteDefElement) {
    console.warn(`Footnote definition not found for ID: ${footnoteId}`)
    return
  }
  
  // Create popover elements
  const popoverElement = document.createElement("div")
  popoverElement.id = popoverId
  popoverElement.classList.add("popover", "footnote-popover")
  const popoverInner = document.createElement("div")
  popoverInner.classList.add("popover-inner", "footnote-popover-inner")

  // Clone the content of the footnote definition
  // We clone the children to avoid taking the <li> itself, just its content
  Array.from(footnoteDefElement.childNodes).forEach((node) => {
    popoverInner.appendChild(node.cloneNode(true))
  })

  // Avoid showing the backlink in the popover if it exists
  const backlink = popoverInner.querySelector('a[href^="#fnref:"]')
  if (backlink instanceof HTMLElement) {
    backlink.style.display = "none"
  }

  popoverElement.appendChild(popoverInner)
  document.body.appendChild(popoverElement)

  // Show the newly created popover
  showPopover(popoverElement, link)
}

/** Hides all active popovers */
function clearActivePopover() {
  activeAnchor = null
  const allPopoverElements = document.querySelectorAll(".popover")
  allPopoverElements.forEach((popoverElement) => popoverElement.classList.remove("active-popover"))
}

// --- Event Listener Setup ---

document.addEventListener("nav", () => {
  // Select both internal links and footnote references
  const links = [...document.querySelectorAll("a.internal, a[data-footnote-ref]")] as HTMLAnchorElement[]

  for (const link of links) {
    // Check if it's a footnote link
    if (link.dataset.footnoteRef !== undefined) {
      // Footnote link
      link.addEventListener("mouseenter", footnoteMouseEnterHandler)
      link.addEventListener("mouseleave", clearActivePopover)
      window.addCleanup(() => {
        link.removeEventListener("mouseenter", footnoteMouseEnterHandler)
        link.removeEventListener("mouseleave", clearActivePopover)
      })
    } else if (link.classList.contains("internal")) {
      // Regular internal link
      link.addEventListener("mouseenter", mouseEnterHandler)
      link.addEventListener("mouseleave", clearActivePopover)
      window.addCleanup(() => {
        link.removeEventListener("mouseenter", mouseEnterHandler)
        link.removeEventListener("mouseleave", clearActivePopover)
      })
    }
  }
})

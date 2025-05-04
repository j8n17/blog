import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default ((component: QuartzComponent) => {
  const Component = component
  const TabletOnly: QuartzComponent = (props: QuartzComponentProps) => {
    // Pass displayClass="tablet-only" to the wrapped component
    return <Component displayClass="tablet-only" {...props} />
  }

  // Copy properties from the wrapped component
  TabletOnly.displayName = component.displayName
  TabletOnly.afterDOMLoaded = component?.afterDOMLoaded
  TabletOnly.beforeDOMLoaded = component?.beforeDOMLoaded
  TabletOnly.css = component?.css
  return TabletOnly
}) satisfies QuartzComponentConstructor<QuartzComponent> 
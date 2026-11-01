// In-page anchors (#experience) must point at the home page when used on other routes.
export const rootHref = (href: string) => (href.startsWith('#') ? `/${href}` : href);
